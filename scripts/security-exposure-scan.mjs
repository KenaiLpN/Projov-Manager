import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const maxBytes = 10 * 1024 * 1024;
const secretKey = /SECRET|PASSWORD|PASSWD|TOKEN|API_KEY|PRIVATE_KEY|DATABASE_URL|SMTP_PASS/i;
const placeholder = /^(?:dummy|example|changeme|change.me|replace.me|your[_ -]|test[_ -]|<)/i;

export function secretCandidates(entries) {
  const candidates = [];
  for (const [name, value] of Object.entries(entries)) {
    if (!secretKey.test(name) || typeof value !== 'string' || value.length < 8 || placeholder.test(value)) continue;
    const values = [value];
    if (name.endsWith('_URL')) {
      try {
        const password = decodeURIComponent(new URL(value).password);
        if (password.length >= 8 && !placeholder.test(password)) values.push(password);
      } catch { /* A non-URL secret still has its literal checked. */ }
    }
    const variants = new Set(values.flatMap((item) => [item, encodeURIComponent(item), JSON.stringify(item).slice(1, -1), Buffer.from(item).toString('base64')]));
    candidates.push({ name, variants: [...variants] });
  }
  return candidates;
}

// The result intentionally contains names/categories only, never matched text.
export function inspectContent(content, candidates) {
  const raw = Buffer.isBuffer(content) ? content.toString('utf8') : content;
  const inlineMaps = [...raw.matchAll(/sourceMappingURL=data:application\/json(?:;charset=utf-8)?;base64,([A-Za-z0-9+/=]+)/g)]
    .map((match) => Buffer.from(match[1], 'base64').toString('utf8'));
  const text = [raw, ...inlineMaps].join('\n');
  const secretNames = [...new Set(candidates.filter(({ variants }) => variants.some((value) => text.includes(value))).map(({ name }) => name))];
  const patterns = [
    ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
    ['aws-access-key', /\bAKIA[0-9A-Z]{16}\b/],
    ['github-token', /\bgh[pousr]_[a-zA-Z0-9]{30,}\b/],
    ['credential-url-review', /(?:mysql|postgres(?:ql)?|mongodb|mssql):\/\/[^\s"'<>:]+:[^\s"'<>@]+@/],
  ].filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  return { secretNames, patterns };
}

function walk(root, skip = new Set()) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (skip.has(entry.name) || entry.isSymbolicLink()) return [];
    const target = path.join(root, entry.name);
    return entry.isDirectory() ? walk(target, skip) : entry.isFile() ? [target] : [];
  });
}

