
const FlowSet = require('./flowmanip').FlowSet;
const path = require('path');

const doLint = (flowobj, config) => {
    return new Promise((resolve, _reject) => {
        const afs = FlowSet.parseFlow(flowobj);

        const result = [];
        for (const r in config.rules) {
            if (config.rules.hasOwnProperty(r)) {
                const ruleMod = require(`nrlint-plugin-${r}`);
                Array.prototype.push.apply(result, ruleMod.check(afs, config.rules[r]));
            }
        }
        resolve(result);
    });
};

module.exports = {
    doLint: doLint
};