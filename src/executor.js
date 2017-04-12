"use strict";


module.exports = function (context) {


	var array = context.array;
	var arrayLen = array.length;
	var sequence = context.sequence;
	var seqLen = sequence.length - 1;
	var result = [];
	var singleValue = !!context.hasReduce;
	var pass, skip, key, predicate, modifier, args;
	var stopIteration = false;
	var accumulate;
	var stageIndex;
	var stepSize = 1
	var i = 0, j = 0, limit = arrayLen;

// pre-requisite checks before executing
	if( context.hasReduce && !context.hasReduceInit && !arrayLen) {
		throw new TypeError('reduce of empty array with no initial value');
		
	}
	if (context.chunk.size) {
		accumulate = context.chunk.accumulate
		stageIndex = context.chunk.stageIndex || [];
		i = context.chunk.position || 0
		limit = context.chunk.size + (context.chunk.skip || 0)
	} else {
		stageIndex = []
	}
	if(context.reverse){
		stepSize = -1
		 i = i >= arrayLen ? arrayLen - 1 : i
	} else {
		 i = i < 0 ? 0 : i		
	}

	var stopNow = context.hasForEach ? () => {} : () =>{ stopIteration = true;}; 
	
	for (i; i < arrayLen && limit && i >= 0; i = i + stepSize) {
		pass = array[i]
		skip = false;
		// if (context.chunk.size
		// 	&& typeof stageIndex[seqLen] != "undefined"
		// 	&& limit == stageIndex[seqLen] + 1) break;
		for (j = 0; j <= seqLen; ++j) {

			stageIndex[j] = stageIndex[j] === undefined ? -1 : stageIndex[j]
			stageIndex[j] += stepSize
			// if(chainBreak) throw new TypeError('Non-iterable stages are not chainable');
			key = sequence[j][0]
			predicate = sequence[j][1]
			modifier = sequence[j][2]
			args = sequence[j][3]

			switch (key) {

				case "filter": {
					if (!predicate.call(modifier, pass, stageIndex[j], stopNow)) {
						skip = true;
						limit++;
						j = seqLen; // break after this iteration
					}
					break;
				}
				case "forEach": {
					// frugal = false;	// frugal causes to stop iteration on stopNow(). this will affect foreach
					predicate.call(modifier, pass, stageIndex[j], stopNow)
					break;
				}
				case "map": {
					pass = predicate.call(modifier, pass, stageIndex[j], stopNow)
					break;
				}

				case "reduce": {
					skip = true;
					// singleValue = true;
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
		limit--;
		if(context.chunk.size && limit >= context.chunk.size) continue;
		if (!skip && !singleValue) result.push(pass);
		if (stopIteration) break;
	}

	if (context.chunk.size) {
		context.chunk.position = i
		context.chunk.accumulate = accumulate;
		context.chunk.stageIndex = stageIndex;
	} else {
		context.chunk = { size: 0, position: 0 }
	}
	context.chunk.size = 0
	context.reverse = false;

	if (singleValue) return accumulate;
	return result;
}