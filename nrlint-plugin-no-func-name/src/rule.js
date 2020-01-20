

function check (afs, conf, cxt) {
    var funcs = afs.getAllNodesArray()
        .filter(function (e) {return e.type==='function';})
        .map(function (e) {
            return {id:e.id, name:e.name};
        });
    var verified = funcs
        .filter(function (e) {return e.name === undefined || e.name === "";})
        .map(function (e){
            return {rule:"no-func-name", ids: [e.id], severity: "warn", name: "no-func-name", message: "function node has no name"};
        });

        return {context: cxt, result: verified};
}

module.exports = {
    check: check
};