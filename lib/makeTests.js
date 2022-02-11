/*
 *   // Example code for expectation below

    const atk = require('atk22');
    const nl = require('numbers-logic').NumberTools;

    nl.isPrime(3); // returns true - but is that a prime number?
    nl.isPrime(4); // returns false - but is that correct?

    // const atkIsPrime = atk.harness(nl.isPrime);
    const testIsPrime = atk.makeTests(
        isPrime,
        {
            // The testkit will test these values FIRST to make sure your input is returning your expected output.
            returns: {
                true: [[2], [3], [5], [7], ],
                false: [[0], [1], [4], [6], [8], [9], ]
            },
            // The testkit will then move onto performing programatic tests using the rules you have dictated for the input
            inputs: [
                // Arg 1
                {
                    // Uses ML to apply the rules, range and type to give a representative sample of possible inputs.
                    type: Number
                    // Rules are EVAL-uated
                    generator: generatorFn,
                    rules: ['> 0']
                },
                // Arg 2
                {
                    type: String,
                    generator: generatorFn,
                    rules: ['!== ""', "Number($val) == $val"]
                },
                // Arg 3 et-al.
                {value:NULL},
                {value:undefined},
                {value:false},
                {value:true},
                {value:"a string"},
                // number et-al.
                {value:0},
                {value:1},
                {value:2},
                {value:3},
            ],
            advanced: {
                // If you harness the function, you will get feedback that coresponds to every variable update inside the function, allowing an in-depth examination of the function if something is going wrong, like perhaps one of the functions inside your function is failing, and not your function directly.
                harness: false,
                iterations: 100,
                tests: [
                    {
                        input: [2],
                        result: [true],
                        calls: [
                            {
                                fn: 'functionName',
                                with: [[1,'1',true], [2,'2',!false]],
                                returns: [true],
                                count: 2
                            }
                        ]
                    },
                    {
                        input: [0],
                        result: [false],
                        calls: [
                            {
                                fn: 'functionName',
                                with: [[-1,'-1',!true], [0,'0',false]],
                                returns: [false],
                                count: 2
                            }
                        ]
                    }
                ]
            }
        }
    );

    try {
        const testOutput = testIsPrime();
        console.log('Function isPrime is running as expected');
        console.log(testOutput); // Returns input and result values;
    } catch (e) {
        console.error('Function isPrime is not running as expected');
    }
*/
const { on } = require("events");
const { EventEmitter } = require("stream");
const stringToFunction = require("./stringToFunction");

const makeTests = function (
    fn,
    params
) {
    this.output = [];
    // Executing this at config time, since it would suck to get an error elsewhere, that relates to the params you passed in to setting up this method.
    testParamInputsAreNotBroken(params);

    return () => {
        testFnWithUserExpectedReturns(params, fn);

        testFnWithParamsAdvancedTests(params, fn);

        // I need some complexity calulation that will tell me how complicated a function is, so I can estimate the right number of tests to run.  I can chose to run 'all' permutations of testing, but that might never end for some functions EG: isPrime would have an infinite number of permutations

        automatedTestingWithGeneratorsFromParamsInputs(params, fn);
    }
}
const automatedTestingWithGeneratorsFromParamsInputs = (params, fn) => {
    const fnArgs = makeGeneratorsAndFixedValsConsistent(params);
    for (let x = 0; x < params?.advanced?.iterations || 10; x++) {
        const thisLoopsArgs = getArgs(fnArgs);

        try {
            let dPoint = [];
            globalThis.emitter.on('dPoint', ((event) => {
                dPoint.push(event);
            }).bind(this));

            const realResult = fn(...thisLoopsArgs);

            globalThis.emitter.removeListener('dPoint');

            this.output.push({ result: realResult, dPoint });
        } catch (e) {
            throw new Error(`The function under test throws an error when passed the input ${fnArgs.toString()} - throws with ${e.message()}`);
        }
    }
}

const getArgs = (fnArgs) => {
    const thisLoopsArgs = [];
    for (let generator of fnArgs) {
        thisLoopsArgs.push(generator.next());
    }
    return thisLoopsArgs;
}

