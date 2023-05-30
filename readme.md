### Description
A downloader to bulk download files by link list (json array or links separated by break line).
Recommend for small files as image, audio

### Run guide

Install packages in 'electron' and 'gui' folder, then run 'npm run dev' at both to run

### Build guide

1. Run 'npm run build' at 'gui' folder
2. Create new folder in 'electron' folder and named is 'gui'
3. Copy files in 'gui/dist' folder to new folder in 'electron' folder ('electron/gui')
3. Replace href, src attributes in html file of new folder from '/some-path' to './some-path'
4. Run 'npm run build' at 'electron' folder
5. Run 'npm run forge:package' or 'npm run forge:make' to packaging or make a distribute with output in 'out' folder in 'electron' folder.

Note: If occur error at step 5, maybe is miss requires of [node-gyp](https://www.npmjs.com/package/node-gyp), you can doing follow install guide of node-gyp at [here](https://www.npmjs.com/package/node-gyp#installation)