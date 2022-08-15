import * as nl from "numbers-logic";
import { harness } from "../lib/harness";
import { makeTests } from "../lib/makeTests";
import { safeRandomArithmeticInteger } from "../lib/numberGenerators";

export function testHarness() {
	const newFn = harness(nl.isPrime);

	for (let x = 0; x < 10; x++) {
		console.log(newFn(x));
	}
}

try {
	testHarness();
} catch (e) {
	console.error(e);
}

export function testMakeTest() {
	const testIsPrime = makeTests(nl.isPrime, {
		// The testkit will test these values FIRST to make sure your input is returning your expected output.
		returns: [
			[2, true],
			[3, true],
			[5, true],
			[7, true],
			[0, false],
			[1, false],
			[4, false],
			[6, false],
			[8, false],
			[9, false],
		],
		// The testkit will then move onto performing programatic tests using the rules you have dictated for the input
		inputs: [
			{
				type: Number,
				generator: safeRandomArithmeticInteger,
				// rules: ['> 0']
			},
		],
		advanced: {
			// If you harness the function, you will get feedback that coresponds to every variable update inside the function, allowing an in-depth examination of the function if something is going wrong, like perhaps one of the functions inside your function is failing, and not your function directly.
			harness: false,
			iterations: 5,
			tests: [
				{
					input: [[3]],
					result: [true],
					// calls: [
					//     {
					//         fn: 'functionName',
					//         with: [[1, '1', true], [2, '2', !false]],
					//         returns: [true],
					//         count: 2
					//     }
					// ]
				},
				{
					input: [[4]],
					result: [false],
					// calls: [
					//     {
					//         fn: 'functionName',
					//         with: [[-1, '-1', !true], [0, '0', false]],
					//         returns: [false],
					//         count: 2
					//     }
					// ]
				},
			],
		},
	});

	try {
		const testOutput = testIsPrime();
		console.log("Function isPrime is running as expected");
		console.log(testOutput); // Returns input and result values;
	} catch (e) {
		console.error("Function isPrime is not running as expected");
		console.error(e);
	}
}
testMakeTest();
