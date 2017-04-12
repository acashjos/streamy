"use strict";

var exec = require("./executor");
var ops = require("./pseudoOperations")

function streamy(array, sequence) {
	if (sequence && !Array.isArray(sequence)) throw new TypeError('Expected sequence to be an Array');
	// sequence = sequence || [];
	var context = new Context(array, sequence)

	context.appendOperation = appendOperation.bind(context);
	const _exec = (arr) => {
		return exec(Array.isArray(arr) ? new Context(arr, context.sequence) : context);
	}

	// modifiers
	Object.defineProperty(_exec, "apply", {
		value: arr => {
			if (!Array.isArray(arr)) {
				throw new TypeError(".apply() expected an array. got " + (typeof arr))
			}
			if (context.array == arr) return _exec;
			context.array = arr;
			context.chunk = { size: 0, position: -1 };
			return _exec;
		}
	})
	Object.defineProperty(_exec, "chunk", {
		value: (size, skip) => {

			if (size < 0) {
				if (context.hasReduce) throw new TypeError("Reverse iteration not supported with reduce")
				context.reverse = true;
			}
			context.chunk.size = Math.abs(size);
			context.chunk.skip = skip || 0;

			return exec(context);
		}
	})
	Object.defineProperty(_exec, "isMoving", {
		value: () => (context.chunk.position < context.array.length && context.chunk.position >= 0)
	})
	Object.defineProperty(_exec, "fromZero", {
		value: () => (context.chunk.position = 0)
	})
	Object.defineProperty(_exec, "walk", {
		value: direction => {
			if (direction < 0) {
				if (context.hasReduce) throw new TypeError("Reverse iteration not supported with reduce")
				context.reverse = true;
			}
			context.chunk.size = 1;
			if (context.hasReduce)
				return exec(context);
			return exec(context)[0]
		}
	})

	Object.defineProperty(_exec, Symbol.iterator, {
		value: () => ({
			next: () => {
				if (context.chunk.position < context.array.length)
					return {
						done: false,
						value: _exec.walk()
					}
				return { done: true }
			}
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
	// Object.defineProperty(_exec, "slice", { value: ops.sliceFilter.bind(context) })

	return _exec

}



function appendOperation(key, predicate, modifier) {
	if (this.sequence.length && this.sequence[this.sequence.length - 1][0] === "reduce") {
		throw new TypeError('Non-iterable stages are not chainable');
	}
	let sequence = this.sequence.slice()
	sequence.push([key, predicate, modifier, arguments])
	return streamy(this.array, sequence);
}

function Context(array, sequence) {
	this.array = array || [];
	this.sequence = sequence || [];
	this.chunk = { size: 0, position: -1 };
	this.hasReduce = false;
	this.hasForEach = false;

	this.sequence.forEach(operationParams => {
		switch (operationParams[0]) {
			case "reduce":
				this.hasReduce = true;
				this.hasReduceInit = operationParams[3].length >= 3
				break;
			case "forEach":
				this.hasForEach = true;
				break;
		}
	})
}


module.exports = streamy;
