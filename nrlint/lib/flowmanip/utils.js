/* utility functions for flow manipulation API */

module.exports = {
    genId: () => (1+Math.random()*0xFFFFFFFF).toString(16),
};
