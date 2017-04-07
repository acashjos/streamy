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
### Single operation
```js
var streamy = require('streamy');

var numbers = [1, 4, 9];
var roots = streamy(numbers).map(Math.sqrt);
// roots is a function
var rootValue = roots();
// rootValue is now [1, 2, 3]
// numbers is still [1, 4, 9]
```

### Chained operation
```js
var rootsSum = streamy(numbers)
.map(Math.sqrt)                 //[1, 2, 3]
.reduce( (i, j) => i + j)();
// rootsSum is 6
```

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

### Behavior modifier functions
- apply
- chunk
- walk

> In addition streamy also implements `Symbol.iterator` function to enable *Iterability*
## Gotchas
1) Every chain should terminate with an empty `()`. Execution will only commence after that.
2) With streamy, `foreach` **do not** terminate chaining. You can chain multiple `foreach` blocks or even add a `reduce` block after a `foreach`. This will not modify the data.
3) Unlike native function, which usually have a function signature similar to `(..., element, index, array..)`, streamy functions will not provide an `array`. It will however provide ` element, index` parameters. The `index` provided is calculated to match the index of a virtual array that the previous operations could have generated. In other words, `element` and `index` are exactly the same as what you'd get when using native array operations