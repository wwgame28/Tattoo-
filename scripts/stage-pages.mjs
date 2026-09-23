import fs from 'node:fs';
for(const entry of fs.readdirSync('dist')){if(entry==='assets')continue;fs.cpSync('dist/'+entry,entry,{recursive:true})}
console.log('Production pages staged in repository root.');
