const fs = require('fs');
const PATH = 'src/services/game-services.ts';
let c = fs.readFileSync(PATH, 'utf8');
const CRLF = c.includes('\r\n');
c = c.replace(/\r\n/g, '\n');

const old = "        active: this.dungeonsService.getState().active ? { ...this.dungeonsService.getState().active } : null,";
const neu = "        active: this.dungeonsService.getState().active ? { ...this.dungeonsService.getState().active! } : null,";

if (!c.includes(old)) {
    console.error('ERRO: anchor active nao encontrado');
    process.exit(1);
}
c = c.replace(old, neu);

const result = CRLF ? c.replace(/\n/g, '\r\n') : c;
fs.writeFileSync(PATH, result, 'utf8');
console.log('OK: active non-null assertion');