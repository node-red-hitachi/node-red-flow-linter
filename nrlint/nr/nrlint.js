module.exports = (RED) => {
    function Node(n) {
        RED.nodes.createNode(this,n);
    }

    RED.nodes.registerType("nrlint", Node, {
        settings: {
            nrlint: {
                value: {},
                exportable: true
            }
        }
    });
};
