export function stringToFunction(fnString: string): Function {
    let evalFn = eval(`(${fnString})`);

    if (evalFn) return evalFn;
    throw new Error("Could not instantiate function");
};
