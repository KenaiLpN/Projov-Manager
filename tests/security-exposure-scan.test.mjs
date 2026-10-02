import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectContent, secretCandidates } from '../scripts/security-exposure-scan.mjs';

test('detects literal and encoded credentials without including values in its report', () => {
  const fixture = 'scan-fixture:ABC/123+XYZ';
  const candidates = secretCandidates({ JWT_SECRET: fixture, PORT: '3333' });
  for (const content of [fixture, encodeURIComponent(fixture), Buffer.from(fixture).toString('base64')]) {
    const result = inspectContent(content, candidates);
    assert.deepEqual(result.secretNames, ['JWT_SECRET']);
    assert.equal(JSON.stringify(result).includes(fixture), false);
    assert.equal(JSON.stringify(result).includes(content), false);
  }
});

test('checks a database password separately and ignores ordinary environment settings', () => {
  const candidates = secretCandidates({ DATABASE_URL: 'mysql://fixture:scan-password123@localhost/fixture', NEXT_PUBLIC_APP_NAME: 'Application', JWT_SECRET: 'changeme123' });
  assert.deepEqual(inspectContent('scan-password123', candidates).secretNames, ['DATABASE_URL']);
  assert.deepEqual(inspectContent('Application changeme123', candidates).secretNames, []);
});

test('pattern review returns categories without credential content', () => {
  const value = 'mysql://fixture:dummy@localhost/fixture';
  const result = inspectContent(value, []);
  assert.deepEqual(result.patterns, ['credential-url-review']);
  assert.equal(JSON.stringify(result).includes(value), false);
});

test('decodes inline source maps before comparing secret values', () => {
  const fixture = 'source-map-fixture-private123';
  const encoded = Buffer.from(JSON.stringify({ sourcesContent: [`prefix:${fixture}:suffix`] })).toString('base64');
  const result = inspectContent(`//# sourceMappingURL=data:application/json;charset=utf-8;base64,${encoded}`, secretCandidates({ JWT_SECRET: fixture }));
  assert.deepEqual(result.secretNames, ['JWT_SECRET']);
  assert.equal(JSON.stringify(result).includes(fixture), false);
});
