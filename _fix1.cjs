const fs = require('fs');
const PATH = 'src/services/dungeons-service.ts';
let c = fs.readFileSync(PATH, 'utf8');
const CRLF = c.includes('\r\n');
c = c.replace(/\r\n/g, '\n');
const old = "  recordKill(nowMs: number): {";
const neu = "  recordKill(_nowMs: number): {";
if (!c.includes(old)) { console.error('ERRO: anchor recordKill nao encontrado'); process.exit(1); }
c = c.replace(old, neu);
const result = CRLF ? c.replace(/\n/g, '\r\n') : c;
fs.writeFileSync(PATH, result, 'utf8');
console.log('OK: dungeons-service nowMs -> _nowMs');