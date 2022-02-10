const esprima = require('esprima');
const escodegen = require('escodegen');
const estraverse = require('estraverse');
const espurify = require('espurify');

const parseFunction = (str) => {
    return eval(str);
}

const harness = (fn) => {
    const fnString = fn.toString();
    let rootCodeBlock = esprima.parseScript(fnString);
    rootCodeBlock.body[0].expression.body.body = [];

    const input = rootCodeBlock.body[0].expression.params;

    const variables = getVariablesFromFn(fnString);

    let codeBlocks = rootCodeBlock.body[0].expression.body.body;
    codeBlocks.push(esprima.parseScript(requiredMethods()));
    const codeChunks = esprima.parseScript(fnString).body[0].expression.body.body;
    for (const code of codeChunks) {
        codeBlocks.push(code);
        codeBlocks.push(
            ...attachHarnessPoints(code, variables)
        );
    }

    let genCode = escodegen.generate(espurify(rootCodeBlock));
    return parseFunction(genCode);
}

const getVariablesFromFn = (fnString) => {
    let variables = new Set();
    try {
        let ast = esprima.parseScript(fnString);

        estraverse.traverse(ast, {
            enter: function (node, parent) {
                if (node.type == 'FunctionExpression' || node.type == 'FunctionDeclaration') {
                    return estraverse.VisitorOption.Skip;
                }
            },
            // TODO: Add to this for any addition/subtraction from Sets or Push and Pop from/to an array.  Any anything else taht's going to be changing the content of a variable.
            leave: function (node, parent) {
                if (node.type == 'MemberExpression' && node?.property?.name == "push") {
                    variables.add(node.object.name);
                }
                else if (node.type == 'VariableDeclarator') {
                    variables.add(node.id.name);
                }
            }
        });
    } catch (e) {
        return Array.from(variables);
    }
    return Array.from(variables);
}

const requiredMethods = () => {
    return `const dPoint = ${dPoint.toString()}`;
}

const attachHarnessPoints = (code, variables) => {
    const vars = getVariablesFromFn(escodegen.generate(code));
    const lines = [];
    for (const value of vars) {
        if (variables.includes(value)) {
            lines.push(esprima.parseScript(`try {dPoint("${value}", ${value}); } catch (e) {}`));
        }
    }
    return lines;
}

const dPoint = function (varName, varValue) {
    console.log(varName, varValue);
}

exports.modules = {
    harness,
    dPoint,
}
