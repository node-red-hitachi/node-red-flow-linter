
const FlowSet = require('./flowmanip').FlowSet;
const path = require('path');

/**
 * Search rule definition plug-in:
 *  - Validation order is an appearance order in configuration object.
 *    - At first, it searches external plugins (to override built-in plugins)
 *    - Then, it searches built-in plugins
 *    - If plug-in is found, it returns 
 *    - If no plug-in is found, it returns undefined
 * @param {string} pluginName name of plugin  
 * @returns {object} module object or undefined
 */
function loadPlugin(pluginName) {
    // search globally installed module
    let name = `nrlint-plugin-${pluginName}`;
    let ruleMod = undefined;
    try {
        ruleMod = require(name);
        return ruleMod;
    } catch (_e) {
        name = `../rules/${pluginName}.js`;
        try {
            ruleMod = require(name);
            return ruleMod;
        } catch (_ee) {
            return undefined;
        }
    } 
}

/**
 * Verify flows based on configuration object
 * @param {object} flowobj Flows subject to verification 
 * @param {object} config  Configuration object. {"rules": [ {"name": ..., }], ... }
 * @returns 
 */
function doLint(flowobj, config) {
    return new Promise((resolve, _reject) => {
        const afs = FlowSet.parseFlow(flowobj);

        let results = {};
        const rules = config.rules;
        if (Array.isArray(rules)) {
            results = rules.reduce((acc,cur) => {
                const ruleMod = loadPlugin(cur.name);
                if (ruleMod) {
                    const {context: newCxt, result: newRes} = ruleMod.check(afs, cur, acc.context);
                    if (newRes.length > 0) {
                        return {
                            context: newCxt,
                            result: acc.result.concat(newRes)
                        };
                    } else {
                        return {
                            context: newCxt,
                            result: acc.result
                        };
                    }
                } else { // MODULE_NOT_FOUND
                    return {
                        context: acc.context,
                        result: acc.result.concat([{name:`${cur.name}`, error: "MODULE_NOT_FOUND"}])
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