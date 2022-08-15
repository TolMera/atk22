import * as esprima from "esprima";
import * as escodegen from "escodegen";
import * as estraverse from "estraverse";
import * as espurify from "espurify";
import { stringToFunction } from "./stringToFunction";
import { EventEmitter } from "stream";

export const harness = (fn: Function): Function => {
	makeSureGlobalThisHasEmitter();

	const fnString = fn.toString();
	let rootCodeBlock: esprima.Program = esprima.parseScript(fnString);

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

	const genCode = escodegen.generate(espurify(rootCodeBlock));
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
		let ast = esprima.parseScript(fnString);

		estraverse.traverse(ast, {
			enter: function (node, parent) {
				if (
					node.type == "FunctionExpression" ||
					node.type == "FunctionDeclaration"
				) {
					return estraverse.VisitorOption.Skip;
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
	const vars = getVariablesFromFn(escodegen.generate(code));
	const lines: esprima.Program[] = [];
	for (const value of vars) {
		if (variables.includes(value)) {
			lines.push(
				esprima.parseScript(`try {dPoint("${value}", ${value}); } catch (e) {}`)
			);
		}
	}
	return lines;
};

const dPoint = function (varName: string, varValue: unknown) {
	(globalThis as any).emitter.emit("dPoint", { varName, varValue });
};

function getCodeBlocks(fnString: string, variables: string[]) {
	let codeBlocks: esprima.Program[] = [];
	codeBlocks.push(esprima.parseScript(requiredMethods()));
	let codeChunks;
	if ((esprima.parseScript(fnString)?.body?.[0] as any)?.expression?.body) {
		codeChunks = (esprima.parseScript(fnString).body[0] as any).expression.body;
	} else {
		codeChunks = (esprima.parseScript(fnString).body[0] as any).body.body;
	}
	for (const code of codeChunks) {
		codeBlocks.push(code);
		codeBlocks.push(...attachHarnessPoints(code, variables));
	}
	return codeBlocks;
}
