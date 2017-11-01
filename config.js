'use strict'

const path = require('path')

let config = {
  // Name of electron app
  // Will be used in production builds
  name: 'igemdesk',

  // webpack-dev-server port
  port: 8080,

  // electron-packager options
  building: {
    arch: 'x64',
    asar: true,
    dir: path.join(__dirname, 'app'),
    icon: path.join(__dirname, 'app/icons/icon'),
    ignore: /^\/(shell|src|index\.ejs)/,
    prune: false,
    overwrite: true,
    win32metadata: {
      FileDescription: 'igemdesk',
    },
    platform: require('os').platform(),
    out: path.join(__dirname, 'packages'),
    extendInfo: {
      CFBundleDocumentTypes: [
      {
        CFBundleTypeExtensions: ['dat']
      }]
    },
  }
}

config.building.name = config.name

module.exports = config
