import { existsSync } from 'node:fs';
import { join } from 'node:path';

const output = join(process.cwd(), 'dist', 'client', 'ong_ong');
const required = [
  'index.html',
  join('_next', 'static'),
  join('map', 'index.html'),
  join('documents', 'index.html'),
  join('disclaimer', 'index.html'),
  join('images', 'theme', 'clockwork-harbour.svg'),
  join('fonts', 'barlow', 'Barlow-Regular.ttf'),
];

for (const path of required) {
  if (!existsSync(join(output, path))) {
    throw new Error(`Static export is incomplete: ${path}`);
  }
}
