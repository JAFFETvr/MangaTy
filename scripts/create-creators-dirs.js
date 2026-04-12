const fs = require('fs');
const path = require('path');

const base = 'c:/Users/Pan3s/Downloads/AppMangaTy/appMangaTy/src/features/creators';
const dirs = [
  'domain/entities',
  'domain/repositories',
  'domain/use-cases',
  'data/datasources',
  'data/repositories',
  'presentation/components',
  'presentation/view-models'
];

dirs.forEach(d => {
  const p = path.join(base, d);
  fs.mkdirSync(p, { recursive: true });
  console.log('✓', p);
});

console.log('\n✅ All directories created!');
