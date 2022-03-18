const { Module } = require('module');
Module.builtinModules = [...Module.builtinModules, 'vscode'];

// https://yarnpkg.com/features/pnp#initializing-pnp
// @ts-ignore
require('../.pnp.cjs').setup();
