function getInputsForFunction(rootCodeBlock) {
    const input = [];
    let params;
    if (rootCodeBlock?.body?.[0]?.expression?.params) {
        params = rootCodeBlock.body[0].expression.params;
    } else {
        params = rootCodeBlock.body[0].params;
    }
    for (let param of params) {
        input.push(param.name);
    }
    return input;
}

module.exports = getInputsForFunction;
