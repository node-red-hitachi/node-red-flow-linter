/* 
 * flow linter plugin for loop detection 
 */
function isLooped(path) { // does a node id appears multiple times ?
    return path.map(e => path.filter(f => f === e).length).some(e => e >= 2);
}

function isSubset(array1, array2) {  // is an array1 a subset of an array2 ?
    return array1.every(e => array2.includes(e)) && !array2.every(e => array1.includes(e));
}

function isSameLoop(array1, array2) {
    return array1.every(e => array2.includes(e)) && array2.every(e => array1.includes(e));
}

/**
 * enumerate loops in flows
 * @param {FlowSet} afs FlowSet
 * @returns {string[][]}Array of loops 
 */
function enumLoops(afs) {
    let loops = [];
    let allNodes = afs.getAllNodesArray().map(n => n.id); 

    allNodes.forEach((nid) => { // traverse a flow from nid 
        let visitingPaths = [[ nid ]];
        while (visitingPaths.length > 0) {
            visitingPaths = visitingPaths.reduce((acc, cur) => {
                const nextHops = afs.next(cur[cur.length-1]);
                if (nextHops.length > 0) {
                    const nextPaths = nextHops.map(e => cur.concat(e));
                    nextPaths.forEach(path => {if (isLooped(path)) { loops.push(path); }});
                    return acc.concat(nextPaths.filter(path => !isLooped(path)));
                } else {
                    return acc;
                }
            }, []);
        }
    });
    // eliminate duplication of loops
    const uniqLoops = loops
        .reduce((acc,cur) => {   // elimination of identical paths
            if (acc.some(e => isSameLoop(e,cur))) {
                return acc;
            } else {
                return acc.concat([cur]);
            }
        },[])
        .filter(path => loops.every(e => !isSubset(e, path))) // extract minimum loop element

    return uniqLoops;
}


function check(afs, conf, cxt) {
    const loops = enumLoops(afs);

    return {
        context: cxt,
        result: loops.map(l => {return {rule: "loop", ids: l, severity: "warn", name: "loop", message: "possible infinite loop detected"};})
    };
}

module.exports = {
    check: check
};