const fs = require('fs');
const path = require('path');

const foldersToDelete = [
  '.storybook/cache',
  'node_modules/.cache',
  'node_modules/.vite'
];

foldersToDelete.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
    console.log(`Deleted ${folder}`);
  }
});