export async function runScan({ root = projectRoot, history = true, artifact, origin } = {}) {
  const relative = (file) => path.relative(root, file).replaceAll('\\', '/');
  const git = (args, input) => execFileSync('git', args, { cwd: root, input, maxBuffer: 256 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] });
  const envFiles = [root, path.join(root, 'apps/api')].flatMap((directory) =>
    existsSync(directory) ? readdirSync(directory).filter((name) => /^\.env(?:\.|$)/.test(name) && !/example|sample|template/.test(name)).map((name) => path.join(directory, name)) : []);
  const candidates = envFiles.flatMap((file) => secretCandidates(parseEnv(readFileSync(file, 'utf8'))));
  const report = {
    createdAt: new Date().toISOString(),
    secretSources: envFiles.map(relative),
    secretNamesChecked: [...new Set(candidates.map(({ name }) => name))],
    scopes: {}, findings: [], errors: [], inlineSourceMaps: {},
    limitations: ['Exact matches cover current local secret values plus URL/JSON/base64 forms; unknown old or transformed secrets require independent review.', 'No authenticated business data is requested. Pattern findings require manual review; test credentials may be fixtures.'],
  };
  function inspect(scope, name, content) {
    report.scopes[scope] = (report.scopes[scope] || 0) + 1;
    if (content.toString().includes('sourceMappingURL=data:application/json')) report.inlineSourceMaps[scope] = (report.inlineSourceMaps[scope] || 0) + 1;
    const result = inspectContent(content, candidates);
    if (result.secretNames.length || result.patterns.length) report.findings.push({ scope, path: name, ...result });
  }
  function inspectFile(scope, file) {
    try {
      if (statSync(file).size > maxBytes) { report.errors.push({ scope, path: relative(file), reason: 'file-too-large' }); return; }
      inspect(scope, relative(file), readFileSync(file));
    } catch { report.errors.push({ scope, path: relative(file), reason: 'file-unreadable' }); }
  }
  const current = git(['ls-files', '--cached', '--others', '--exclude-standard', '-z']).toString().split('\0').filter(Boolean);
  for (const file of current) if (existsSync(path.join(root, file))) inspectFile('current-source', path.join(root, file));
  for (const file of walk(path.join(root, 'public'))) inspectFile('public', file);
  for (const file of walk(path.join(root, '.next/static'))) inspectFile('local-next-static', file);
  report.localSourceMaps = walk(path.join(root, '.next/static')).filter((file) => file.endsWith('.map')).map(relative);
  report.localBuildType = existsSync(path.join(root, '.next/BUILD_ID')) ? 'production' : 'development-or-incomplete';
  if (artifact) {
    const absoluteArtifact = path.resolve(artifact);
    const files = walk(absoluteArtifact, new Set(['node_modules', '.git', 'cache']));
    report.artifact = {
      root: absoluteArtifact,
      environmentFiles: files.filter((file) => /^\.env(?:\.|$)/.test(path.basename(file))).map((file) => path.relative(absoluteArtifact, file).replaceAll('\\', '/')),
      sourceMaps: files.filter((file) => file.endsWith('.map')).map((file) => path.relative(absoluteArtifact, file).replaceAll('\\', '/')),
      productionBuild: existsSync(path.join(absoluteArtifact, '.next/BUILD_ID')) || existsSync(path.join(absoluteArtifact, 'BUILD_ID')),
    };
    for (const file of files) inspectFile('production-artifact', file);
  }
  if (history) {
    const objects = git(['rev-list', '--objects', '--all']).toString().trim().split('\n').filter(Boolean).map((line) => {
      const firstSpace = line.indexOf(' ');
      return { id: firstSpace === -1 ? line : line.slice(0, firstSpace), name: firstSpace === -1 ? '(unnamed)' : line.slice(firstSpace + 1) };
    });
    const metadata = git(['cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)'], objects.map(({ id }) => id).join('\n') + '\n').toString().trim().split('\n');
    const blobs = metadata.flatMap((line, index) => {
      const [, type, size] = line.split(' ');
      if (type !== 'blob') return [];
      if (Number(size) > maxBytes) { report.errors.push({ scope: 'git-history', path: objects[index].name, reason: 'blob-too-large' }); return []; }
      return [objects[index]];
    });
    // Batches bound memory while avoiding thousands of process launches.
    for (let start = 0; start < blobs.length; start += 100) {
      const batch = blobs.slice(start, start + 100);
      const output = git(['cat-file', '--batch'], batch.map(({ id }) => id).join('\n') + '\n');
      let offset = 0;
      for (const item of batch) {
        const endHeader = output.indexOf(10, offset);
        const size = Number(output.subarray(offset, endHeader).toString().split(' ')[2]);
        const content = output.subarray(endHeader + 1, endHeader + 1 + size);
        inspect('git-history', `${item.name} (blob ${item.id.slice(0, 12)})`, content);
        offset = endHeader + 1 + size + 1;
      }
    }
  }
  if (origin) {
    const target = new URL(origin);
    const sameOrigin = target.origin;
    const maxResponse = 5 * 1024 * 1024;
    async function fetchPublic(url) {
      if (url.origin !== sameOrigin) return null;
      try {
        const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'ProSis-authorized-exposure-check/1.0' } });
        if (!response.ok || !response.body) { report.errors.push({ scope: 'http-public', path: url.pathname, reason: `http-${response.status}` }); return null; }
        const chunks = []; let size = 0;
        for await (const chunk of response.body) { size += chunk.length; if (size > maxResponse) throw new Error('response-too-large'); chunks.push(chunk); }
        const content = Buffer.concat(chunks).toString('utf8');
        inspect('http-public', url.pathname, content);
        return content;
      } catch { report.errors.push({ scope: 'http-public', path: url.pathname, reason: 'request-failed-or-response-too-large' }); return null; }
    }
    const html = await fetchPublic(target);
    const scripts = [...new Set([...html?.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi) || []].map((match) => match[1]))].slice(0, 25);
    for (const script of scripts) {
      const url = new URL(script, target);
      if (url.origin === sameOrigin && url.pathname.startsWith('/_next/static/')) await fetchPublic(url);
    }
    report.httpOrigin = sameOrigin;
    report.httpScriptLimit = 25;
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const value = (name) => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
  try {
    const result = await runScan({ history: !args.includes('--no-history'), artifact: value('--artifact'), origin: value('--origin') });
    console.log(JSON.stringify(result, null, 2));
    if (result.findings.some((finding) => finding.secretNames.length)) process.exitCode = 1;
  } catch { console.error('Security scan failed; error details withheld to avoid exposing credentials.'); process.exitCode = 2; }
}
