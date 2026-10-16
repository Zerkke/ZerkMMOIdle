const fs = require('fs');
const PATH = 'src/ui/activity-banner.ts';
let c = fs.readFileSync(PATH, 'utf8');
const CRLF = c.includes('\r\n');
c = c.replace(/\r\n/g, '\n');

// Remover o bloco inteiro da funcao renderIdle:
// desde o comentario "IDLE" ate (exclusive) ao comentario seguinte
const pattern = /\/\* ==================== IDLE ==================== \*\/[\s\S]*?(?=\/\* ==================== HELPERS)/;

if (!pattern.test(c)) {
  console.error('ERRO: bloco IDLE nao encontrado');
  process.exit(1);
}
c = c.replace(pattern, '');

const result = CRLF ? c.replace(/\n/g, '\r\n') : c;
fs.writeFileSync(PATH, result, 'utf8');
console.log('OK: funcao renderIdle removida');