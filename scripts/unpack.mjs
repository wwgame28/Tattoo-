import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

if (!existsSync('frameguide-full.tar.gz')) {
  throw new Error('frameguide-full.tar.gz not found');
}
execFileSync('tar', ['-xzf', 'frameguide-full.tar.gz', '-C', '.'], { stdio: 'inherit' });
console.log('FrameGuide sources unpacked');
