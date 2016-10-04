---
layout: exercise
title: JavaScript basics - exercises
description: JavaScript basics
---

## Exercise 1

Write the following mathematical expressions in WebPPL

A) $$ 3 \times 4 $$

~~~~
~~~~
  
B) $$ 4 + \frac{62}{7} $$

~~~~
~~~~
  
C) The circumference of a 12-inch (diameter) pizza.

~~~~
~~~~

D) $$ 3 \times ( 4+ (\frac{62}{7})^2 ) $$

~~~~
~~~~

E) Convert this WebPPL expression into an arithmetic expression:

~~~~norun
Math.abs(-3 * Math.exp(Math.pow(3, 4)))
~~~~

## Exercise 2: Defining variables and functions:

A) Write a function $$f(x, y) = (x + y)^{x - y}$$ and use it to compute $$f(5,3)$$. 

~~~~
var f = function(...){ return ... }
f(5, 3)
~~~~

B) Below, we have already defined $$h(x,y) = x + 2y$$. 
Write a function $$g(x, y, z) = x - y \times z$$ and use it to compute $$g(1, 4, h(6,3))$$.

~~~~
var h = function(x, y){ return x + 2*y }
...
~~~~

C) The `<condition> ? <true-clause> : <false-clause>` special form is used for if-else statements. 
For instance, it's used below to define a function that returns `yes` if the first argument is bigger than the second and `no` otherwise.

~~~~
var bigger = function(a, b){
  return (a > b) ? "yes" : "no"
}

bigger(3, 4)
~~~~

What does the function below do?

~~~~
var f = function(x){
  return (x > 5) ? "Z" :
         (x > 2) ? "R" : 
                   "M"
}
~~~~

D) JavaScript and WebPPL are *functional* programming languages, so functions have a special place in these languages.
Speaking very loosely, if you think of variables as nouns and functions as verbs, functional programming languages blur the noun-verb distinction.
A consequence of this is that you can treat functions like regular old values.
For instance, in the function below, there are three arguments: `thing1`, `thing2`, and `thing3`.
`thing1` is assumed to be a function and it gets applied to `thing2` and `thing3`:

~~~~
var useThing1OnOtherThings = function(thing1, thing2, thing3){
  return thing1(thing2, thing3)
}

useThing1OnOtherThings(function(x,y){ return x*y }, 3, 4)
~~~~

Write a function, `f`, that takes three arguments, `g`, `x`, and `y`.
Assume that `g` is a function of two variables and define `f` so that it returns `"yes"` if $$g(x,y) > x + y$$, otherwise `"no"`.
Use it to compute $$f(\times, 2.6, 1.2)$$.

Note you will have to spell out the function $$\times$$.

~~~~
var f = function(g, x, y){
  return ...
}
~~~~

E) In D we defined `f` as a function that takes in a function as one of its arguments.
Here, we are going to define a different sort of function, one that takes in normal values as arguments but *returns* a function.

~~~~
var biggerThanFactory = function(num){
  return function(x) { 
    return x > num
  }
}
~~~~

You can think of this function as a "factory" that makes "machines".
You hand this factory a number, `num`, and the factory hands you back a machine.
This machine is itself a function that takes an number, `x`, and tells you whether `x` is larger than `num`.

Without running any code, compute `biggerThanFactory(5)(4)` and `biggerThanFactory(-1)(7)`.

The functions we've defined in parts D and E are called "higher order functions".
A function $$f$$ is a higher order function if it takes other functions as input or if it outputs a function.

F) What does this function do?

~~~~
var Q = function(f, g){
  return function(x, y){
    return f(x, y) > g(x, y)
  }
}
~~~~

## Exercise 3: Arrays and Objects


A) Write an array of even numbers between 0 and 10 inclusive. 
(You can either write this out manually, using the underscore `_.range()` function, or writing a recursive function.)

~~~~
~~~~

B) Write an array of objects of you and your two best friends: Include first name, age, gender, and university properties.

~~~~
~~~~

C) Without running any code, guess the result of each expression below. Some of these expressions have intentional errors---see if you can spot them.


`"2" == 2`

`"a" == a`

`["a","b","c"].indexOf(1)`

`[1,3,5].slice(3)`

`_.keys({a:1,b:2,c:3})`

`[1, 2, 3, [4, 5, 6], 7].length`

