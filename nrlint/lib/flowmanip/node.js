/* node */
const utils = require('./utils.js');

/** Class for FMNode (incl. subflow instances) */
class FMNode {
    /**
     * constructor
     * @param {string} id - node id.
     */
    constructor(id) {
        this.id = id || utils.genId();
        this.type = "";
        this.x = 0;
        this.y = 0;
        this.wires = [];
    }

    /**
     * connect two nodes
     * @param {number} fromport - node port number of this node
     * @param {FMNode} nextnode - reference to next node
     */
    connectTo(fromport, nextnode) {
        this.wires[fromport].push(nextnode.id);
    }

    
    /**
     * unconnect designated node with the node
     * @param {number} fromport - portnumber. if -1, remove all occurrence of nextnode
     * @param {FMNode} nextnode 
     */
    unconnectTo(fromport, nextnode) {
        if (fromport == -1) {
            for (const i = 0; i < this.wires.length; i++) {
                this.wires[i] = this.wires[i].filter(w => w !== nextnode.id);
            }
        }
        if (this.wires[fromport]) {
            this.wires[fromport] = this.wires[fromport].filter(w => w !== nextnode.id);
        }
    }
};

module.exports = FMNode;