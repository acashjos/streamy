// setup
let streamy = require("../") // my module
console.log("streamy is ", typeof streamy)
var caseLen = 10000
var repeatTest = 100
let arr1 = Array.from(Array(caseLen)).map((x, i) => i) //array [1,2,3,4....., caseLen]

let external = [],
    o1, o2, t1, t2, ops, ops2
console.log("*******************************************\n\nexecuting [ 0,1,2,3....%d ]\n", caseLen)



/**
 * Normal array operation chaining
 */
t1 = Date.now()
external = []
for (var i = 0; i < repeatTest; ++i) {
    o1 = arr1
        .map(item => item * 1.5)
        .filter(item => (item % 2))
        .fill(6, 4900, 4990)
    o1.forEach(item => external.push(item))
    o1.reduce((i, j) => i + j)
}
console.log("Normal ops: %d ms", Date.now() - t1)


/**
 * Custom for loop logic
 */
t1 = Date.now()
external = []
o1 = []
var accumulate
for (var i = 0; i < repeatTest; ++i) {
    arr1.forEach( (item,index) => {
        var val = item * 1.5
        if(!(item%2)) return;
        if(index>=4900 && index<4990) val = 6;
        external.push(val)
        o1.push(item)
        if(!index) accumulate = val
        else accumulate = accumulate + val
        return accumulate
    })
}
console.log("Custom ops: %d ms", Date.now() - t1)


/**
 * Streamified array operation chaining
 */
t2 = Date.now()
external = []
for (var i = 0; i < repeatTest; ++i) {
    ops = streamy(arr1)
        .map(item => item * 1.5)
        .filter(item => (item % 2))
        .fill(6, 4900, 4990)
        .forEach(item => external.push(item))
        .reduce((i, j) => i + j)
    o2 = ops()
}
console.log("Streamy: %d ms", Date.now() - t2)



//Re-run
console.log("\n Re-run:")

/**
 * Normal array operation chaining
 */
t1 = Date.now()
external = []
for (var i = 0; i < repeatTest; ++i) {
    o1 = arr1
        .map(item => item * 1.5)
        .filter(item => (item % 2))
        .fill(6, 4900, 4990)
    o1.forEach(item => external.push(item))
    o1.reduce((i, j) => i + j)
}
console.log("Normal ops: %d ms", Date.now() - t1)

/**
 * Streamified array operation chaining
 */
t2 = Date.now()
external = []
for (var i = 0; i < repeatTest; ++i)
    o2 = ops()
console.log("Streamy: %d ms", Date.now() - t2)





//Re-run after data change
console.log("\n Re-run with different data:")
arr1 = Array.from(Array(caseLen)).map((x, i) => i) //array [1,2,3,4....., caseLen]
/**
 * Normal array operation chaining
 */
t1 = Date.now()
external = []
for (var i = 0; i < repeatTest; ++i) {
    o1 = arr1
        .map(item => item * 1.5)
        .filter(item => (item % 2))
        .fill(6, 4900, 4990)
    o1.forEach(item => external.push(item))
    o1.reduce((i, j) => i + j)
}
console.log("Normal ops: %d ms", Date.now() - t1)

/**
 * Streamified array operation chaining
 */
t2 = Date.now()
external = []
for (var i = 0; i < repeatTest; ++i)
    o2 = ops(arr1)
console.log("Streamy: %d ms", Date.now() - t2)