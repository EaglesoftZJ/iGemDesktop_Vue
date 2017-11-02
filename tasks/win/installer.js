
const path = require('path');
const os = require('os');
const platform = os.platform();
const inno = require(`innosetup-compiler`);
const issTemplate32 = require(`./issTemplate32`);
const issTemplate64 = require(`./issTemplate64`);
const util = require(`../util`);
const pkgInfo = require('../../app/package.json');


var installer = function ()
{
  var self = this;

  self.appFileName32 = `${pkgInfo.name}-${platform}-ia32`;
  self.appFileName64 = `${pkgInfo.name}-${platform}-x64`;
  self.appIssPath32 = `.\\packages\\${self.appFileName32}.iss`;
  self.appIssPath64 = `.\\packages\\${self.appFileName64}.iss`;

  self.create = function ()
  {
    util.colFormat('Create ia32-iis...\n');
    new issTemplate32(self.appFileName32, self.appIssPath32);

    inno(self.appIssPath32, {}, function (err)
    {
      if (err)
      {
        util.colFormat(err, util.RED);
      }
      else
      {
        util.colFormat(`Success create win installer ia32`);
      }
    });

    util.colFormat('Create x64-iis...\n');
    new issTemplate64(self.appFileName64, self.appIssPath64);

    inno(self.appIssPath64, {}, function (err)
    {
      if (err)
      {
        util.colFormat(err, util.RED);
      }
      else
      {
        util.colFormat(`Success create win installer x64`);
      }
    });
  }
};


module.exports = installer;
