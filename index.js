const harness = require('./lib/harness');

// Can the harness function harness itself?
const newFn = harness(harness);



console.log("guid: 6C93EC6F-56F6-4C40-8339-A835DA701A14", newFn.toString());
console.log("guid: 71223F43-BAC1-4738-9D5C-C93970717841", newFn(() => {}));
