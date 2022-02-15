const safeRandomArithmeticInteger = function* () {
    while (true) {
        let num = (Math.random() * Number.MAX_SAFE_INTEGER / 1000000000 /* Number.MAX_SAFE_INTEGER */).toFixed(0);
        if (Number.isSafeInteger(Number(num)) && Number.isInteger(Number(num))) {
            yield Number(num);
        }
    }
}

const safePositiveInteger = safeRandomArithmeticInteger;
const safeNegativeInteger = function* () {
    while (true) {
        let num = (Math.random() * Number.MIN_SAFE_INTEGER / 1000000000 /* Number.MAX_SAFE_INTEGER */).toFixed(0);
        if (Number.isSafeInteger(Number(num)) && Number.isInteger(Number(num))) {
            yield Number(num);
        }
    }
}

const safeRandomSignedInteger = function* () {
    while (true) {
        // Expand range from 0 to 1 into -1 to 1
        const rand = ((Math.random() * 2) - 1);
        let num;
        if (rand === 0) yield Number(0);
        else if (rand > 0) num = rand * Number.MAX_SAFE_INTEGER / 1000000000 /* Number.MAX_SAFE_INTEGER */;
        else if (rand < 0) num = rand * Number.MIN_SAFE_INTEGER;

        num = num.toFixed(0);
        if (Number.isSafeInteger(Number(num)) && Number.isInteger(Number(num))) {
            yield Number(num);
        }
    }
}

const safeRandomUnsignedInteger = safeRandomArithmeticInteger;

const randomFloat = function* () {
    while (true) {
        const rand = ((Math.random() * 2) - 1);
        if (rand === 0) yield Number(0);
        else if (rand > 0) yield Number(rand * Number.MAX_SAFE_INTEGER / 1000000000 /* Number.MAX_SAFE_INTEGER */);
        else if (rand < 0) yield Number(rand * Number.MIN_SAFE_INTEGER);
    }
}

module.exports = {
    safeRandomArithmeticInteger,
    safeRandomSignedInteger,
    safeRandomUnsignedInteger,
    randomFloat,
    safePositiveInteger,
    safeNegativeInteger
}
