/**
 * Chech size of each flow 
 * @param {FlowSet} afs complete flow set
 * @param {*} conf configuration for this rule. {name: "flowsize", maxSize: number }
 * @param {*} cxt context
 * @returns [{rule: "flowsize", ids: [flowid], name: "flowsize", severity: "warn", message: "too large flow size"}]
 */
function check(afs, conf, cxt) {
    const flows = afs.flows;
    const result = [];

    flows.forEach((flow) => {
        const nodes = [...flow];
        let maxSize = 100;
        if (conf.hasOwnProperty("maxSize")) {
            maxSize = conf.maxSize;
        }
        if (nodes.length > maxSize) {
            result.push({rule: "flowsize", ids: [flow], name: "flowsize", severity: "warn", message: "too large flow size" } );
        }
    }); 

    return {
        context: cxt,
        result: result
    };
}

module.exports = {
    check: check
};