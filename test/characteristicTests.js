// @gotcha  indicates something that behaves differently from native api
const chai = require("chai");
var expect = chai.expect;

let streamy = require("../")

const arr100 = Array.from(Array(100)).map((x, i) => i)

describe("streamy(array)()", () => {
	it("Should return a shallow copy", () => {
		let arrayCopy = streamy(arr100)();
		expect(arrayCopy, "values must be same").to.deep.equal(arr100);
		expect(arrayCopy, "should be a shallow copy").to.not.equal(arr100);
	})
})

describe("Chaining", () => {
	it("should produce partial applications", () => {

		/*
		# OLD STATE 
			issue with current design:
				var i = streamy(arr);
				i.fill(9)
				i.fill(5)  // same as streamy(arr).fill(9).fill(5)
				i.fill(9)()
				i.fill(5)	// breaks loop linearity
			This is unintuitive. 
		# NEW STATE
			Each chaining return a partial application. By returning partial application the behaviour changes to 
				i.fill(9)  // => streamy(arr).fill(9)
				var j = i.fill(5)  // => streamy(arr).fill(5)
				j.fill(9)() // => streamy(arr).fill(5).fill(9)()
				i.fill(4)  // => streamy(arr).fill(4) loop linearity is not broken.
		*/
		let testArr = [12, 5, 8, 130, 44]

		let mapped = streamy(testArr).map(i => i * 1.5)	// [ 18, 7.5, 12, 195, 66 ]

		let filter1 = mapped.filter(i => !(i % 3)) // [18, 12, 195, 66 ]
		let filter2 = mapped.filter(i => !(i % 7.5)) // [ 7.5, 195 ]
		let filter3 = mapped.filter(i => !(i % 3)).filter(i => !(i % 7.5)) // [ 195 ]
		let fill10 = filter2.fill(10) // [ 10, 10 ]

		let filter1OP = filter1()
		expect(filter1OP, "should not equal [ 195 ]").to.not.deep.equal([195]);
		expect(filter1OP, "should equal [18, 12, 195, 66 ]").to.deep.equal([18, 12, 195, 66]);
		expect(filter2(), "should equal [ 7.5, 195 ]").to.deep.equal([7.5, 195]);
		expect(filter3(), "should equal [ 195 ]").to.deep.equal([195]);
		expect(fill10(), "should equal [ 10, 10 ]").to.deep.equal([10, 10]);
		expect(filter2(), "repeated call should produce same output").to.deep.equal([7.5, 195]);

	})
})


describe("repeated exec() calls", () => {
	it("should produce the same result", () => {

		let testArr = [12, 5, 8, 130, 44]
		let mapped = streamy(testArr).map(i => i * 1.5)	// [ 18, 7.5, 12, 195, 66 ]

		expect(mapped(), "should equal [ 18, 7.5, 12, 195, 66 ]").to.deep.equal(mapped());
	})
})

describe("chaining after reduce()", () => {
	it("should throw error", () => {

		let testArr = [12, 5, 8, 130, 44]
		let ops = streamy(testArr).reduce((acc, i) => acc + i)	// [ 18, 7.5, 12, 195, 66 ]
		expect(ops.map.bind(null, i => i * 1.5), "should throw error").to.throw(TypeError);
	})
})

describe("exec() with an array as parameter", () => {
	it("should apply the changes to the provided array instead of initialized array", () => {


		let testArr1 = [12, 5, 8, 130, 44]
		let testArr2 = [].concat(testArr1).reverse()

		let mapped = streamy(testArr1).map(i => i * 1.5)	// [ 18, 7.5, 12, 195, 66 ]

		expect(mapped(testArr1), "should not equal [ 18, 7.5, 12, 195, 66 ]").to.not.deep.equal(mapped(testArr2));
		expect(mapped(testArr2), "should equal [ 66, 195, 12, 7.5, 18 ]").to.deep.equal([66, 195, 12, 7.5, 18]);
		expect(mapped(), "call with parameter should not modify the initialized value" + mapped()).to.deep.equal([18, 7.5, 12, 195, 66]);

	})
})

