const makeTests = require('./lib/makeTests');
const harness = require('./lib/harness');
const nl = require('numbers-logic');
const { safeRandomArithmeticInteger } = require('./lib/numberGenerators');


function testHarness() {
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

function testMakeTest() {
    console.log(nl.isPrime(3)); // returns true - but is that a prime number?
    console.log(nl.isPrime(4)); // returns false - but is that correct?

    
    const testIsPrime = makeTests(
        nl.isPrime,
        {
            // The testkit will test these values FIRST to make sure your input is returning your expected output.
            returns: {
                true: [[2], [3], [5], [7],],
                false: [[0], [1], [4], [6], [8], [9],]
            },
            // The testkit will then move onto performing programatic tests using the rules you have dictated for the input
            inputs: [
                {
                    type: Number,
                    generator: safeRandomArithmeticInteger,
                    // rules: ['> 0']
                }
            ],
            advanced: {
                // If you harness the function, you will get feedback that coresponds to every variable update inside the function, allowing an in-depth examination of the function if something is going wrong, like perhaps one of the functions inside your function is failing, and not your function directly.
                harness: false,
                iterations: 100,
                tests: [
                    {
                        input: [3],
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
                        input: [4],
                        result: [false],
                        // calls: [
                        //     {
                        //         fn: 'functionName',
                        //         with: [[-1, '-1', !true], [0, '0', false]],
                        //         returns: [false],
                        //         count: 2
                        //     }
                        // ]
                    }
                ]
            }
        }
    );

    console.log(testIsPrime.toString());

    try {
        const testOutput = testIsPrime();
        console.log('Function isPrime is running as expected');
        console.log(testOutput); // Returns input and result values;
    } catch (e) {
        console.error('Function isPrime is not running as expected');
        console.error(e);
    }
}
testMakeTest();