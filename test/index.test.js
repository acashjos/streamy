// @gotcha  indicates something that behaves differently from native api
const chai = require("chai");
var expect = chai.expect;

let streamy = require("../").streamy

describe(".every()", () => {
	it("should test whether all elements in the array pass the test", ()=>{
		let arrFail = [12, 5, 8, 130, 44]
		let arrPass = [12, 54, 18, 130, 44]
		function isBigEnough(element, index, array) { 
			return element >= 10; 
		} 
		expect(streamy(arrFail).every(isBigEnough)(),"should fail").to.equal(arrFail.every(isBigEnough));
		expect(streamy(arrPass).every(isBigEnough)(),"should pass").to.equal(arrPass.every(isBigEnough));

		// using arrow functions
		expect(streamy(arrFail).every(x => x >= 10)(),"should fail").to.equal(arrFail.every(x => x >= 10));
		expect(streamy(arrPass).every(x => x >= 10)(),"should pass").to.equal(arrPass.every(x => x >= 10));
		
		
	})
})

describe(".fill()", () => {
	it("should fill all the elements of an array from a start index to an end index with a static value", ()=>{
		let testArr = [1, 2, 3]

		expect(streamy(testArr).fill(4)(), "should be [4, 4, 4]").to.deep.equal(testArr.fill(4));
		expect(streamy(testArr).fill(4, 1)(), "should be [1, 4, 4]").to.deep.equal(testArr.fill(4, 1));
		expect(streamy(testArr).fill(4, 1, 2)(), "should be [1, 4, 3]").to.deep.equal(testArr.fill(4, 1, 2));
		expect(streamy(testArr).fill(4, 1, 1)(), "should be [1, 2, 3]").to.deep.equal(testArr.fill(4, 1, 1));
		expect(streamy(testArr).fill(4, -3, -2)(), "should be [4, 2, 3]").to.deep.equal(testArr.fill(4, -3, -2));
		expect(streamy(testArr).fill(4, NaN, NaN)(), "should be [1, 2, 3]").to.deep.equal(testArr.fill(4, NaN, NaN));
		expect(streamy(Array(3)).fill(4)(), "should be [4, 4, 4]").to.deep.equal(Array(3).fill(4));

		// @gotcha deviation from standard api. { length: 3 } is not fillable
		expect(streamy([]).fill.call({ length: 3 }, 4)(), "will not be {0: 4, 1: 4, 2: 4, length: 3}").to.not.deep.equal([].fill.call({ length: 3 }, 4));

	})
})


describe(".filter()", () => {
	it("should create a new array with all elements that pass the test", ()=>{
		let testArr = [12, 5, 8, 130, 44]
		function isBigEnough(element, index, array) { 
			return element >= 10; 
		} 
		expect(streamy(testArr).filter(isBigEnough)(),"should be [12, 130, 44]").to.deep.equal(testArr.filter(isBigEnough));

		// using arrow functions
		expect(streamy(testArr).filter(x => x >= 10)(),"should be [12, 130, 44]").to.deep.equal(testArr.filter(x => x >= 10));

		// test 2
		var fruits = ['apple', 'banana', 'grapes', 'mango', 'orange'];

		/**
		 * Array filters items based on search criteria (query)
		 */
		function filterItemsNative(query) {
			return fruits.filter(function(el) {
			return el.toLowerCase().indexOf(query.toLowerCase()) > -1;
			})
		}
		function filterItemsStreamy(query) {
			return streamy(fruits).filter(function(el) {
			return el.toLowerCase().indexOf(query.toLowerCase()) > -1;
			})()
		}
		expect(filterItemsStreamy('ap'),"should be ['apple', 'grapes']").to.deep.equal(filterItemsNative('ap'));
		expect(filterItemsStreamy('an'),"should be ['banana', 'mango', 'orange']").to.deep.equal(filterItemsNative('an'));
		

		// test 3

		var arr = [
			{ id: 15 },
			{ id: -1 },
			{ id: 0 },
			{ id: 3 },
			{ id: 12.2 },
			{ },
			{ id: null },
			{ id: NaN },
			{ id: 'undefined' }
		];


		function isNumber(obj) {
		return obj!== undefined && typeof(obj) === 'number' && !isNaN(obj);
		}

		// var invalidEntries = 0;
		function filterByID(item) {
			if (isNumber(item.id)) {
				return true;
			} 
		this.invalidEntries++;
		return false; 
		}

		var nativeResult = {invalidEntries:0}
		var nativeArrByID = arr.filter(filterByID.bind(nativeResult));

		var streamyResult = {invalidEntries:0}
		var streamyArrByID = streamy(arr).filter(filterByID.bind(streamyResult))();

		expect(streamyArrByID,"should be [{ id: 15 }, { id: -1 }, { id: 0 }, { id: 3 }, { id: 12.2 }]").to.deep.equal(nativeArrByID);
		expect(streamyResult.invalidEntries,"Invalid Entries should equal 4").to.deep.equal(nativeResult.invalidEntries);
		
	})
})

