
const config = require('../config');
const exec = require('child_process').exec;
const treeKill = require('tree-kill');
const util = require('./util');

let isElectronOpen = false;

let children = [];

var run = function (command, color, name)
{
  let child = exec(command);

  child.stdout.on('data', data =>
  {
    util.logFormat(name, data, color);

    if (/Compiled successfully/g.test(data.toString()) && !isElectronOpen)
    {
      util.colFormat(`Starting electron...\n`, util.BLUE);
      run(`${util.hotEnv} electron app/electron.js`, util.BLUE, 'electron');
      isElectronOpen = true;
    }
  });

  child.stderr.on('data', data => util.errFormat(name, data, color));
  child.on('exit', code => exit(code));

  children.push(child);
};

var exit = function (code)
{
  if (process.argv[2] == 'pack')
  {
    if (!isElectronOpen)
    {
      util.colFormat(`Starting electron...\n`, util.BLUE);
      run(`${util.packEnv} electron app/electron.js`, util.BLUE, 'electron');
      isElectronOpen = true;
    }
    else
    {
      children.forEach(child =>
      {
        treeKill(child.pid);
      });
    }
  }
  else
  {
    children.forEach(child =>
    {
      treeKill(child.pid);
    });
  }
};

if (process.argv[2] == 'dev')
{
  util.colFormat(`Starting webpack-dev-server...\n`, util.YELLOW);
  run(`${util.hotEnv} webpack-dev-server --inline --hot --colors --port ${config.port} --content-base app/dist`, util.YELLOW, 'webpack');
}
else if (process.argv[2] == 'pack')
{
  util.colFormat(`Starting webpack...\n`, util.YELLOW);
  run(`${util.packEnv} webpack --progress --colors --hide-modules`, util.YELLOW, 'webpack');
}
else if (process.argv[2] == 'electron')
{
  util.colFormat(`Starting electron...\n`, util.BLUE);
  run(`${util.packEnv} electron app/electron.js`, util.BLUE, 'electron');
  isElectronOpen = true;
}
else
{
  util.colFormat(`Nothing to do...\n`, util.YELLOW);
}
