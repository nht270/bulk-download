const path = require('node:path')

module.exports = {
  packagerConfig: {
    "icon": path.join(__dirname, "img", "sun_3d.ico"),
    "name": "Bulk Download",
    "ignore": [
      /^\/tsconfig\.json$/,
      /^\/db\.sqlite$/,
      /^\/app\.config\.json$/,
      /^\/download$/,
      /^\/src.*$/
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
