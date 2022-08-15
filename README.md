# atk22

JS/Node/ES - Advanced Test Kit 22

## Under Development

I'm writing a test kit that can be passed a function in Node, and using a series of tools, create tests for the code.

So for instance if you want to know that a function, like `isPrime` from `numbers-logic` on npm, is running correctly, you would do something like this:

```js
const atk = require("atk22");
const nl = require("numbers-logic").NumberTools;

nl.isPrime(3); // returns true - but is that a prime number?
nl.isPrime(4); // returns false - but is that correct?

// const atkIsPrime = atk.harness(nl.isPrime);
const testIsPrime = atk.makeTests(isPrime, {
	// The testkit will test these values FIRST to make sure your input is returning your expected output.
	returns: {
		true: [[2], [3], [5], [7]],
		false: [[0], [1], [4], [6], [8], [9]],
	},
	// The testkit will then move onto performing programatic tests using the rules you have dictated for the input
	input: [
		{
			// Uses ML to apply the rules, range and type to give a representative sample of possible inputs.
			type: [Number, String],
			// Rules are EVAL-uated
			rules: ["> 0"],
			range: ["0..10000"],
		},
	],
	advanced: {
		// If you harness the function, you will get feedback that coresponds to every variable update inside the function, allowing an in-depth examination of the function if something is going wrong, like perhaps one of the functions inside your function is failing, and not your function directly.
		harness: false,
	},
});

try {
	const testOutput = testIsPrime();
	console.log("Function isPrime is running as expected");
	console.log(testOutput); // Returns input and result values;
} catch (e) {
	console.error("Function isPrime is not running as expected");
}
```