describe(".find()", () => {
	it("should return the value of the first element in the array that satisfies the provided testing function", ()=>{
		let testArr = [12, 5, 8, 130, 44]
		function isBigEnough(element, index, array) { 
			return element >= 15; 
		} 
		expect(streamy(testArr).find(isBigEnough)(),"should equal 130").to.equal(testArr.find(isBigEnough));

		// using arrow functions
		expect(streamy(testArr).find(x => x >= 10)(),"should equal 12").to.equal(testArr.find(x => x >= 10));
		
		// test 2
		var inventory = [
			{name: 'apples', quantity: 2},
			{name: 'bananas', quantity: 0},
			{name: 'cherries', quantity: 5}
		];

		function findCherries(fruit) { 
			return fruit.name === 'cherries';
		}

		expect(streamy(inventory).find(findCherries)(),"should return { name: 'cherries', quantity: 5 }").to.deep.equal(inventory.find(findCherries));

		// test 3
		function isPrime(element, index, array) {
			var start = 2;
			while (start <= Math.sqrt(element)) {
				if (element % start++ < 1) {
				return false;
				}
			}
			return element > 1;
		}
		expect(streamy([4, 6, 8, 12]).find(isPrime)(),"should return undefined").to.deep.equal([4, 6, 8, 12].find(isPrime));
		expect(streamy([4, 5, 8, 12]).find(isPrime)(),"should return 5").to.deep.equal([4, 5, 8, 12].find(isPrime));

	})
})


describe(".findIndex()", () => {
	it("should return the index of the first element in the array that satisfies the provided testing function", ()=>{
		let testArr = [12, 5, 8, 130, 44]
		function isBigEnough(element, index, array) { 
			return element >= 15; 
		} 
		expect(streamy(testArr).find(isBigEnough)(),"should equal 4").to.equal(testArr.find(isBigEnough));

		// using arrow functions
		expect(streamy(testArr).find(x => x >= 10)(),"should equal 0").to.equal(testArr.find(x => x >= 10));
		
		// test 2
		var inventory = [
			{name: 'apples', quantity: 2},
			{name: 'bananas', quantity: 0},
			{name: 'cherries', quantity: 5}
		];

		function findCherries(fruit) { 
			return fruit.name === 'cherries';
		}

		expect(streamy(inventory).find(findCherries)(),"should return 2").to.deep.equal(inventory.find(findCherries));

		// test 3
		function isPrime(element, index, array) {
			var start = 2;
			while (start <= Math.sqrt(element)) {
				if (element % start++ < 1) {
				return false;
				}
			}
			return element > 1;
		}
		expect(streamy([4, 6, 8, 12]).find(isPrime)(),"should return -1").to.deep.equal([4, 6, 8, 12].find(isPrime));
		expect(streamy([4, 5, 8, 12]).find(isPrime)(),"should return 1").to.deep.equal([4, 5, 8, 12].find(isPrime));

	})
})

describe(".forEach()", () => {
	it("should  execute a provided function once for each array element.", ()=>{
		var a = ['a', 'b', 'c'];
		var nativeResult = {} ,streamyResult = {};
		function each(element, index, array) { 
			this.element = element
			this.index = index
			this.array = array
		} 
		a.forEach(each, nativeResult)
		streamy(a).forEach(each, streamyResult)()
		expect(streamyResult,"should equal"+JSON.stringify(nativeResult)).to.deep.equal(nativeResult);
		
		
	})
})

