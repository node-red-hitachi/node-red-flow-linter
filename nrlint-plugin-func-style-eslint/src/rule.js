var Linter = require('eslint4b');
var linter = new Linter();

function check(afs, conf, cxt) {
    var funcs = afs.getAllNodesArray()
        .filter(function (e) {return e.type==='function';})
        .map(function (e) {
            return {id:e.id, func:e.func};
        });
    var verified = funcs
        .map(function (e) {
            var f = "function dummy(msg) {\n" + e.func + "\n};";
            var result = linter.verify(f, {rules: conf});
            return (result.length == 0 ? {} : {rule:"func-style-eslint", ids: [e.id], info:{func:e.func, option: result}});
        })
        .filter(function (e) {return e.hasOwnProperty("rule");});
    return {context:cxt, result: verified};
}

module.exports = {
    check: check,
};