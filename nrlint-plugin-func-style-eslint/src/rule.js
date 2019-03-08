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
            return result.length == 0 ? {} : {rule:"func-style-eslint", id:e.id, func:e.func, result: result};
        })
        .filter(function (e) {e.hasOwnProperty("rule")});
    return verified;
}

module.exports = {
    check: check,
};