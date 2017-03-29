/*
TODO:

#1 - DONE
CLONES
each chaining return partial application which I call clones

#2
LOOKAHEAD
every predicate will get a lookahead(index) method as parameter just before stopNow()
lookahead(index) will pause current loop and  start a new loop from current base index until it figure out prev_stage_result_array[index]. All values calculated during lookahead is cached for use in the main loop when resumed

NB: This can impact  performance. But I hope it won't be as bad as native
NB: This can impact memory use
NB: THIS IS NOT A REPLACEMENT FOR THE `index` AND `array` PARAMETERS PASSED WITH PREDICATE.

#3
INTERMEDIATE STATE CACHING
For implementing lookahead, it is required to cache every intermediate value. 
But the real catch is that during the final exec() call, a (useCache: boolean) parameter can be passed
This will cause the execution of every Clone to use cache from previous execution. 
		var i = streamy(arr).map( i=> i*2); 	//does nothing
		i.fill(9)  // does nothing
		var j = i.fill(5)  // does nothing
		j.fill(9)() // cache generated for `i` and `j`
		j(useCache:true)  // will simply return cached version of arr.map( i=> i*2).fill(5) 
		i(useCache:true)  // will simply return cached version of arr.map( i=> i*2)
		i() // will regenerate cache for `i`
*/

function streamy(array, sequence) {
	if (sequence && !Array.isArray(sequence)) throw new TypeError('Expected sequence to be an Array');
	sequence = sequence || [];
	var context = {
		array: array,
		sequence: sequence,
	}

	context.appendOperation = appendOperation.bind(context);
	const _exec = (arr) => {
		return exec( Array.isArray(arr) ? {array: arr, sequence: context.sequence,} : context );
	}
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

module.exports = streamy;

function exec(context) {
	var array = context.array;
	var arrayLen = array.length;
	var sequence = context.sequence;
	var seqLen = sequence.length;
	var result = [];
	var resultPointer = 0;
	var accumulate;
	var singleValue = false;
	var pass, skip, key, predicate, modifier, args;
	var stopIteration = false;
	var frugal = true; // frugal flag will break execution when stopNow() is called

	function stopNow() {
		stopIteration = frugal && true;
	}
	for (var i = 0; i < arrayLen; ++i, ++resultPointer) {
		pass = array[i]
		skip = false;
		for (var j = 0; j < seqLen; ++j) {

			// if(chainBreak) throw new TypeError('Non-iterable stages are not chainable');
			key = sequence[j][0]
			predicate = sequence[j][1]
			modifier = sequence[j][2]
			args = sequence[j][3]

			switch (key) {

				// case "fill":{
				// 	var st = args[2] || 0, end = args[3] || arrayLen;
				// 	if(st <= resultPointer && resultPointer < end)
				// 		pass = sequence[j][1]
				// 	break;
				// }
				case "filter": {
					if (!predicate.call(modifier, pass, i, array, stopNow)) {
						j = seqLen; // break after this iteration
						skip = true;
						resultPointer--;
					}
					break;
				}
				case "forEach": {
					frugal = false;	// frugal causes to stop iteration on stopNow(). this will affect foreach
					predicate.call(modifier, pass, i, array, stopNow)
					break;
				}
				case "map": {
					pass = predicate.call(modifier, pass, i, array, stopNow)
					break;
				}

				case "reduce": {
					j = seqLen; // break after this iteration
					skip = true;
					singleValue = true;
					if (resultPointer === 0) {
						if (args.length < 3) {
							accumulate = pass;
							break;
						}
						accumulate = modifier;
					}

					accumulate = predicate(accumulate, pass, i, array, stopNow)
					break;
				}
			}
		}
		if (!skip) result.push(pass);
		if (stopIteration) break;
	}

	if (singleValue) return accumulate;
	return result;
}

function appendOperation(key, predicate, modifier) {
	if (key === "reduce" && arguments.length < 3 && this.array.length == 0) {
		throw new TypeError('Reduce of empty array with no initial value');
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
	end = end || this.array.length
	return this.appendOperation("filter", (element, index, array, stopNow) => {
		if (index === end) stopNow();
		return (begin <= index && index < end)
	})
}

/*
*		Pseudo Reduce operations
*/
function everyReduce(predicate) {

	return this.appendOperation("reduce", (accumulator, currentValue, currentIndex, array) => {
		return accumulator && predicate(currentValue, currentIndex, array)
	}, true)
}
function findReduce(predicate) {

	return this.appendOperation("reduce", (accumulator, currentValue, currentIndex, array, stopNow) => {
		if (accumulator !== undefined) return accumulator;
		if (predicate(currentValue, currentIndex, array)) {
			stopNow();
			return currentValue
		}
	}, undefined)
}
function findIndexReduce(predicate) {

	return this.appendOperation("reduce", (accumulator, currentValue, currentIndex, array, stopNow) => {
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
	return this.appendOperation("reduce", (accumulator, currentValue, currentIndex, array) => accumulator + separator + currentValue)
}

function someReduce(predicate) {

	return this.appendOperation("reduce", (accumulator, currentValue, currentIndex, array, stopNow) => {
		if (predicate(currentValue, currentIndex, array)) {
			stopNow();
			return true;
		}
		return accumulator || false;
	}, false)
}