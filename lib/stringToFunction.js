const esprima = require('esprima');
function stringToFunction(fnString) {
    let evalFn = eval(`(${fnString})`);

    if (evalFn) return evalFn;
    throw new Error("Could not instantiate function");
};

module.exports = stringToFunction;
