import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function walk(dir) {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(entry => {
    const relative = `${dir}/${entry.name}`;
    return entry.isDirectory() ? walk(relative) : /\.(ts|tsx|mjs)$/.test(entry.name) ? [relative] : [];
  }).sort();
}
const groups = [
  ['Interface e lógica do navegador', 'src'],
  ['API e regras de negócio', 'apps/api/src'],
  ['Inicialização e verificações', 'scripts'],
  ['Testes', 'tests'],
];
let output = `# Mapa do código ProSis\n\nGerado em ${new Date().toISOString().slice(0,10)} por \`node scripts/generate-code-map.mjs\`. Inventário de arquivos, não uma certificação funcional de cada linha. Exclui dependências, builds, logs e segredos.\n\n`;
output += `## Por onde começar\n\n| Responsabilidade | Local |\n|---|---|\n| Navegação e telas | src/app; page.tsx define a página, layout.tsx envolve páginas |\n| Componentes reutilizáveis | src/components |\n| Estado e requisições reutilizáveis | src/hooks |\n| Chamadas HTTP e contratos de chamados | src/services |\n| Validação de respostas e utilitários | src/utils |\n| Sessão e CSP de navegação | src/middleware.ts |\n| API: registro, autenticação e HTTP | apps/api/src/server.ts |\n| API: endpoints e validação de entrada | apps/api/src/routes e schemas |\n| API: regras e acesso aos dados | apps/api/src/services |\n| Banco: modelos e relações | apps/api/prisma/schema.prisma |\n| Produção Hostinger | scripts/start-production.mjs e run-api-production.mjs |\n\n## Fluxo de uma alteração\n\n1. Localize a página e o componente. Identifique endpoint e contrato esperado.\n2. Siga a rota da API até o service e o modelo Prisma.\n3. Confirme autorização e schema de entrada antes de alterar gravações.\n4. Valide a resposta antes de atualizar estado.\n5. Rode testes e tipos; revise o diff; depois publique e homologue.\n\n`;
for (const [label,dir] of groups) {
  const files=walk(dir);
  output+=`## ${label} (${files.length} arquivos)\n\n| Arquivo | Linhas | Rotas declaradas |\n|---|---:|---|\n`;
  for (const file of files) {
    const source=fs.readFileSync(path.join(root,file),'utf8');
    const endpoints=dir==='apps/api/src' ? [...source.matchAll(/\.(get|post|put|patch|delete)\(\s*["']([^"']+)["']/g)].map(m=>`${m[1].toUpperCase()} ${m[2]}`) : [];
    output+=`| [${file}](../${file}) | ${source.split('\n').length} | ${endpoints.join('; ') || '—'} |\n`;
  }
  output+='\n';
}
output+=`## Documentos complementares\n\n- [Contexto atual](CONTEXTO_PROSIS.md)\n- [Refatoração verificada](plano-refatoracao.md)\n- [Segurança e pendências](auditoria-seguranca.md)\n- [Deploy Hostinger](hostinger-deploy.md)\n- [Alterações e validação desta revisão](REVISAO_2026-09-25.md)\n`;
fs.writeFileSync(path.join(root,'docs/MAPA_CODIGO.md'),output);
console.log('docs/MAPA_CODIGO.md atualizado.');
