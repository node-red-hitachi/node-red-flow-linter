'use strict';
/* complete flow set (corresponds to one "flow.json" file) */
const clone = require('clone');
const FMFlow = require('./flow.js');
const FMSubFlow = require('./subflow.js');
const FMNode = require('./node.js');
const FMConfig = require('./config.js'); 

/** Class for complete flow set */
class FlowSet {

    /**
     * constructor.
     * @constructor
     * @todo merge createModel() of index.js.
     */
    constructor() {
        this.flows = []; // [FMFlow]
        this.configs = []; // [FMConfig]
        this.subflows = []; // [FMSubFlow]
        this.links = []; //  [{source:, target:}]
    }

    /**
     * create FlowSet from a flow of other FlowSet
     * @param {FlowSet} source source FlowSet 
     * @param {id} id id of source flow. if null, all flows are copied.
     * @returns {FlowSet} copyied flows.
     */
    static copyFlow(source, flowid) {
        // TODO: implement
        let destfs;
        if (flowid) { // copy designated flow only 
            const f = source.flows.find(e => e.id === flowid);
            destfs.flows = [clone(f)];

            // subflow
            const sfids = f.reduce((acc, cur) => {
                if (cur.type) {
                    const sfid = /^subflow:(.+)$/.exec(cur.type);
                    if (sfid && !acc.includes(sfid)) { 
                        acc.push(sfid);
                    }
                }
                return acc;
            });
            destfs.subflows = clone(source.subflows.filter(e => sfids.includes(e.id)));
            destfs.configs = clone(source.configs);
            destfs.links = clone(source.links.filter(e => {
                (destfs.subflows.some(ee => ee.getNode(e.source)) || destfs.flows[0].getNode(e.source)) &&
                (destfs.subflows.some(ee => ee.getNode(e.target)) || destfs.flows[0].getNode(e.target));
            }));
        } else { // copy all flow
            destfs = clone(source);
        }

        return destfs;
    }

