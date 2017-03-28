
// setup
var caseLen = 10000000
let arr1 = Array.from(Array(caseLen)).map((x, i) => i) //array [1,2,3,4....., caseLen]

let external = [], o1, o2


/**
 * Normal array operation chaining
 */
let t1 = Date.now()
// repeats operation 1000 times => 1000 * ops(caseLen)
// for (var i = 0; i < 1000; ++i)
    o1 = arr1
    .filter(item => item % 2)
    .map(item => item * 2)
    .fill(6, 4900, 4990)
    .forEach(item => external.push(item))
console.log("Normal ops: %d ms", Date.now() - t1)


/*
// setup
var caseLen = 10000
let arr1 = Array.from(Array(caseLen)).map((x, i) => i) //array [1,2,3,4....., caseLen]
let external = [], o1, o2
*/

/**
 * Streamified array operation chaining
 */
let streamy = require("../").streamy	// my module
let t2 = Date.now()
// repeats operation 1000 times => 1000 * ops(caseLen)
// for (var i = 0; i < 1000; ++i)
    o2 = streamy(arr1)
    .filter(item => item % 2)
    .map(item => item * 2)
    .fill(6, 4900, 4990)
    .forEach(item => external.push(item))()
console.log("Streamy: %d ms", Date.now() - t2)
