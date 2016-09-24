---
layout: chapter
title: Appendix - JavaScript basics
description: Appendix - JavaScript basics
---

# Introduction to JavaScript

JavaScipt is a high-level, untyped programming language ...

[JavaScript: The Good Parts](http://bdcampbell.net/javascript/book/javascript_the_good_parts.pdf) is an excellent introduction to the language.
Online tutorials can be found [here](http://www.w3schools.com/js/), [there](https://www.javascript.com), and [elsewhere](https://www.codeschool.com/learn/javascript).

In it, you can do basic arithmetical operations

~~~~
3 + 3
~~~~

Numeric variables can be automatically modified into strings

~~~~
3 + " is my favorite number"
~~~~

Boolean variables can be automatically changed into numbers

~~~~
true + true
~~~~

Equality can be checked using `==` and `===`. `===` cares about the type of variable.

~~~~
print(3 == 3)
print("3" == 3)
print("3" === 3)

print("Booleans can equal numbers when you don't care about type.")
print(true == 1)
print(true === 1)
~~~~

A summary of comparison and logical operators can be found [here](http://www.w3schools.com/js/js_comparisons.asp)

# Budilding More Complex Programs

~~~~
true && (true || false)
~~~~
This expression has an *operator*, the logical function and `&&`, and *arguments*, `true` and the *subexpression* which is itself an application of `||`. When reasoning about evaluation, it is best to think of evaluating the subexpressions first, then applying the function to the return values of its arguments. In this example `||` is first applied to `true` and `false`, returning true, then `&&` is applied to `true` and the subexpression's return value, again returning true.

As a slightly more complex example, consider:

~~~~
// this line is a comment
if (1 == 2)  {     // the condition of "if"
  100              // the consequent ("then")
} else {
  (true || false)  // the alternative ("else")	
}
~~~~

This expression is composed of an `if` conditional that evaluates the first expression (a test here of whether `1` equals `2`) then evaluates the second expression if the first is true or otherwise evaluates the third expression.
The operator `if` is strictly not a function, because it does not evaluate all of its arguments, but instead *short-circuits* evaluating only the second or third. It has a value like any other function.
(We have also used comments here: anything after a `//` is ignored when evaluating.) 

Note the particular indentation style used above (called ''pretty-printing''). To clarify the structure of a function call, the arguments can split up across different lines, but keeping them vertically aligned helps readability:

~~~~
(3 * (
  (2 * 4) + (3 + 5)
)) +
  (
  (10 - 7) + 6 
)
~~~~

The online editor will automatically pretty-print for you. You can re-indent according to this style by selecting some lines and pressing the TAB key.

We often want to name objects in our programs so that they can be reused. This can be done with the `var` statement. `var` looks like this:

~~~~ norun
var variableName = expression
~~~~

`variableName` is a *symbol* that is bound to the value that `expression` evaluates to. When variables themselves are evaluated they return the value that they have been bound to:

~~~~
var someVariable = 3 // assign the value 10 to the variable someVariable

someVariable // when this is evaluated it looks up and returns the value 10
~~~~

Assignment of variables requires use of `var` 

~~~
someVariable = 3
someVariable
~~~

# Arrays and objects

There are several special kinds of values in WebPPL. One kind of special value is an *array*: a sequence of other values. 

~~~~
["this", "is", "an", "array"]
~~~~


# Building Functions: `function`

The power of functional programming comes from the ability to make new functions. To do so, we use the `function` primitive. For example, we can construct a function that doubles any number it is applied to:

~~~~
var double = function(x) {
	return x + x
}

double(3)
~~~~

The general form of a lambda expression is: `function(arguments){ body }`.
The first sub-expression of the function, the arguments, is a list of symbols that tells us what the inputs to the function will be called; the second sub-expression, the body, tells us what to do with these inputs. The value which results from a function  is called a *compound procedure*. When a compound procedure is applied to input values (e.g. when `double` was applied to `3`) we imagine identifying (also called *binding*) the argument variables with these inputs, then evaluating the body. 

In functional programming, we can build procedures that manipulate any kind of value---even other procedures. Here we define a function `twice` which takes a procedure and returns a new procedure that applies the original twice:

~~~~
var double = function(x) { return x + x }

var twice = function(f) { 
	return function(x) { return f(f(x)) }
}

twice(double)(3)
~~~~

This ability to make *higher-order* functions is what makes the lambda calculus a universal model of computation.

# Higher-Order Functions

Higher-order functions can be used to represent common patterns of computation. Several such higher-order functions are provided in Church. 

`map` is a higher-order function that takes a procedure and applies it to each element of a list. For instance we could use map to test whether each element of a list of numbers is greater than zero:

~~~~
map(function(x){
	return x > 0
}, [1, -3, 2, 0])
~~~~ 

The `map` higher-order function can also be used to map a function of more than one argument over multiple lists, element by element.  For example, here is the MATLAB "dot-star" function (or ".*") written using `map`:

~~~~
var dotStar = function(v1, v2){
  map2( 
    function(x,y){ return x * y }, 
    v1, v2)
}

dotStar([1,2,3], [4,5,6])
~~~~

The higher-order function `apply`, takes a procedure and applies to a list as if the list were direct arguments to the procedure.  The standard functions `sum` and `product` can be easily defined in terms of `(apply + ...)` and `(apply * ...)`, respectively.  To illustrate this:

~~~~
 // (define my-list '(3 5 2047))
// (list "These numbers should all be equal:" (sum my-list) (apply + my-list) (+ 3 5 2047))
~~~~



## Functions
The most awesome thing about programming is making functions

~~~~
var f = function(x) { return x + 3 }

var y = f(3)
y
~~~~

And the coolest thing is that functions can be arguments of other functions!

~~~~
var g = function(y) { return y(3) + 2 }
var f = function(x) { return x + 3 }

g(f)

// this can also be done without defining f explicitly

g(function(x) { return x + 3 })
~~~~

Wait what just happened?

`repeat` is a built-in function that takes another function as an argument. it repeats it how many ever times you want

~~~~
var g = function(){ return 8 }
repeat(100, g)
// why can't you do repeat(100, 8)?
~~~~

# if statements

~~~~
// (if ) ? (then ) : (else )

// 3 == 3 ? "yes" : "no"

var f = function(x) { 
  var y = x*2
  return x > 3 ? x : y 
}

print(f(3))
print(f(4))
~~~~

# Probability
WebPPL has distributions built into it

~~~~
// flip()

// viz.hist(repeat(1000, flip))

// sample(Bernoulli(...)) is equivalent to flip(..)
// var parameters = {"p": 0.9}
// sample( Bernoulli( parameters ) )


// sample(Discrete( {ps: [0.3, 0.4, 0.3] } ))
// sample(Categorical( {ps: [0.3, 0.4, 0.3] , vs: ["zero", "one", "two"] } ) )
viz.hist(
  repeat(
    100,
    function(){ 
      return categorical({ps: [1, 1, 1], vs: ["zero", "one", "two"] })
    }
  )
)
~~~~

What happened there?
First, we made a distribution `Bernoulli({p: 0.5 }) ` and then we called the function `sample` on it.

~~~~
var myParameters = {"p": 0.5}
var myDistribution = Bernoulli(myParameters)
sample(myDistribution)
~~~~

Same thing.

The nice thing about this is we can make functions with distributions!

~~~~
var coinWeight = 0.9

var coin = function(weight){
  return flip(weight) ? "Heads" : "Tails"
}

// here, we had make a new function because coin took an argument
// repeat only accepts functions with no arguments
repeat(100, function(){return coin(coinWeight)})
~~~~

Let's pass the basic coin to `repeat`. Notice that coin is a function with NO arguments. This is called a **thunk**, and is a very common type of function in functional programming.

~~~~
var coin = function(){
  return sample(Bernoulli({p:0.5})) ? "Heads" : "Tails"
}

// repeat(100, coin)
viz.hist(repeat(100, coin))
~~~~

Since functions can call other functions. Can they call themselves?

~~~~
var geometricCoin = function(){
  return flip() ? 1 + geometricCoin() : 1
}

viz.hist(repeat(1000,geometricCoin))
~~~~