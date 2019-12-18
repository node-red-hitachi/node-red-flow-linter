/** index */
const flowSet = require('./flowset.js');
const fmNode = require('./node.js');
const fmFlow = require('./flow.js');
const fmSubFlow = require('./subflow.js');

/** @todo create external i/f definition */

module.exports = {
    FlowSet: flowSet,
    FMNode: fmNode,
    FMFlow: fmFlow,
    FMSubFlow: fmSubFlow
};
