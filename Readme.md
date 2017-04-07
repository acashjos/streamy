# Streamy

[![Build Status](https://travis-ci.org/acashjos/streamy.svg?branch=master)](https://travis-ci.org/acashjos/streamy)

Streamy is a set of array operations implemented in a vertical first fashion

## Installation

  - Latest release:

        $ npm install streamy

  - Master branch:

        $ npm install http://github.com/Automattic/streamy/tarball/master

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
  
  
## Gotchas
* Every chain should terminate with an empty `()`. Execution will only commence after that.
* With streamy, `foreach` **do not** terminate chaining. You can chain multiple `foreach` blocks or even add a `reduce` block after a `foreach`. This will not modify the data.
* Unlike native function, which usually have a function signature similar to `(..., element, index, array..)`, streamy functions will not provide an `array`. It will however provide ` element, index` parameters. The `index` provided is calculated to match the index of a virtual array that the previous operations could have generated. In other words, `element` and `index` are exactly the same as what you'd get when using native array operations