    /**
     * parseFlow (from JSON)
     * @param {Array} flowarray JSON.parse'ed Flowfile
     * @returns {FlowSet}
     */
    static parseFlow(flowarr) {
        const flowreg = {};
        flowreg.allNodes = {};
        flowreg.subflows = {};
        flowreg.configs = {};
        flowreg.flows = {};    // flows = tabs = workspaces
        flowreg.links = [];
        flowreg.errorNodes = new Set();
    
        flowarr.forEach((elem) => {
            flowreg.allNodes[elem.id] = clone(elem);
            if (elem.type === 'tab') {
                flowreg.flows[elem.id] = {
                    ...elem,
                    subflows:{},
                    configs: {},
                    nodes: {}
                };
            } else if (elem.type === 'subflow') {
                flowreg.subflows[elem.id] = {
                    ...elem,
                    configs: {},
                    nodes: {},
                    instances: []
                };
            }
        });
    
        const linkWires = {};
        const linkOutNodes = [];
        flowarr.forEach((elem) => {
            if (elem.type !== 'subflow' && elem.type !== 'tab') { // regular nodes (incl. subflow instances)
                const subflowDetails =  /^subflow:(.+)$/.exec(elem.type); // subflow instances ("subflow:xxxxx.xxxxx" where xxx.. is id of subflow)
                if (subflowDetails && !flowreg.subflows[subflowDetails[1]]) { // there is subflow instances, but no subflow itself.
                    flowreg.errorNodes.add(elem.type);
                }
                let container = null;
                if (flowreg.flows[elem.z]) {   // this node is contained in the flows[elem.z]
                    container = flowreg.flows[elem.z];
                } else if (flowreg.subflows[elem.z]) { // this node is contained in the subflow[elem.z]
                    container = flowreg.subflows[elem.z];
                }
                if (elem.hasOwnProperty('x') && elem.hasOwnProperty('y')) { // a node on UI
                    if (subflowDetails) { // subflow instances
                        const subflowId = subflowDetails[1]; // id of subflows
                        elem.subflow = subflowId; // link subflow instance to subflow
                        flowreg.subflows[subflowId].instances.push(elem); // link subflow to subflow instances
                    }
                    if (container) {
                        container.nodes[elem.id] = elem; // link container to elements
                    }
                } else { // config node
                    if (container) { // there is flow or subflow using this container
                        container.configs[elem.id] = elem;
                    } else { // global config
                        flowreg.configs[elem.id] = elem;
                        flowreg.configs[elem.id]._users = [];
                    }
                }
                if (elem.type === 'link in' && elem.links) { // link in node (receiver)
                    elem.links.forEach((id) => {
                        linkWires[id] = linkWires[id] || {}; // add empty object if not exist
                        linkWires[id][elem.id] = true; // "there is a link from id to elem.id"
                    });
                } else if (elem.type === 'link out' && elem.links) { // link out node (sender)
                    linkWires[elem.id] = linkWires[elem.id] || {};
                    elem.links.forEach((id) => {
                        linkWires[elem.id][id] = true;
                    });
                    linkOutNodes.push(elem);
                }
            }
        });
        // add "wires" property to link out node
        linkOutNodes.forEach((lon) => { //
            const links = linkWires[lon.id];
            const targets = Object.keys(links);  // all links from lon.id
            lon.wires = [targets];
        });
        for (const source of Object.keys(linkWires)) {
            for (const target of Object.keys(linkWires[source])) {
                if (linkWires[source][target]) {
                    flowreg.links.push({source: source, target: target});
                }
            }
        };
    
        const addedTabs = {};
        flowarr.forEach((elem) => {
            if (elem.type !== 'subflow' && elem.type !== 'tab') {
                const props = Object.keys(elem);
                props.forEach((prop) => {
                    if (prop !== 'id' &&
                    prop !== 'wires' &&
                    prop !== 'type' &&
                    prop !== '_users' &&
                    flowreg.configs.hasOwnProperty(elem[prop])) { // Using global config properties
                        flowreg.configs[elem[prop]]._users.push(elem.id); // link config to its user
                    }
                });
                if (elem.z && ! flowreg.subflows[elem.z]) { // this node belong to the subflows
                    if (!flowreg.flows[elem.z]) { // There is no tabs the node belongs.
                        flowreg.flows[elem.z] = { // explicitly add a tab.
                            type:'tab',
                            id:n.z,
                            subflows: {},
                            configs: {},
                            nodes: {}
                        };
                        addedTabs[elem.z] = flowreg.flows[elem.z];
                    }
                    if (addedTabs[elem.z]) {
                        if (elem.hasOwnProperty('x') && elem.hasOwnProperty('y')) { // regular node
                            addTabs[elem.z].nodes[elem.id] = elem;
                        } else { // config node
                            addTabs[elem.z].configs[elem.id] = elem;
                        }
                    }
                }
            }
        });
    
        flowarr.forEach((elem) => {
            if (elem.type !== 'subflow' && elem.type !== 'tab' &&
            elem.hasOwnProperty('x') && elem.hasOwnProperty('y')) {
                for (const port of elem.wires) {
                    for (const wire of port) {
                        flowreg.links.push({source: elem.id, target: wire});
                    }
                }
            }
        });

        // flowreg = internal format. so create object based on flow model
        const fs = new FlowSet();

        const flowIds = Object.keys(flowreg.flows);
        for (const fid of flowIds) {
            const f = new FMFlow(fid);
            f.name = flowreg.flows[fid].name;
            f.nodes = [...Object.values(flowreg.flows[fid].nodes)];
            fs.flows.push(f);
        }
        const configIds = Object.keys(flowreg.configs);
        for (const cid of configIds) {
            const c = new FMConfig(cid);
            fs.configs.push({...flowreg.configs[cid]});
        }
        const subflowIds = Object.keys(flowreg.subflows);
        for (const sfid of subflowIds) {
            const sf = new FMSubFlow(sfid);
            sf.name = flowreg.subflows[sfid].name;
            const nids = Object.keys(flowreg.allNodes);
            sf.nodes = nids.map(nid => flowreg.allNodes[nid]).filter(n => n.z === sfid);
            fs.subflows.push(sf);
        }
        fs.links = flowreg.links;

        return fs;
    }

    /**
     * generator.  to iterate over all node in this flowset.
     */
    * [Symbol.iterator]() {
        yield* this.flows.map(f=>[...f]).reduce((acc,val)=>acc.concat(val),[]);
        yield* this.subflows.map(s=>[...s]).reduce((acc,val)=>acc.concat(val),[]);
        yield* this.configs;
    }

    /**
     * generator in non-ES6 interface 
     * @param {*} nid 
     */
    getAllNodesArray() {
        return [...this];
    }

    /**
     * get node by id.  
     * @param {string} nid 
     * @return {FMNode} if not found, returns null.
     */
    getNode(nid) {
        const flownodes = this.flows.map(f => f.getNode(nid)).filter(n => n !== null);
        if (flownodes.length > 0) {
            return flownodes[0];
        } else {
            const confignodes = this.configs.map(c => c.getNode(nid)).filter(n => n !== null);
            if (confignodes.length > 0) {
                return confignodes[0];
            } else {
                const subflownodes = this.subflows.map(s => s.getNode(nid)).filter(n => n !== null);
                if (subflownodes.length > 0) {
                    return subflownodes[0];
                } else {
                    return null;
                }
            }
        }
    }
   
    /**
     * get flow node by id.
     * @param {string} fid id of flow node
     * @return {FMFlow} flow node or undefined if not found
     */
    getFlow(fid) {
        return this.flows.find(f => f.id === fid);
    }

