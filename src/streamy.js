"use strict";

function streamy(array, sequence) {
	if (sequence && !Array.isArray(sequence)) throw new TypeError('Expected sequence to be an Array');
	sequence = sequence || [];
	var context = {
		array: array || [],
		sequence: sequence,
		chunk: { size: 0, position: 0 },
	}

	context.appendOperation = appendOperation.bind(context);
	const _exec = (arr) => {
		return exec( Array.isArray(arr) ? {array: arr, sequence: context.sequence, chunk: { size: 0, position: 0 },} : context );
	}

	// modifiers
	Object.defineProperty(_exec, "apply", { value: arr => { 
		if(context.array == arr) return _exec; 
		context.array = arr; 
		context.chunk = { size: 0, position: 0 };
		return _exec; 
	} })
	Object.defineProperty(_exec, "chunk", { value: size => { 
		context.chunk.size = size;
		return exec(context);
	 } })
	Object.defineProperty(_exec, "walk", { value: () => { 
		if(context.sequence[context.sequence.length-1][0] === "reduce")
			return _exec.chunk(1);
		return _exec.chunk(1)[0];
	 } })
	Object.defineProperty(_exec, Symbol.iterator, { value: () => ({ 
		next: () => {
			if(context.chunk.position == context.array.length) return {done: true}
			return {done: false, value:_exec.walk(1) };
		}
	 }) })

	//primary ops
	Object.defineProperty(_exec, "filter", { value: appendOperation.bind(context, "filter") })
	Object.defineProperty(_exec, "forEach", { value: appendOperation.bind(context, "forEach") }) //pass through
	Object.defineProperty(_exec, "map", { value: appendOperation.bind(context, "map") })
	Object.defineProperty(_exec, "reduce", { value: context.appendOperation.bind(context, "reduce") })

	//non chainable

	Object.defineProperty(_exec, "every", { value: everyReduce.bind(context) })
	Object.defineProperty(_exec, "find", { value: findReduce.bind(context) })
	Object.defineProperty(_exec, "findIndex", { value: findIndexReduce.bind(context) })
	Object.defineProperty(_exec, "join", { value: joinReduce.bind(context) })
	Object.defineProperty(_exec, "some", { value: someReduce.bind(context) })

	// chainable

	Object.defineProperty(_exec, "fill", { value: fillMap.bind(context) })
	Object.defineProperty(_exec, "slice", { value: sliceFilter.bind(context) })

	// keys() | values()
	return _exec

}

function exec(context) {
	
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
	
	var i=0, j=0;
	if(!context.chunk.size || context.chunk.position == arrayLen) {

		context.chunk.position =  0 
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
	for ( i ; i < arrayLen; ++i) {
		pass = array[i]
		skip = false;
			
		if( context.chunk.size 
		&& typeof stageIndex[seqLen - 1] != "undefined" 
		&& (context.chunk.position + context.chunk.size) == stageIndex[seqLen - 1]+1) break;
		for ( j = 0; j < seqLen; ++j) {

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

function appendOperation(key, predicate, modifier) {
	if (key === "reduce" && arguments.length < 3 && this.array.length == 0) {
		throw new TypeError('Reduce of empty array with no initial value');
	}
	else if ( this.sequence.length && this.sequence[this.sequence.length-1][0] === "reduce"){
		throw new TypeError('Non-iterable stages are not chainable');
	}
	let sequence = this.sequence.slice()
	sequence.push([key, predicate, modifier, arguments])
	return streamy(this.array, sequence); //*/ this.exec;
}
/*
*		Pseudo Map operations
*/
function fillMap(value, start, end) {
	start = start || 0
	end = end || this.array.length
	return this.appendOperation("map", (element, index) => (start <= index && index < end) ? value : element)
}

/*
*		Pseudo Filter operations
*/
function sliceFilter(begin, end) {
	begin = begin || 0
	// end = end || this.array.length
	return this.appendOperation("filter", (element, index, stopNow) => {
		if (index === end) stopNow();
		return (begin <= index && (!end || index < end))
	})
}

/*
*		Pseudo Reduce operations
*/
function everyReduce(predicate) {

	return this.appendOperation("reduce", (accumulator, currentValue, currentIndex) => {
		return accumulator && predicate(currentValue, currentIndex)
	}, true)
}
function findReduce(predicate) {

	return this.appendOperation("reduce", (accumulator, currentValue, currentIndex, stopNow) => {
		if (accumulator !== undefined) return accumulator;
		if (predicate(currentValue, currentIndex)) {
			stopNow();
			return currentValue
		}
	}, undefined)
}
function findIndexReduce(predicate) {

	return this.appendOperation("reduce", (accumulator, currentValue, currentIndex, stopNow) => {
		if (accumulator > -1) return accumulator;
		if (predicate(currentValue, currentIndex, array)) {
			stopNow();
			return currentIndex
		}
		return -1;
	}, -1)
}

function joinReduce(separator) {
	separator = separator === undefined ? "," : String(separator)
	return this.appendOperation("reduce", (accumulator, currentValue) => accumulator + separator + currentValue)
}

function someReduce(predicate) {

	return this.appendOperation("reduce", (accumulator, currentValue, currentIndex, stopNow) => {
		if (predicate(currentValue, currentIndex)) {
			stopNow();
			return true;
		}
		return accumulator || false;
	}, false)
}

module.exports = streamy;