const makeGeneratorsAndFixedValsConsistent = (params) => {
    const fnArgs = [];
    // Make it consistent so there is no difference between a generator and a fixed value;
    for (let index in params.inputs) {
        if (params.inputs[index]?.generator) {
            fnArgs.push(params.inputs[index].generator());
        }
        else {
            fnArgs.push(function* () {
                while (true)
                    yield params.inputs[index].value;
            });
        }
    }
    return fnArgs;
}
const testParamInputsAreNotBroken = (params) => {
    for (const input of params.inputs) {
        /* {
            type: Number
            generator: generatorFn,
            rules: ['> 0']
        } OR {
            value: ....
        }*/
        const usesValue = Object.keys(input).includes('value');
        if (!usesValue
            && typeof input?.generator === 'function') {
            try {
                const gen = input.generator();
                // Testing the generator 10 times - probably not 'needed' but it might catch something.
                for (let x = 0; x < 10; x++) {
                    const test = gen();
                    testGeneratorAgainstRules(input, test);
                }
            } catch (e) {
            }
        } else {
            throw new Error("'Value' OR 'Generator' MUST be past to make use of params: {input: ... }");
        }
    }

}
const testGeneratorAgainstRules = (input, test) => {
    for (let rule of input.rules) {
        let testFnString = `(test) => {
                                if (test ${rule}) return true;
                                else return false;
                            }`;
        if (stringToFunction(testFnString)(!test)) {
            throw new Error("Generator output does not pass rules");
        }
    }
}
const testFnWithParamsAdvancedTests = (params, fn) => {
    let harnessed = false;
    for (let testset of params.advanced.tests) {
        if (testset.calls?.length > 0) {
            const harness = require('harness');
            // I think I nmeed to make dPoint assign it's output to the `this` parameter of the function, or something so that I can capture that output in a programatic way, not just output it to the console.  I would ideally like to be able to pipe the output of dPoint to an array or something, so I can examine it with code later.  Like I am going to need in order to implement this.
            fn = harness(fn);
            harnessed = true;
        }
        // Tests the function using the input the user provided.
        for (let result of params.returns) {
            for (let input of result) {
                const res = fn(...input);
                if (res.toString() !== result) {
                    throw new Error('Function returned an unexpected result');
                }
            }
        }
        testWithAdvancedParams(testset, fn);
    }
}
const testWithAdvancedParams = (testset, fn) => {
    for (let index in testset.input) {
        const input = testset.input[index];
        const expectedResult = testset.result[index];

        let throws;
        try {
            let dPoint = [];
            globalThis.emitter.on('dPoint', ((event) => {
                dPoint.push(event);
            }).bind(this));

            const realResult = fn(...input);
            if (expectedResult !== realResult) {
                throws = new Error('Advanced params for function returned an unexpected result');
            }

            globalThis.emitter.removeListener('dPoint');

            this.output.push({ result: realResult, dPoint });
        } catch (e) {
            throw new Error(`Function under test threw an error while using user provided inputs - Error: ${e.message()}`);
        }
        if (throws) throw throws;

        for (let called of testset.calls) {
            const fnCalled = fn.dPoint.map((value) => value.fn === called.fn);
            if (fnCalled.length !== called.count) {
                throw new Error('Advanced params for function did not process as expected, more or less calls to sub-function occurred');
            }
            for (let callIndex in called.with) {
                if (fnCalled[callIndex].with !== called.with[callIndex]) {
                    throw new Error('Advanced params for function did not process as expected, expected params were not used to call sub-function');
                }
            }
        }
        for (let dPoint of fn.dPoint) {
            dPoint.fn;
        }
    }
}
const testFnWithUserExpectedReturns = (params, fn) => {
    for (let result of params.returns) {
        console.log(result);
        for (let input of result) {
            console.log(input);
            const res = fn(...input);
            if (res.toString() !== result) {
                throw new Error('Function returned an unexpected result');
            }
        }
    }
}

module.exports = makeTests;