    /**
     * get config node by id.
     * @param {string} cid id of config node
     * @returns {FMConfig} config node or undefined if not found
     */
    getConfig(cid) {
        return this.configs.find(c => c.id === cid);
    }

    /**
     * get subflow node instance
     * @param {string} sid id of subflow node
     * @returns {FMSubflow} subflow node (instance) or undefined if not found
     */
    getSubflow(sid) {
        return this.configs.find(s => s.id === sid);
    }

    /**
     * retrieve node ids that connected to designated node.
     * @param {string} nid 
     * @returns {string[]} list of Node ids.
     */
    prev(nid) {
        return this.flows.map(f => f.prev(nid)).reduce((acc, val) => acc.concat(val), []);
        // there is no wire in configs and subflows.
    }

    /**
     * retrieve node ids that connected from designated node.
     * @param {string} nid 
     * @returns {string[]} list of Node ids.
     */
    next(nid) {
        return this.flows.map(f => f.next(nid)).reduce((acc, val) => acc.concat(val), []);
    }

    /**
     * insert node
     * @param {FMNode} node - a node to be inserted
     * @param {number} wid - a node port to be connected
     * @param {string} pnid - id of the node in front of inserting node
     * @param {number} pport - port number of previous node
     * @param {string} nnid - id of the node after inserting node
     */
    insert(node, wid, pnid, pwid, nnid) {
        // TODO: preserve consistency in  

        // check whether node is not already connected.
        if (node.wires !== [] || this.prev(node.nid) !== []) {
            return false;
        }

        // check whether pnid and nnid are in same flow or subflow.
        const pnode = this.getNode(pnid);
        const nnode = this.getNode(nnid);
        if (pnode && nnode && pnode.z !== nnode.z) {
            return false;
        }

        // if condition is OK, insert the node.
        const container = this.getNode(pnode.z) || this.getNode(nnode.z);
        return container.insert(node, wid, pnid, pwid, nnid);
    }

    /**
     * remove node from FlowSet
     * @param {string} nid node id 
     */
    remove(nid) {
        const node = this.getNode(nid);
        const container = this.getNode(node.z);
        return container.remove(nid);
    }

    /**
     * Serialize the FlowSet instance
     * @param {string} format format string, "json-1", "json-2", "yaml-1" etc.  
     * @returns {string} serialized flow data
     */
    serialize(format) {
        // TODO: implement
    }

    /**
     * get connected nodes by id
     * @param {string} node id.
     * @returns {string[]} node id string
     */    
    connected(nid) {
        // TODO: use "links" for search
        let visitedNodes = [];
        let visitingNodes = [nid];
        while (visitingNodes.length > 0) {
            const nn = visitingNodes.shift();
            visitedNodes.push(nn);
            const unvisitedNeighbours = [...this.prev(nn), ...this.next(nn)]
                .filter(e=>visitedNodes.indexOf(e) < 0 && visitingNodes.indexOf(e) < 0)
                .reduce((acc,e)=>acc.indexOf(e)<0?[...acc, e]:acc, []); // uniq
            visitingNodes.push(...unvisitedNeighbours);
        }
        return visitedNodes;
    }

    /**
     * get downstream nodes by id
     * @param {string} nid node id
     * @returns {string[]} node ids 
     */
    downstream(nid) {
        let visitedNodes = [];
        let visitingNodes = [nid];
        while (visitingNodes.length > 0) {
            const nn = visitingNodes.shift();
            visitedNodes.push(nn);
            const unvisitedDownstream = [...this.next(nn)]
                .filter(e => visitedNodes.indexOf(e) < 0 && visitingNodes.indexOf(e) < 0)
                .reduce((acc,e) => acc.indexOf(e)<0?[...acc, e]:acc, []);
            visitingNodes.push(...unvisitedDownstream);
        }
        return visitedNodes;
    }

    /**
     * get upstream nodes by id
     * @param {string} nid node id
     * @returns {string[]} node ids 
     */
    upstream(nid) {
        let visitedNodes = [];
        let visitingNodes = [nid];
        while (visitingNodes.length > 0) {
            const nn = visitingNodes.shift();
            visitedNodes.push(nn);
            const unvisitedUpstream = [...this.prev(nn)]
                .filter(e => visitedNodes.indexOf(e) < 0 && visitingNodes.indexOf(e) < 0)
                .reduce((acc,e) => acc.indexOf(e)<0?[...acc, e]:acc, []);
            visitingNodes.push(...unvisitedUpstream);
        }
        return visitedNodes;
    }

    /**
     * analyse difference of two flow set
     * @param {FlowSet} comp FlowSet to be compared
     * @returns {Object} node ids of added, deleted, changed nodes
     */
    diff(comp) {
        // TODO: implement
        return null;
    }
};

module.exports = FlowSet;