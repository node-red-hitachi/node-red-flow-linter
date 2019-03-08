/* config */

const utils = require('./utils.js');

/** Class for config node */
class Config {

    /**
     * constructor
     * @param {string} id 
     * @constructor
     */
    constructor(id) {
        this.id = id || utils.genId();
        this.type = "";
    }
};

module.exports = Config;
