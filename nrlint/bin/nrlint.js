#!/usr/bin/env node

/* eslint no-process-exit: 0 */
const nopt = require('nopt');
const FlowSet = require('../lib/flowmanip').FlowSet;
const fs = require('fs');
const path = require('path');
const linter = require('../lib/linter');
const os = require('os');

const defaultConfigFile = path.join(os.homedir(), '.nrlintrc.js');

const knownOpts = {
    'help': Boolean,
    'config': [path],
};

const shortHands = {
    'h':['--help'],
    'c':['--config'],
};

const parsedArgs = nopt(knownOpts, shortHands, process.argv, 2);

if (parsedArgs.help) {
    console.log('Lint tool for Node-RED flow');
    console.log('Usage: nrlint [-h] flow.json');
    console.log('');
    console.log('Options:');
    console.log('  -h, --help            show this help');
    console.log('  -c, --config   FILE   use specified configuration');
    console.log('                        otherwise, use .nrlintrc.js');
    process.exit();
}

if (parsedArgs.argv.remain.length !== 1) {
    console.error('Error: no input file');
    process.exit(1);
}

// read configuration file
const configFile = parsedArgs.config ? parsedArgs.config : defaultConfigFile;
let config;
try {
    config = require(configFile);
    config.configFile = configFile;
} catch(err) {
    console.log(`Error loading settings file: ${parsedArgs.config}`);
    console.log(err);
    process.exit(1);
}

flowFile = parsedArgs.argv.remain[0];
console.log(`parsing ${flowFile}...`);

const flowstr = fs.readFileSync(flowFile);
const flowobj = JSON.parse(flowstr);

function printResult(res) {
    console.log(JSON.stringify(res, null, 2));
}

const result = linter.doLint(flowobj, config).then(printResult);

process.exitCode = 0;