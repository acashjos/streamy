# Streamy

[![Build Status](https://travis-ci.org/acashjos/streamy.svg?branch=master)](https://travis-ci.org/acashjos/streamy)

*streamy* is a set of array operations implemented in a vertical first fashion

## Installation

  - Latest release:

        $ npm install streamyjs

  - Master branch:

        $ npm install http://github.com/acashjos/streamy/tarball/master

[![NPM](https://nodei.co/npm/streamyjs.png?downloads=true&stars=true)](https://nodei.co/npm/streamyjs/)

## Features

  - Multiple array operations in a single loop
  - Performance improvement in V8 Engine
  - Partial execution
  - Iterable
  - Iterate in chunks
  - Non-terminating foreach
  - Familiar API
  
## Basic usage
```js
var streamy = require('streamy');
var numbers = [1, 4, 9];
var roots = streamy(numbers).map(Math.sqrt); // is a function

//  Normal usage
var rootValue = roots(); // is [1, 2, 3]

// With for-of
for(var x of roots){ /* use x */ }

// Chained operation
var rootsSum = roots.reduce( (i, j) => i + j)();  //  is 6

// numbers is still [1, 4, 9]
```

### Generic usage
```js
var ops = streamy().map(Math.sqrt).reduce( (i, j) => i + j);
ops(numbers) // [1+2+3] = 6
ops([1,9,25]) // [1+3+5] = 9
```

## What is streamy?
Conventionally an operation like `array.filter(...).map(...).slice(..)` would perform 3 iterations, create an `array` after each iteration.

*streamy* is an attempt to solve it in a different way. With *streamy*, chaining prepares the execution logic and returns a function allowing a lazy evaluation. *streamy* linearizes the logic such that it executes the entire operation stack in a single go, creating an array just once. 
```
  ## Native ##                            ## Streamy ##

array   [ n1, n2, n3, n4, n5]           array   [ n1, n2, n3, n4, n5]
op1       ->  ->  ->  ->  ->                       ->  ->  ->  -> 
       <------<--------<----            op1       |   |   |   |   |
op2       ->  ->  ->  ->  ->                      v   v   v   v   v
       <------<--------<----            op2       |   |   |   |   |
op3       ->  ->  ->  ->  ->                      v   v   v   v   v
                                        op3       |   |   |   |   |
                                                  v   v   v   v   v
```
## Why Streamy
*streamy* is a different approach, not necessarily a better approach for every use case. Some of the objectives achieved by *streamy* which I find desirable are:
- Lazy evaluation
- Ability to return earlier with minimum iterations/operations performed
- Iterability
- Operation reusability
- Partial execution
- Arguably a better execution time in chrome and NodeJs.

> Better execution time in NodeJS, Chrome and Safari are probably due to implementation differences. This could change in future. Native array functions perform much better in Firefox and Edge. I would not recommend choosing *streamy* for speed "benefits".
Check out this [jspref](https://jsperf.com/streamyjs-native-comparison/1) to try it yourself.

You should consider *streamy* if you handle huge arrays and:
- have to implement a complex custom `forEach` to modify your array,
- just need a part of the result at a time.
- have to iterate over the result.
- need the operations to be portable and extendable.

## Available operations
### Base operations
- filter
- forEach
- map
- reduce

### Derived operations
- every
- fill
- find
- findIndex
- join
- slice
- some

### Behaviour modifier functions
- apply
- chunk
- isMoving
- resetPointer
- walk

> In addition *streamy* also implements `Symbol.iterator` function to enable *Iterability*


# API
> Sample code used are originally published in [MDN array documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) licenced under [CC-BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/)

> Most examples in MDN are compatible with *streamy* as well, except for a few [gotchas](#gotchas)

>See [`test/`](https://github.com/acashjos/streamy/tree/master/test) to find more usage examples.
## Base operations
---
## filter(predicateFn, thisArg)
The filter() method creates a new array with all elements that pass the test implemented by the provided function.

```js
// syntax:
var newArray = streamy(arr).filter(predicateFn[, thisArg])();
```

## forEach(predicateFn, thisArg)
The forEach() method executes a provided function once for each array element.

```js
// syntax:
streamy(arr).forEach(function predicateFn(currentValue, index) {
    //your iterator
}[, thisArg])();
```

## map(predicateFn, thisArg)
The map() method creates a new array with the results of calling a provided function on every element in this array.
```js
// syntax:
var newArray = streamy(arr).map(predicateFn[, thisArg])();
```

## reduce(predicateFn, thisArg)
The reduce() method applies a function against an accumulator and each element in the array (from left to right) to reduce it to a single value.
```js
// syntax:
streamy(arr).reduce(predicateFn, [initialValue])();
```

## Derived operations
---

## every(predicateFn, thisArg)
The every() method tests whether all elements in the array pass the test implemented by the provided function.
```js
// syntax:
streamy(arr).every(predicateFn[, thisArg])();
```
## fill(value[, start[, end ] ])
The fill() method fills all the elements of an array from a start index to an end index with a static value.
```js
// syntax:
streamy(arr).fill(value)()
streamy(arr).fill(value, start)()
streamy(arr).fill(value, start, end)();
```
## find(predicateFn, thisArg)
The find() method returns the value of the first element in the array that satisfies the provided testing function. Otherwise undefined is returned.
```js
// syntax:
streamy(arr).find(predicateFn[, thisArg])  ();
```
## findIndex(predicateFn, thisArg)
The findIndex() method returns the index of the first element in the array that satisfies the provided testing function. Otherwise -1 is returned.
```js
// syntax:
streamy(arr).findIndex(predicateFn[, thisArg])();
```
## join([separator])
The join() method joins all elements of an array (or an array-like object) into a string.
```js
// syntax:
streamy(arr).arr.join()()
streamy(arr).join(separator)();
```

## some(predicateFn, thisArg)
The some() method tests whether some element in the array passes the test implemented by the provided function.
```js
// syntax:
streamy(arr).some(predicateFn[, thisArg])();
```

## Behaviour modifier functions
---
## apply(array)
Changes the array attached to a *streamy* object.
returns current *streamy* object so that it can be chained by another modifier function.
```js
// syntax:
var operation = streamy([1,2,3]).map( i => i*2);
operation() // is [2, 4, 6]

operation.apply([4,5,6])
operation() // is [8, 10, 12]
```
## chunk(size [, skip])
Walks through the array returning next `size` results. Every chunk call will return result as long as the cursor is moving. It keeps iterating until next result is obtained.
`size` when a negative integer, walks the array reverse. Reverse walking is possible only after the cursor has moved forward at least once.
> Reverse walking throws error when there is a reduce in the operation chain


`skip`(optional) skips through that many results in the chosen direction of iteration.

## isMoving()
Returns `false` when the iterator cursor has reached the end of iteration. Returns `true` otherwise

## fromZero()
Resets the internal cursor to 0.
returns current *streamy* object so that it can be chained by another modifier function.
## walk([direction])
Walks through the array one result at a time. Every walk call will return one result as long as the cursor is moving. It keeps iterating until next result is obtained.
**direction**(optional), when a negative integer, walks the array reverse. Reverse walking is possible only after the cursor has moved forward at least once.

---

## Gotchas
1) Every chain should terminate with an empty `()`. Execution will only commence after that.
2) With *streamy*, `foreach` **do not** terminate chaining. It is possible to interweave 
3) Unlike native function, which usually have a function signature similar to `(..., element, index, array..)`, streamy operations will not provide an `array`. It will however provide ` element, index` parameters. The `index` provided is calculated to match the index of a virtual array that the previous operations could have generated. In other words, `element` and `index` are exactly the same as what you'd get when using native array operations

---
## Development
Questions, problems or suggestions? Please post them on the [issue tracker](https://github.com/acashjos/*streamy*/issues).

You can contribute by forking the project and submitting a pull request. Make sure to run it through the issue-tracker as a feature request before implementing new features.  Feel free to contribute :heart_eyes:
> Expects contributions to include proper testing

---

## License

(The MIT License)

Copyright (c) 2017 Akash Kurian Jose &lt;acashjos@outlook.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
