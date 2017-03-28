// @gotcha  indicates something that behaves differently from native api
const chai = require("chai");
var expect = chai.expect;

let streamy = require("../").streamy

describe("Chaining", () => {
	it("should produce partial applications", ()=>{

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
		
		let mapped = streamy(testArr).map( i => i*1.5)	// [ 18, 7.5, 12, 195, 66 ]

		let filter1 = mapped.filter( i => !(i%3)) // [18, 12, 195, 66 ]
		let filter2 = mapped.filter( i => !(i%7.5)) // [ 7.5, 195 ]
		let filter3 = mapped.filter( i => !(i%3)).filter( i => !(i%7.5)) // [ 195 ]
		let fill10 = filter2.fill( 10) // [ 10, 10 ]
		
		let filter1OP = filter1()
		expect(filter1OP,"should not equal [ 195 ]").to.not.deep.equal([195]);
		expect(filter1OP,"should equal [18, 12, 195, 66 ]").to.deep.equal([18, 12, 195, 66 ]);
		expect(filter2(),"should equal [ 7.5, 195 ]").to.deep.equal([ 7.5, 195 ]);
		expect(filter3(),"should equal [ 195 ]").to.deep.equal([195]);
		expect(fill10(),"should equal [ 10, 10 ]").to.deep.equal([ 10, 10 ]);
		expect(filter2(),"repeated call should produce same output").to.deep.equal([ 7.5, 195 ]);		
		
	})
})
