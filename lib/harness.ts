import { Program, parseScript } from "esprima";
import { generate } from "escodegen";
import { traverse, VisitorOption } from "estraverse";
import espurify from "espurify";
import { stringToFunction } from "./stringToFunction";
import { EventEmitter } from "stream";

export const harness = (fn: Function): Function => {
	makeSureGlobalThisHasEmitter();

	const fnString = fn.toString();
	let rootCodeBlock: Program = parseScript(fnString);

	try {
		(rootCodeBlock.body[0] as any).expression.body = [];
	} catch (e) {
		(rootCodeBlock.body[0] as any).body.body = [];
	}

	const variables: string[] = getVariablesFromFn(fnString);

	let codeBlocks = getCodeBlocks(fnString, variables);

	if ((rootCodeBlock?.body?.[0] as any)?.expression?.body) {
		(rootCodeBlock.body[0] as any).expression.body = codeBlocks;
	} else {
		(rootCodeBlock.body[0] as any).body.body = codeBlocks;
	}

	const genCode = generate(espurify(rootCodeBlock));
	return stringToFunction(genCode);
};

const makeSureGlobalThisHasEmitter = () => {
	if (!((globalThis as any)?.emitter as undefined)) {
		(globalThis as any).emitter = new EventEmitter();
	}
};

const getVariablesFromFn = (fnString: string): string[] => {
	let variables: Set<string> = new Set();
	try {
		let ast = parseScript(fnString);

		traverse(ast, {
			enter: function (node, parent) {
				if (
					node.type == "FunctionExpression" ||
					node.type == "FunctionDeclaration"
				) {
					return VisitorOption.Skip;
				}
			},
			// TODO: Add to this for any addition/subtraction from Sets or Push and Pop from/to an array.  Any anything else taht's going to be changing the content of a variable.
			leave: function (node, parent) {
				if (
					node.type == "MemberExpression" &&
					(node?.property as any)?.name == "push"
				) {
					variables.add((node.object as any).name);
				} else if (node.type == "VariableDeclarator") {
					variables.add((node.id as any).name);
				}
			},
		});
	} catch (e) {
		return Array.from(variables);
	}
	return Array.from(variables);
};

const requiredMethods = () => {
	return `const dPoint = ${dPoint.toString()}`;
};

const attachHarnessPoints = (code: string, variables: unknown[]) => {
	const vars = getVariablesFromFn(generate(code));
	const lines: Program[] = [];
	for (const value of vars) {
		if (variables.includes(value)) {
			lines.push(
				parseScript(`try {dPoint("${value}", ${value}); } catch (e) {}`)
			);
		}
	}
	return lines;
};

const dPoint = function (varName: string, varValue: unknown) {
	(globalThis as any).emitter.emit("dPoint", { varName, varValue });
};

function getCodeBlocks(fnString: string, variables: string[]) {
	let codeBlocks: Program[] = [];
	codeBlocks.push(parseScript(requiredMethods()));
	let codeChunks;
	if ((parseScript(fnString)?.body?.[0] as any)?.expression?.body) {
		codeChunks = (parseScript(fnString).body[0] as any).expression.body;
	} else {
		codeChunks = (parseScript(fnString).body[0] as any).body.body;
	}
	for (const code of codeChunks) {
		codeBlocks.push(code);
		codeBlocks.push(...attachHarnessPoints(code, variables));
	}
	return codeBlocks;
}
