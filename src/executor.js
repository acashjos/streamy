"use strict";

module.exports = function (context) {

	var array = context.array;
	var arrayLen = array.length;
	var sequence = context.sequence;
	var seqLen = sequence.length;
	var result = [];
	var singleValue = false;
	var pass, skip, key, predicate, modifier, args;
	var stopIteration = false;
	var frugal = true; // frugal flag will break execution when stopNow() is called
	var accumulate;
	var stageIndex;

	var i = 0, j = 0;
	if (!context.chunk.size || context.chunk.position == arrayLen) {

		context.chunk.position = 0
		stageIndex = []
	}
	else {
		accumulate = context.chunk.accumulate
		stageIndex = context.chunk.stageIndex || [];
		i = context.chunk.position || 0
	}


	function stopNow() {
		stopIteration = frugal && true;
	}
	for (i; i < arrayLen; ++i) {
		pass = array[i]
		skip = false;

		if (context.chunk.size
			&& typeof stageIndex[seqLen - 1] != "undefined"
			&& (context.chunk.position + context.chunk.size) == stageIndex[seqLen - 1] + 1) break;
		for (j = 0; j < seqLen; ++j) {

			stageIndex[j] = stageIndex[j] === undefined ? -1 : stageIndex[j]
			stageIndex[j] += 1
			// if(chainBreak) throw new TypeError('Non-iterable stages are not chainable');
			key = sequence[j][0]
			predicate = sequence[j][1]
			modifier = sequence[j][2]
			args = sequence[j][3]

			switch (key) {

				case "filter": {
					if (!predicate.call(modifier, pass, stageIndex[j], stopNow)) {
						skip = true;
						// stageIndex[j]--;
						j = seqLen; // break after this iteration
					}
					break;
				}
				case "forEach": {
					frugal = false;	// frugal causes to stop iteration on stopNow(). this will affect foreach
					predicate.call(modifier, pass, stageIndex[j], stopNow)
					break;
				}
				case "map": {
					pass = predicate.call(modifier, pass, stageIndex[j], stopNow)
					break;
				}

				case "reduce": {
					skip = true;
					singleValue = true;
					if (stageIndex[j] === 0) {
						if (args.length < 3) {
							accumulate = pass;
							break;
						}
						accumulate = modifier;
					}
					accumulate = predicate(accumulate, pass, stageIndex[j], stopNow)
					j = seqLen; // break after this iteration
					break;
				}
			}
		}
		if (!skip) result.push(pass);
		if (stopIteration) break;
	}

	context.chunk.size = 0
	context.chunk.position = i
	context.chunk.accumulate = accumulate;
	context.chunk.stageIndex = stageIndex;

	if (singleValue) return accumulate;
	return result;
}