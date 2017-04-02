(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.streamy = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


function streamy(array, sequence) {
	if (sequence && !Array.isArray(sequence)) throw new TypeError('Expected sequence to be an Array');
	sequence = sequence || [];
	var context = {
		array: array,
		sequence: sequence
	};

	context.appendOperation = appendOperation.bind(context);
	var _exec = function _exec(arr) {
		return exec(Array.isArray(arr) ? { array: arr, sequence: context.sequence } : context);
	};
	//primary ops
	Object.defineProperty(_exec, "filter", { value: appendOperation.bind(context, "filter") });
	Object.defineProperty(_exec, "forEach", { value: appendOperation.bind(context, "forEach") }); //pass through
	Object.defineProperty(_exec, "map", { value: appendOperation.bind(context, "map") });
	Object.defineProperty(_exec, "reduce", { value: context.appendOperation.bind(context, "reduce") });

	//non chainable

	Object.defineProperty(_exec, "every", { value: everyReduce.bind(context) });
	Object.defineProperty(_exec, "find", { value: findReduce.bind(context) });
	Object.defineProperty(_exec, "findIndex", { value: findIndexReduce.bind(context) });
	Object.defineProperty(_exec, "join", { value: joinReduce.bind(context) });
	Object.defineProperty(_exec, "some", { value: someReduce.bind(context) });

	// chainable

	Object.defineProperty(_exec, "fill", { value: fillMap.bind(context) });
	Object.defineProperty(_exec, "slice", { value: sliceFilter.bind(context) });

	// keys() | values()
	return _exec;
}

module.exports = streamy;

function exec(context) {

	var array = context.array;
	var arrayLen = array.length;
	var sequence = context.sequence;
	var seqLen = sequence.length;
	var result = [];
	var accumulate;
	var singleValue = false;
	var pass, skip, key, predicate, modifier, args;
	var stopIteration = false;
	var frugal = true; // frugal flag will break execution when stopNow() is called
	var stageIndex = [];

	function stopNow() {
		stopIteration = frugal && true;
	}
	for (var i = 0; i < arrayLen; ++i) {
		pass = array[i];
		skip = false;

		for (var j = 0; j < seqLen; ++j) {

			stageIndex[j] = stageIndex[j] === undefined ? -1 : stageIndex[j];
			stageIndex[j] += 1;
			// if(chainBreak) throw new TypeError('Non-iterable stages are not chainable');
			key = sequence[j][0];
			predicate = sequence[j][1];
			modifier = sequence[j][2];
			args = sequence[j][3];

			switch (key) {

				case "filter":
					{
						if (!predicate.call(modifier, pass, stageIndex[j], stopNow)) {
							skip = true;
							// stageIndex[j]--;
							j = seqLen; // break after this iteration
						}
						break;
					}
				case "forEach":
					{
						frugal = false; // frugal causes to stop iteration on stopNow(). this will affect foreach
						predicate.call(modifier, pass, stageIndex[j], stopNow);
						break;
					}
				case "map":
					{
						pass = predicate.call(modifier, pass, stageIndex[j], stopNow);
						break;
					}

				case "reduce":
					{
						skip = true;
						singleValue = true;
						if (stageIndex[j] === 0) {
							if (args.length < 3) {
								accumulate = pass;
								break;
							}
							accumulate = modifier;
						}
						accumulate = predicate(accumulate, pass, stageIndex[j], stopNow);
						j = seqLen; // break after this iteration
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
	var sequence = this.sequence.slice();
	sequence.push([key, predicate, modifier, arguments]);
	return streamy(this.array, sequence); //*/ this.exec;
}
/*
*		Pseudo Map operations
*/
function fillMap(value, start, end) {
	start = start || 0;
	end = end || this.array.length;
	return this.appendOperation("map", function (element, index) {
		return start <= index && index < end ? value : element;
	});
}

/*
*		Pseudo Filter operations
*/
function sliceFilter(begin, end) {
	begin = begin || 0;
	// end = end || this.array.length
	return this.appendOperation("filter", function (element, index, stopNow) {
		if (index === end) stopNow();
		return begin <= index && (!end || index < end);
	});
}

/*
*		Pseudo Reduce operations
*/
function everyReduce(predicate) {

	return this.appendOperation("reduce", function (accumulator, currentValue, currentIndex) {
		return accumulator && predicate(currentValue, currentIndex);
	}, true);
}
function findReduce(predicate) {

	return this.appendOperation("reduce", function (accumulator, currentValue, currentIndex, stopNow) {
		if (accumulator !== undefined) return accumulator;
		if (predicate(currentValue, currentIndex)) {
			stopNow();
			return currentValue;
		}
	}, undefined);
}
function findIndexReduce(predicate) {

	return this.appendOperation("reduce", function (accumulator, currentValue, currentIndex, stopNow) {
		if (accumulator > -1) return accumulator;
		if (predicate(currentValue, currentIndex, array)) {
			stopNow();
			return currentIndex;
		}
		return -1;
	}, -1);
}

function joinReduce(separator) {
	separator = separator === undefined ? "," : String(separator);
	return this.appendOperation("reduce", function (accumulator, currentValue) {
		return accumulator + separator + currentValue;
	});
}

function someReduce(predicate) {

	return this.appendOperation("reduce", function (accumulator, currentValue, currentIndex, stopNow) {
		if (predicate(currentValue, currentIndex)) {
			stopNow();
			return true;
		}
		return accumulator || false;
	}, false);
}

},{}]},{},[1])(1)
});