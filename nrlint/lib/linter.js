
const FlowSet = require('./flowmanip').FlowSet;
const path = require('path');

const doLint = (flowobj, config) => {
    return new Promise((resolve, _reject) => {
        const afs = FlowSet.parseFlow(flowobj);

        let results = {};
        const rules = config.rules;
        if (Array.isArray(rules)) {
            results = rules.reduce((acc,cur) => {
                try {
                    const ruleMod = require(`nrlint-plugin-${cur.name}`);
                    const {context: newCxt, result: newRes} = ruleMod.check(afs, cur, acc.context);
                    return {
                        context: newCxt,
                        result: acc.result.concat([newRes])
                    };
                } catch (e) {
                    return {
                        context: acc.context,
                        result: acc.result.concat([{name:`${cur.name}`, error: e}])
                    };
                }
            }, {context: {}, result: []});
        }
        resolve(results);
    });
};

module.exports = {
    doLint: doLint
};