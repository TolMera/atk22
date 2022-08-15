export const safeRandomArithmeticInteger = function* () {
	while (true) {
		let num = (
			(Math.random() * Number.MAX_SAFE_INTEGER) /
			1000000000
		) /* Number.MAX_SAFE_INTEGER */
			.toFixed(0);
		if (Number.isSafeInteger(Number(num)) && Number.isInteger(Number(num))) {
			yield Number(num);
		}
	}
};

export const safePositiveInteger = safeRandomArithmeticInteger;
export const safeNegativeInteger = function* () {
	while (true) {
		let num = (
			(Math.random() * Number.MIN_SAFE_INTEGER) /
			1000000000
		) /* Number.MAX_SAFE_INTEGER */
			.toFixed(0);
		if (Number.isSafeInteger(Number(num)) && Number.isInteger(Number(num))) {
			yield Number(num);
		}
	}
};

export const safeRandomSignedInteger = function* () {
	while (true) {
		// Expand range from 0 to 1 into -1 to 1
		const rand = Math.random() * 2 - 1;
		let num: number =
			(rand * Number.MAX_SAFE_INTEGER) /
			1000000000; /* Number.MAX_SAFE_INTEGER */
		if (rand === 0) yield Number(0);
		else if (rand < 0) num = rand * Number.MIN_SAFE_INTEGER;

		num = Number(num.toFixed(0));
		if (Number.isSafeInteger(num) && Number.isInteger(num)) {
			yield num;
		}
	}
};

export const safeRandomUnsignedInteger = safeRandomArithmeticInteger;

export const randomFloat = function* () {
	while (true) {
		yield Math.random() * 2 - 1;
	}
};