describe(".apply(array) with an array as parameter", () => {
	it("should permanently replace the initialized array.", () => {

		let mapped = streamy(arr100).map(i => i * 1.5);
		let reduce = mapped.reduce((i, j) => i + j)	// 7425
		let newArr = mapped();
		// repeating mapped() will return same result. this is already tested

		mapped.apply(newArr);
		let reduce2 = mapped.reduce((i, j) => i + j)	// 11137.5

		expect(mapped()).to.deep.equal(arr100.map(i => i * 1.5).map(i => i * 1.5))
		expect(reduce(), "chains branched before apply will not be modified").to.equal(7425)
		expect(reduce2()).to.equal(11137.5)

	})
})

// chunk processing
describe(".chunk(n) with an integer as parameter", () => {
	it("should return the next n results from the current cursor and pause.", () => {

		let mapped = streamy(arr100).map(i => i * 1.5)
		expect(mapped.chunk(5), "returns 1st 5 outputs").to.deep.equal([0, 1.5, 3, 4.5, 6])
		expect(mapped.chunk(4), "returns 5th to 10th result").to.deep.equal([7.5, 9, 10.5, 12])
		expect(mapped(), "A normal exec call should not be affected by chunk() calls").to.deep.equal(arr100.map(i => i * 1.5))
		expect(mapped.chunk(5), "internal cursor resets after an exec() call").to.deep.equal([0, 1.5, 3, 4.5, 6])
		let arr = mapped.chunk(5)
		expect(mapped.apply(arr).chunk(2), "apply() call will reset internal cursor").to.deep.equal([11.25, 13.5])
		expect(mapped.apply(arr).chunk(2), "apply() call with same array object will not reset internal cursor").to.deep.equal([15.75, 18])

	})
})

describe(".walk()", () => {
	it("should return the next single result item from the current cursor and pause.", () => {

		let mapped = streamy(arr100).map(i => i * 1.5) // [0, 1.5, 3, 4.5, 6]
		expect(mapped.walk(), "returns 1st output").to.equal(0)
		expect(mapped.walk(), "returns 2nd output").to.equal(1.5)
		expect(mapped.chunk(3), "returns 3rd to 5th result").to.deep.equal([3, 4.5, 6])
		expect(mapped.walk(), "returns 1st output").to.equal(7.5)
		//[ 7.5, 9, 10.5, 12])

	})
})

describe("Iterability", () => {
	it("should iterable so that it can be used in for..of ", () => {

		let mapped = streamy(arr100).map(i => i * 1.5) // [0, 1.5, 3, 4.5, 6]
		let iterated = []
		for (var x of mapped) iterated.push(x)
		expect(iterated).to.deep.equal(mapped())
		//[ 7.5, 9, 10.5, 12])

	})
})

describe(".chunk(n) or .walk with a reduce operation", () => {
	it("should return intermediate accumulator value at current cursor position", () => {
		let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
		let reduced = streamy(arr).reduce((acc, i) => acc + i, 1)
		// console.log(reduced())

		let foreachSum = 0;
		for (x of reduced) {
			foreachSum = x
		}
		expect(reduced.chunk(5), "returns 1+Sum(0...4) = 11").to.equal(11)
		expect(reduced.chunk(4), "returns 11 + Sum(5..8").to.equal(37)
		expect(reduced(), "A normal exec call should not be affected by chunk() calls").to.equal(arr.reduce((acc, i) => acc + i, 1))
		expect(reduced.chunk(5), "internal cursor resets after an exec() call").to.equal(11)
		expect(reduced.walk(), "walk will accumulate next item: 11 + 5 = 16").to.equal(16)
		expect(foreachSum, "for-Of on reduce should return accumulated value on each iteration").to.equal(56)
	})
})
