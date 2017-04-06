"use strict";

module.exports = {
	/*
	*		Pseudo Map operations
	*/
	fillMap: function (value, start, end) {
		start = start || 0
		end = end || this.array.length
		return this.appendOperation("map", (element, index) => (start <= index && index < end) ? value : element)
	},


	/*
	*		Pseudo Filter operations
	*/
	sliceFilter: function (begin, end) {
		begin = begin || 0
		// end = end || this.array.length
		return this.appendOperation("filter", (element, index, stopNow) => {
			if (index === end) stopNow();
			return (begin <= index && (!end || index < end))
		})
	},


	/*
	*		Pseudo Reduce operations
	*/
	everyReduce: function (predicate) {

		return this.appendOperation("reduce", (accumulator, currentValue, currentIndex) => {
			return accumulator && predicate(currentValue, currentIndex)
		}, true)
	},

	findReduce: function (predicate) {

		return this.appendOperation("reduce", (accumulator, currentValue, currentIndex, stopNow) => {
			if (accumulator !== undefined) return accumulator;
			if (predicate(currentValue, currentIndex)) {
				stopNow();
				return currentValue
			}
		}, undefined)
	},

	findIndexReduce: function (predicate) {

		return this.appendOperation("reduce", (accumulator, currentValue, currentIndex, stopNow) => {
			if (accumulator > -1) return accumulator;
			if (predicate(currentValue, currentIndex, array)) {
				stopNow();
				return currentIndex
			}
			return -1;
		}, -1)
	},

	joinReduce: function (separator) {
		separator = separator === undefined ? "," : String(separator)
		return this.appendOperation("reduce", (accumulator, currentValue) => accumulator + separator + currentValue)
	},

	someReduce: function (predicate) {

		return this.appendOperation("reduce", (accumulator, currentValue, currentIndex, stopNow) => {
			if (predicate(currentValue, currentIndex)) {
				stopNow();
				return true;
			}
			return accumulator || false;
		}, false)
	}
}