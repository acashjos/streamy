# Streamy

[![Build Status](https://travis-ci.org/acashjos/streamy.svg?branch=master)](https://travis-ci.org/acashjos/streamy)

Streamy is a set of array operations implemented in a vertical first fashion

## Installation

  - Latest release:

        $ npm install streamy

  - Master branch:

        $ npm install http://github.com/acashjos/streamy/tarball/master

[![NPM](https://nodei.co/npm/streamy.png?downloads=true&stars=true)](https://nodei.co/npm/streamy/)

## Features

  - Multiple array operations in a single loop
  - Performance improvement in V8
  - Partial execution
  - Iterable
  - Iterate in chunks
  - Non-terminating foreach
  - Familiar usages
  - Maximum compatibility with native implementation
  
## Basic usage
```js
var streamy = require('streamy');
var numbers = [1, 4, 9];
var roots = streamy(numbers).map(Math.sqrt); // is a function
```
### Normal usage
```js
var rootValue = roots(); // is [1, 2, 3]
// numbers is still [1, 4, 9]
```
### With for-of
```js
var newArray = []
for(var x of roots){
  newArray.push(x)
}
// newArray is now [1, 2, 3]
```
### Chained operation
```js
var rootsSum = roots.reduce( (i, j) => i + j)();
// rootsSum is 6
```

### Generic usage
```js
var ops = streamy().map(Math.sqrt).reduce( (i, j) => i + j);
ops(numbers) // [1+2+3] = 6
ops([1,9,25]) // [1+3+5] = 9
```

## What is streamy?
Conventionally an operation like `array.filter(...).map(...).slice(..)` would perform 3 iterations, one at each operation. 
```
array   [ n1, n2, n3, n4, n5]
op1       ->  ->  ->  ->  ->
       <------<--------<----
op2       ->  ->  ->  ->  ->
       <------<--------<----
op3       ->  ->  ->  ->  ->
```
Another approach is to implement a `array.forEach(...)` with custom logic. While this is excellent for performance, it takes a hit on readability and maintainability. 

*streamy* is trying to hit a sweet spot between these two approaches. With streamy, chaining prepares the execution logic and returns a function allowing a lazy evaluation. streamy linearizes the logic such that it executes the entire operation stack in a single go, iterating over the array just once. 
```
array   [ n1, n2, n3, n4, n5]
           ->  ->  ->  -> 
op1       |   |   |   |   |
op2       |   |   |   |   |
op3       |   |   |   |   |
          v   v   v   v   v
```
## Why Streamy
Streamy is a different approach, not necessarily a better approach for every use case. Some of the objectives achieved by *streamy* which I find desirable are:
- Lazy evaluation
- Ability to return earlier with minimum iterations/operations performed
- Iterability
- Operation reusability
- Partial execution
- Arguably a better execution time in chrome and NodeJs.

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
- walk
- *at

> In addition streamy also implements `Symbol.iterator` function to enable *Iterability*
## Gotchas
1) Every chain should terminate with an empty `()`. Execution will only commence after that.
2) With streamy, `foreach` **do not** terminate chaining. You can chain multiple `foreach` blocks or even add a `reduce` block after a `foreach`.
3) Unlike native function, which usually have a function signature similar to `(..., element, index, array..)`, streamy functions will not provide an `array`. It will however provide ` element, index` parameters. The `index` provided is calculated to match the index of a virtual array that the previous operations could have generated. In other words, `element` and `index` are exactly the same as what you'd get when using native array operations

## Documentation

