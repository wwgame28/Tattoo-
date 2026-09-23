import fs from 'node:fs';
import path from 'node:path';
const routes=['works','prices','about','process','faq','booking',...['floral','cathedral','snake','angel','rose','moon','tribal','stars'].map(s=>'works/'+s)];
const html=fs.readFileSync('dist/index.html','utf8');
for(const route of routes){fs.mkdirSync(path.join('dist',route),{recursive:true});fs.writeFileSync(path.join('dist',route,'index.html'),html)}
fs.writeFileSync('dist/404.html',html);fs.cpSync('assets','dist/assets',{recursive:true});
fs.writeFileSync('dist/.nojekyll','');
console.log(`Exported ${routes.length+1} route documents and local media.`);