describe(".join()", () => {

	it("should join all elements of an array into a string", ()=>{
		var a = ['Wind', 'Rain', 'Fire'];
		expect(streamy(a).join()(),"should equal 'Wind,Rain,Fire'").to.equal(a.join());
		expect(streamy(a).join('-')(),"should equal 'Wind-Rain-Fire'").to.equal(a.join('-'));
		expect(streamy(a).join(', ')(),"should equal 'Wind, Rain, Fire'").to.equal(a.join(', '));
		expect(streamy(a).join('')(),"should equal 'WindRainFire'").to.equal(a.join(''));
		expect(streamy(a).join(null)(),"should equal 'WindnullRainnullFire'").to.equal(a.join(null));
		expect(streamy(a).join(undefined)(),"should equal 'Wind,Rain,Fire'").to.equal(a.join(undefined));
		expect(streamy(a).join({})(),"should equal 'Wind[object Object]Rain[object Object]Fire'").to.equal(a.join({}));
		
		// ARRAY-LIKE OBJECTS
		expect(streamy("string").join()(),"should equal 's,t,r,i,n,g'").to.equal(Array.prototype.join.call("string"));
		
		let args;
		(function(){
			args = arguments;
		})(5,6,7,8,9,10)
		expect(streamy(args).join()(),"should equal '5,6,7,8,9,10'").to.equal(Array.prototype.join.call(args));
		
	})
})


describe(".map()", () => {
	it("should create a new array with the results of calling provided function on every element", ()=>{
		var numbers = [1, 4, 9];
// streamy(numbers)
		expect(streamy(numbers).map(Math.sqrt)(), "should be [1, 2, 3]").to.deep.equal(numbers.map(Math.sqrt));
		expect(numbers,"should not change").to.deep.equal([1,4,9])
		
		//test 2
		var kvArray = [{key: 1, value: 10}, 
					{key: 2, value: 20}, 
					{key: 3, value: 30}];
		var mapFn = function(obj) { 
			var rObj = {};
			rObj[obj.key] = obj.value;
			return rObj;
		}
		expect(streamy(kvArray).map(mapFn)(),"should not change").to.deep.equal(kvArray.map(mapFn))
		expect(kvArray,"should not change").to.deep.equal([{key: 1, value: 10}, 
					{key: 2, value: 20}, 
					{key: 3, value: 30}])
		
		// test 3
		var map = Array.prototype.map;
		var a = map.call('Hello World', function(x) { 
			return x.charCodeAt(0); 
		});
		var b = streamy('Hello World').map(function(x) { 
			return x.charCodeAt(0); 
		})()
		expect(b,"Generic usage must be possible on array-like objects").to.deep.equal(a)

		//Tricky use case
		expect(streamy(['1', '2', '3']).map(parseInt)(),"should return [1, NaN, NaN]").to.deep.equal(['1', '2', '3'].map(parseInt))
		function returnInt(element) {
			return parseInt(element, 10);
		}
		expect(streamy(['1', '2', '3']).map(returnInt)(),"should return [1, 2, 3]").to.deep.equal(['1', '2', '3'].map(returnInt))
		
	})

})