`["a","b"].concat("c","d")`

`["a","b"].concat(["c","d"])`

`["a","b"].concat([["c","d"]])`

`_.values({a:x,b:y,c:z})`

`[a, 3, 1].length`

`[3,2] == [3,2]`

`_.isEqual([3,2], [3,2])`

Check your guesses by actually running the code. If you made any mistakes, explain why your initial guess was incorrect.

~~~~
~~~~

## Exercise 4: Map, reduce, and filter

Three common patterns for working with arrays are called `map`, `reduce`, and `filter` (reduce is also sometimes called "fold").

Map takes two arguments, a function, `f`, and an array, `[a, b, c, ...]`, and returns an array with `f` applied to every item of the array: `[f(a), f(b), f(c), ...]`.
In the example below, we map `square` (which squares numbers) over the first five natural numbers:

~~~~
var square = function(x){
  return x * x
}
map(square, [1, 2, 3, 4, 5])
~~~~

Like map, filter also takes 2 arguments: a function `f` and an array `[a, b, c, ...]`, and returns an array that is a subset of the original array with only those values that return true when the function is applied.
In the example belwo, we filter the first five natural numbers by a function that checks if the number is even.
Note the `%` operator returns the remainder leftover when one operand is divided by the other.

~~~~
var isEven = function(x){
  return (x % 2) == 0
}
filter(isEven, [1, 2, 3, 4, 5])
~~~~

Reduce takes three arguments, a function, `f`, an initial value, `i`, and an array, `[a, b, c, ...]`, and returns `f(...,f(c, f(b, f(a, i))))`.
In the example below, we define a function that computes the product of a list:

~~~~
var myProduct = function(arr){
  return reduce( 
    function(listItem, cumulativeValue){ // function
      return listItem * cumulativeValue
    },
    1, //initial value
    arr // array
  )
}

myProduct([1, 2, 3, 4, 5])
~~~~

Note the use of the "anonymous" function here---we don't care about using this function outside the context of the fold, so we don't bother giving it a name with `var`.

A) Write `mySumSquares` using `reduce`.
This function should take in an array of numbers and return the sum of the squares of all those numbers.
Use it on the array `[1, 2, 3, 4, 5]`

~~~~
var square = function(x) { return x * x }
var mySumSquares = function(arr) {
  return ...
}
mySumSquares([1, 2, 3, 4, 5])
~~~~

B) Write `mySumSquares` *without* using `reduce`---instead use `map` and `sum`:

~~~~
var square = function(x) { return x * x }
var mySumSquares = function(arr) {
  return ...
}
mySumSquares([1, 2, 3, 4, 5])
~~~~

C) Filter `[1,2,3,4,5]` for those items whose squares are greater than 10.

~~~~
~~~~


## Exercise 5: Recursion

One benefit of functional programming languages is that they make it possible to elegantly and concisely write down interesting programs that would be complicated and ugly to express in non-functional languages (if you have some time, it is well worth understanding the [change counting example](http://mitpress.mit.edu/sicp/full-text/book/book-Z-H-11.html#%_sec_1.2.1) from SICP).
Elegance and concision usually derive from recursion, i.e., expressing a problem in terms of a smaller subproblem.

Here is a very simple recursive function, one that computes the length of a list:

~~~~
var myLength = function(arr){
  return _.isEmpty(arr) ? 0 :
          1 + myLength(arr.slice(1))
}

myLength(["a", "b", "c", "d", "e"])
~~~~

A) How does `myLength` work?

B) Below, `myMax` is intended to be a recursive function that returns the largest item in a list. Finish writing it and use it to compute the largest item in `[1, 2, 3, 6, 7, 4, 2, 9, 8, -5, 0, 12, 3]`

~~~~
// returns the larger of a and b.
var bigger = function(a, b){
  return a > b ? a : b
}

var myMax = function(arr){
 return (arr.length == 1) ? lst[0] : ... // finish this line
}

myMax([1, 2, 3, 6, 7, 4, 2, 9, 8, -5, 0, 12, 3])
~~~~

C) Write a version of `myMax` using `reduce`.

~~~~
var bigger = function(a, b){
  return a > b ? a : b
}

var myMax = function(arr){
 return reduce(..., ..., ...)
}

myMax([1, 2, 3, 6, 7, 4, 2, 9, 8, -5, 0, 12, 3])
~~~~