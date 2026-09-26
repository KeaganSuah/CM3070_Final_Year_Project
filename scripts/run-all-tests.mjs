// Runs the dependency-free Readis verification scripts used for report evidence.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tests = [
  ['logic smoke', 'scripts/logic-smoke.mjs'],
  ['API smoke', 'scripts/api-smoke.mjs'],
  ['security smoke', 'scripts/security-smoke.mjs'],
  ['performance smoke', 'scripts/performance-smoke.mjs']
];

function run([name, script]) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], { cwd: root, stdio: 'inherit' });
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${name} failed with exit code ${code}`)));
    child.on('error', reject);
  });
}

for (const test of tests) {
  console.log(`\n=== Running ${test[0]} ===`);
  await run(test);
}
console.log('\nALL READIS DEPENDENCY-FREE TEST SCRIPTS PASSED');