describe(".reduce()", () => {
	it("should apply a function against an accumulator and each element in the array (from left to right) to reduce it to a single value", ()=>{
		var nativeSum = [0, 1, 2, 3].reduce(function(acc, val) {
			return acc + val;
		}, 0);
		var streamySum = streamy([0, 1, 2, 3]).reduce(function(acc, val) {
			return acc + val;
		}, 0)();
		expect(streamySum,"should equal "+nativeSum).to.equal(nativeSum);
		

		//test 2

		var list1 = [[0, 1], [2, 3], [4, 5]];
		var list2 = [0, [1, [2, [3, [4, [5]]]]]];
		const flattenNative = arr => arr.reduce(
			(acc, val) => acc.concat(
				Array.isArray(val) ? flattenNative(val) : val
			),
			[]
		);

		const flattenStreamy = arr => streamy(arr).reduce(
			(acc, val) => acc.concat(
				Array.isArray(val) ? flattenStreamy(val) : val
			),
			[]
		)();
		expect(flattenStreamy(list1),"should equal [0, 1, 2, 3, 4, 5]").to.deep.equal(flattenNative(list1));
		expect(flattenStreamy(list2),"should equal [0, 1, 2, 3, 4, 5]").to.deep.equal(flattenNative(list2));
		

		// test 3
		var maxCallback = ( acc, cur ) => Math.max( acc.x, cur.x );
		var maxCallback2 = ( max, cur ) => Math.max( max, cur );
		// reduce() without initialValue
		expect(streamy([ { x: 22 }, { x: 42 } ]).reduce( maxCallback )(),"should equal 42").to.equal(42);
		expect(streamy([ { x: 22 }            ]).reduce( maxCallback )(),"should equal { x: 22 }").to.deep.equal({ x: 22 });
		expect(streamy([                      ]).reduce.bind(null, maxCallback ),"should throw error").to.throw(TypeError);

		// map/reduce; better solution, also works for empty arrays
		expect(streamy([ { x: 22 }, { x: 42 } ]).map( el => el.x ).reduce( maxCallback2, -Infinity )(),"should equal 42").to.equal(42);

		//test 4
		var names = ['Alice', 'Bob', 'Tiff', 'Bruce', 'Alice'];
		function namelogic(allNames, name) { 
			if (name in allNames) {
				allNames[name]++;
			}
			else {
				allNames[name] = 1;
			}
			return allNames;
		}
		expect(streamy(names).reduce(namelogic, {})(),"should equal { 'Alice': 2, 'Bob': 1, 'Tiff': 1, 'Bruce': 1 }").to.deep.equal(names.reduce(namelogic, {}));
	})
})

describe(".slice", () => {
	it("should return a shallow copy of a portion of an array into a new array", () => {

		var fruits = ['Banana', 'Orange', 'Lemon', 'Apple', 'Mango'];
		expect(streamy(fruits).slice(1, 3)(),"should equal ['Orange','Lemon']").to.deep.equal(fruits.slice(1, 3))
		expect(fruits,"should not change").to.deep.equal(['Banana', 'Orange', 'Lemon', 'Apple', 'Mango'])

		//test 2

		var myHonda = { color: 'red', wheels: 4, engine: { cylinders: 4, size: 2.2 } };
		var myCar = [myHonda, 2, 'cherry condition', 'purchased 1997'];
		var streamySlice = streamy(myCar).slice(0, 2)()
		var nativeSlice = myCar.slice(0, 2)
		expect(streamySlice,"should equal ['Orange','Lemon']").to.deep.equal(nativeSlice)
		expect(streamySlice[0],"should be shallow copy. streamySlice[0] should point to myHonda").to.equal(myHonda)
		expect(streamySlice[0],"streamySlice[0] and nativeSlice[0] should point to myHonda").to.equal(nativeSlice[0])

		// test 3 array-like
		function listNative() {
			return Array.prototype.slice.call(arguments);
		}
		function listStreamy() {
			return streamy(arguments).slice()();
		}

		expect(listStreamy(1, 2, 3),"should equal  [1, 2, 3]").to.deep.equal(listNative(1, 2, 3))
	})
})

describe(".some()", () => {
	it("should test whether some element in the array passes the test", ()=>{
		let arrFail = [2, 5, 8, 1, 4]
		let arrPass = [12, 5, 8, 1, 4]
		function isBigEnough(element, index, array) { 
			return element >= 10; 
		} 
		expect(streamy(arrFail).some(isBigEnough)(),"should fail").to.equal(arrFail.some(isBigEnough));
		expect(streamy(arrPass).some(isBigEnough)(),"should pass").to.equal(arrPass.some(isBigEnough));

		// using arrow functions
		expect(streamy(arrFail).some(x => x >= 10)(),"should fail").to.equal(arrFail.some(x => x >= 10));
		expect(streamy(arrPass).some(x => x >= 10)(),"should pass").to.equal(arrPass.some(x => x >= 10));
		
		//test 2
		var fruits = ['apple', 'banana', 'mango', 'guava'];

		function checkNative(arr, val) {
			return arr.some(arrVal => val === arrVal);
		}
		function checkStreamy(arr, val) {
			return streamy(arr).some(arrVal => val === arrVal)();
		}
		expect(checkStreamy(fruits, 'kela'),"should equal  false").to.equal(checkNative(fruits, 'kela'))
		expect(checkStreamy(fruits, 'banana'),"should equal  true").to.equal(checkNative(fruits, 'banana'))

		
	})
})