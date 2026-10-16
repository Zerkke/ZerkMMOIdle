const fs = require('fs');
const PATH = 'tests/domain/dungeons/engine.test.ts';
let c = fs.readFileSync(PATH, 'utf8');
const CRLF = c.includes('\r\n');
c = c.replace(/\r\n/g, '\n');
const old = "  advanceAfterKill, currentMonsterId, currentWave, elapsedMs,";
const neu = "  advanceAfterKill, currentMonsterId, elapsedMs,";
if (!c.includes(old)) { console.error('ERRO: anchor import nao encontrado'); process.exit(1); }
c = c.replace(old, neu);
const result = CRLF ? c.replace(/\n/g, '\r\n') : c;
fs.writeFileSync(PATH, result, 'utf8');
console.log('OK: test import corrigido');