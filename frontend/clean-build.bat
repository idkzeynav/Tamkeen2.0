@echo off
echo === Setting increased memory allocation ===
set NODE_OPTIONS=--max_old_space_size=8192

echo === Installing required babel plugin ===
call npm install --save-dev @babel/plugin-proposal-private-property-in-object

echo === Updating browserslist database ===
call npx update-browserslist-db@latest

echo === Starting optimized build ===
call npm run build

echo === Build process complete! ===