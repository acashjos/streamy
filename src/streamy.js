"use strict";

var exec = require("./executor");
var ops = require("./pseudoOperations")

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
		return exec(Array.isArray(arr) ? { array: arr, sequence: context.sequence, chunk: { size: 0, position: 0 }, } : context);
	}

	// modifiers
	Object.defineProperty(_exec, "apply", {
		value: arr => {
			if (context.array == arr) return _exec;
			context.array = arr;
			context.chunk = { size: 0, position: 0 };
			return _exec;
		}
	})
	Object.defineProperty(_exec, "chunk", {
		value: size => {
			if (context.chunk.position == context.array.length) {
				context.chunk = { size: 0, position: 0 };
				return { done: true }
			}
			if (size < 0)
				throw new TypeError("Reverse iteration not supported")
			context.chunk.size = size;
			return { done: false, value: exec(context) };
		}
	})
	Object.defineProperty(_exec, "walk", {
		value: () => {
			if (context.chunk.position == context.array.length) {
				context.chunk = { size: 0, position: 0 };
				return { done: true }
			}
			context.chunk.size = 1;
			if (context.sequence[context.sequence.length - 1][0] === "reduce")
				return { done: false, value: exec(context) };
			return { done: false, value: exec(context)[0] }
		}
	})

	Object.defineProperty(_exec, Symbol.iterator, {
		value: () => ({
			next: _exec.walk
		})
	})

	//primary ops
	Object.defineProperty(_exec, "filter", { value: appendOperation.bind(context, "filter") })
	Object.defineProperty(_exec, "forEach", { value: appendOperation.bind(context, "forEach") }) //pass through
	Object.defineProperty(_exec, "map", { value: appendOperation.bind(context, "map") })
	Object.defineProperty(_exec, "reduce", { value: context.appendOperation.bind(context, "reduce") })

	//non chainable
	Object.defineProperty(_exec, "every", { value: ops.everyReduce.bind(context) })
	Object.defineProperty(_exec, "find", { value: ops.findReduce.bind(context) })
	Object.defineProperty(_exec, "findIndex", { value: ops.findIndexReduce.bind(context) })
	Object.defineProperty(_exec, "join", { value: ops.joinReduce.bind(context) })
	Object.defineProperty(_exec, "some", { value: ops.someReduce.bind(context) })

	// chainable
	Object.defineProperty(_exec, "fill", { value: ops.fillMap.bind(context) })
	Object.defineProperty(_exec, "slice", { value: ops.sliceFilter.bind(context) })

	// keys() | values()
	return _exec

}



function appendOperation(key, predicate, modifier) {
	if (key === "reduce" && arguments.length < 3 && this.array.length == 0) {
		throw new TypeError('Reduce of empty array with no initial value');
	}
	else if (this.sequence.length && this.sequence[this.sequence.length - 1][0] === "reduce") {
		throw new TypeError('Non-iterable stages are not chainable');
	}
	let sequence = this.sequence.slice()
	sequence.push([key, predicate, modifier, arguments])
	return streamy(this.array, sequence); //*/ this.exec;
}


module.exports = streamy;
