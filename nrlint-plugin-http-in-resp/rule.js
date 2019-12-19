/* Does HTTP-in node has corresponding HTTP-response node? */
 
function check (afs, conf, cxt) {
    const danglingHttpIns = afs.getAllNodesArray()
        .filter(e => e.type === 'http in')
        .filter(e => {
            const ds = afs.downstream(e.id);
            return ds.length === 0 || ds.every(i => afs.getNode(i).type != 'http response');
        })
        .map(e => ({rule:"http-in-resp", ids: [e.id], info: "dangling http-in node"}));

    const danglingHttpResponses = afs.getAllNodesArray()
        .filter(e => e.type==='http response')
        .filter(e => {
            const ds = afs.upstream(e.id);
            return ds.length === 0 || ds.every(i => afs.getNode(i).type != 'http in');
        })
        .map(e => ({rule:"http-in-resp", ids: [e.id], info: "dangling http-response node"}));

    return {context: cxt, result: danglingHttpIns.concat(danglingHttpResponses)};
}

module.exports = {
    check: check
};