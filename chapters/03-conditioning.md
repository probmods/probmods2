---
layout: chapter
title: Exploring the executions of a random computation
description: Implementing marginal inference by enumeration using continuations, coroutines, and CPS.
---

All inference techniques involve exploring the space of executions of a random computation in one way or another. In this section we consider how the many paths through a computation can be explored, aiming for an implementation that computes the marginal distribution of a computation by *enumerating* all possible executions.

## Exploring a random computation

Consider the simple binomial example from [earlier](WebPPL.html).

~~~
var binomial = function(){
  var a = sample(bernoulliERP, [0.5])
  var b = sample(bernoulliERP, [0.5])
  var c = sample(bernoulliERP, [0.5])
  return a + b + c
}

print(Enumerate(binomial))
~~~

We can view `sample` and `factor` as simple 'side-computations' for exploring the main `binomial` computation. To make this concrete, let's implement `sample` as an ordinary function that always chooses the first element of the support of any random choice. We will kick-off this exploration by calling `ExploreFirst`, which simply calls the computation. (In the following we rename `sample` to `_sample` to avoid conflicting with the built-in WebPPL `sample` function.)

~~~
// language: javascript

function _sample(erp, params) {
  return erp.support()[0]
}

function ExploreFirst(comp) {
  return comp()
}

var binomial = function(){
  var a = _sample(bernoulliERP, [0.5])
  var b = _sample(bernoulliERP, [0.5])
  var c = _sample(bernoulliERP, [0.5])
  return a + b + c
}

ExploreFirst(binomial)
~~~

This set of functions does indeed go back and forth between the binomial computation and the 'randomness handling' functions to explore a possible execution of the program.
However, it is only able to explore a single path through the computation. We would like to be able to 'return' from the `_sample` function *multiple times* with different values. If we could do so, we could try each value from the support to see what return values ultimately come from the computation. We can't do this by an ordinary function return, however; we need an explicit handle to the return context. We need to reify the *future of the computation* from the point that `sample` is called. Such a reified computation future is called a **continuation**.

## Continuations

A continuation is a function that expresses "what to do next" with the value of a computation. In the following, we give a few examples of continuations in use and describe what continuation-passing style is. This exposition is partly based on the articles [By example: Continuation-passing style in JavaScript](http://matt.might.net/articles/by-example-continuation-passing-style/) and [How to compile with continuations](http://matt.might.net/articles/cps-conversion/) by Matt Might.

Consider a function `square` that takes a number and returns its square. We call this function with the number 3 and print the result:

~~~~
var square = function(x) {
  return x * x;
}

print(square(3))
~~~~

At the point in the computation where the function returns `3 * 3`, what is it that the computation "does next" with this value? In this case, we print it to the screen. When a computer executes this program, it knows this (the computer has stored the command on the stack), but this information is not explicitly available during the execution of the program. The continuation is a function that represents this information explicitly. **Continuation-passing style** (CPS) is a way of writing programs such that the current continuation is always explicitly available.

Let's rewrite the program above with an explicit continuation function `k`:

~~~~
var cpsSquare = function(k, x) {
  k(x * x);
}

cpsSquare(print, 3)
~~~~

Now, when we get to `k(x * x)`, the variable `k` contains the function `print`, which is "what happens next" in the sense that we pass the value of `x * x` to this function instead of returning.

It is helpful to think that functions never return in continuation-passing style -- they only ever call continuations with the values that they would otherwise have returned.

Let's look at another example, the factorial function:

~~~~
var factorial = function(n) {
  if (n == 0) {
    return 1;
  } else {
    return factorial(n-1) * n;
  }
}

print(factorial(5))
~~~~

And in continuation-passing style:

~~~~
var cpsFactorial = function(k, n) {
  if (n == 0) {
    k(1);
  } else {
    cpsFactorial(
      function(x){ k(x * n) },
      n - 1);
  }
}

cpsFactorial(print, 5)
~~~~

Look at the `else` branch and note how continuation-passing style turns nested function applications "inside-out." In standard style, the product is on the outside and the result of the call to `factorial` is one of its arguments. In CPS, the call to `cpsFactorial` is on the outside, and it is its continuation argument that contains the information that the result of this function will be multiplied by `n`.

Compare to another way of writing the factorial function, the **tail-recursive** form. In this form, standard style and continuation-passing style are basically identical:

~~~~
// Standard tail-recursive version:
var factorial2 = function(n, a) {
  if (n == 0) {
    return a;
  } else {
    return factorial2(n-1, n*a);
  }
}

// CPS version:
var cpsFactorial2 = function(k, n, a) {
  if (n == 0) {
    k(a);
  } else {
    cpsFactorial2(k, n-1, n*a);
  }
}

print(factorial2(5, 1))

cpsFactorial2(print, 5, 1)
~~~~

A function is **tail-recursive** when the recursive call happens as the final action in a function, in which case it can happen without the function call stack growing. In continuation-passing style, there is no stack -- all function calls are tail calls, hence all recursive functions are tail-recursive.

Continuation-passing style is useful because it allows us to manipulate the execution of the program in ways that would otherwise be difficult. For example, we can use CPS to implement exception handling.

Let's look at `cpsFactorial` again. Suppose we want to throw an error when `n < 0`. By "throw an error", we mean that we stop whatever computations we would have done next and instead pass control to an error handler. This is easy in continuation-passing style: since there is no implicit stack -- i.e. no computations waiting to be performed -- all we have to do is call an error continuation.

~~~~
var totalCpsFactorial = function(k, err, n) {
  if (n < 0) {
    err("cpsFactorial: n < 0!")
  } else if (n == 0) {
    k(1);
  } else {
    totalCpsFactorial(
      function(x){ k(x * n) },
      err,
      n - 1);
  }
}

var printError = function(x){
  print("Error: " + x);
}

totalCpsFactorial(print, printError, 5)
totalCpsFactorial(print, printError, -1)
~~~~

As a final example, let's write our earlier binomial function in CPS:

~~~
// Standard version:
var binomial = function(){
  var a = sample(bernoulliERP, [0.5])
  var b = sample(bernoulliERP, [0.5])
  var c = sample(bernoulliERP, [0.5])
  return a + b + c
}

// CPS version:
var cpsSample = function(k, erp, params){
  return k(sample(erp, params))
}

var cpsBinomial = function(k){
  cpsSample(
    function(a){
      cpsSample(
        function(b){
          cpsSample(
            function(c){
              k(a + b + c);
            },
            bernoulliERP, [0.5])
        },
        bernoulliERP, [0.5])
    },
    bernoulliERP, [0.5])
}

cpsBinomial(print)
~~~

There are two things to note here:

First, we had to wrap the primitive function `sample` such that it takes a continuation. The same kind of wrapping can be applied to all functions that are defined outside of the code we are transforming.

Second, the sequence of definition statements was sequentialized in a way similar to how we transformed function applications above: We evaluate the (cps-ed) version of the first statement and pass the result to a continuation function that then evaluates the (cps-ed) version of the second statement, which then calls the (cps-ed) version of the third statement. When `a`, `b`, and `c` have all been evaluated, we can pass `a + b + c` to the global continuation function `k`.


## Coroutines: functions that receive continuations

Now we'll re-write the code above so that the `sample` function gets the continuation of the point where it is called, and keeps going by calling this continuation (perhaps several times), rather than by returning in the usual way. This pattern for a function that receives the continuation (often called a 'callback') from the main computation and returns only by calling the continuation is called a *coroutine*. (The above definition of `cpsBinomial`, using `_sample` again to avoid conflict with built-ins, is above the fold.)

~~~
// language: javascript

///fold:
function cpsBinomial(k){
  _sample(
    function(a){
      _sample(
        function(b){
          _sample(
            function(c){
              k(a + b + c);
            },
            bernoulliERP, [0.5])
        },
        bernoulliERP, [0.5])
    },
    bernoulliERP, [0.5])
}
///

unexploredFutures = []

function _sample(cont, erp, params) {
  var sup = erp.support(params)
  sup.forEach(function(s){unexploredFutures.push(function(){cont(s)})})
  unexploredFutures.pop()()
}

returnVals = []

function exit(val) {
  returnVals.push(val)
  if( unexploredFutures.length > 0 ) {
    unexploredFutures.pop()()
  }
}

function Explore(cpsComp) {
  cpsComp(exit)
  return returnVals
}

Explore(cpsBinomial)
~~~

The above code explores all the executions of the computation, but does not keep track of probabilities. We can extend it by simply adding scores to the futures, and keeping track of the score of the execution we are currently working on. Because we only care about the total probability of all paths with a given return value, we combine them into a 'histogram' mapping return values to (unnormalized) probabilities.

~~~
// language: javascript

///fold:
function cpsBinomial(k){
  _sample(
    function(a){
      _sample(
        function(b){
          _sample(
            function(c){
              k(a + b + c);
            },
            bernoulliERP, [0.5])
        },
        bernoulliERP, [0.5])
    },
    bernoulliERP, [0.5])
}
///

unexploredFutures = []
currScore = 0

function _sample(cont, erp, params) {
  var sup = erp.support(params)
  sup.forEach(function(s){
  var newscore = currScore + erp.score(params, s);
  unexploredFutures.push({k: function(){cont(s)}, score: newscore})})
  runNext()
}

function runNext(){
  var next = unexploredFutures.pop()
  currScore = next.score
  next.k()}

returnHist = {}

function exit(val) {
  returnHist[val] = (returnHist[val] || 0) + Math.exp(currScore)
  if( unexploredFutures.length > 0 ) {runNext()}
}

function ExploreWeighted(cpsComp) {
  cpsComp(exit)
  return returnHist
}

ExploreWeighted(cpsBinomial)
~~~

Finally, we need to deal with factor statements -- easy because they simply add a number to the current score -- and renormalize the final distribution.

~~~
// language: javascript

///fold:
function cpsBinomial(k){
  _sample(
    function(a){
      _sample(
        function(b){
          _sample(
            function(c){
              k(a + b + c);
            },
            bernoulliERP, [0.5])
        },
        bernoulliERP, [0.5])
    },
    bernoulliERP, [0.5])
}
///

unexploredFutures = []
currScore = 0

function _factor(s) { currScore += s}

function _sample(cont, erp, params) {
  var sup = erp.support(params)
  sup.forEach(function(s){
    var newscore = currScore + erp.score(params, s);
    unexploredFutures.push({k: function(){cont(s)}, score: newscore})})
  runNext()
}

function runNext(){
  var next = unexploredFutures.pop()
  currScore = next.score
  next.k()}

returnHist = {}

function exit(val) {
  returnHist[val] = (returnHist[val] || 0) + Math.exp(currScore)
  if( unexploredFutures.length > 0 ) {runNext()}
}

function Marginalize(cpsComp) {
  cpsComp(exit)

  //normalize:
  var norm = 0
  for (var v in returnHist) {
    norm += returnHist[v];
  }
  for (var v in returnHist) {
    returnHist[v] = returnHist[v] / norm;
  }
  return returnHist
}

Marginalize(cpsBinomial)
~~~

We can now do marginal inference by enumeration of an arbitrary (finite) computation! As long as we're willing to write it in CPS... which can be painful. Fortunately CPS can be done automatically, to relieve the programmer of the burden, while still enabling the coroutine method.


## Continuation-passing transform

A program can automatically be transformed into continuation-passing style. Let's look at what a naive transformation looks like for function expressions, function application, and constants.

Note: In the following examples, `CpsTransform` is to be read as a macro that transforms source code, not as an object-level function.

Function expressions take an additional argument, the continuation `k`:

~~~~
// static

// Before CPS
function(x, y, ...){
  // body
}

// After CPS
function(k, x, y, ...){
  CpsTransform(body, "k")
}
~~~~

Function applications are sequentialized---we first evaluate the (cps-transformed) operator and pass it to a (continuation) function; this function evaluates the (cps-transformed) argument and passes it to a (continuation) function; that function applies operator to operands, passing the current top-level continuation as an additional continuation argument `k`:

~~~~
// static

// Before CPS
f(x)

// After CPS (when f and x are variables):
f(k, x)

// After CPS (when f and x are compound expressions):
CpsTransform(f, function(_f){
  CpsTransform(x, function(_x){
    _f(k, _x)
  })
})
~~~~

Constant values get passed to the current continuation:

~~~~
// static

// Before CPS:
12

// After CPS (with top-level continuation k)
k(12)
~~~~

This is only a sketch. For a more detailed exposition, see [How to compile with continuations](http://matt.might.net/articles/cps-conversion/).


## CPS transform in action

The form below shows the transform we actually use for WebPPL programs. Try it out - expressions entered below will automatically be transformed:

<div id="cpsTransform">
    <textarea id="cpsInput">var f = function(x){
  return x + 1;
}
f(3);</textarea>
    <textarea id="cpsOutput"></textarea>
</div>



## Best-first enumeration

Above we have maintained a first-in-last-out queue of continuations; this results in a depth-first search strategy over program executions. Often a more useful approach is to enumerate the highest priority continuation first, based on some heuristic notion of priority. For instance, using the score-so-far as priority results in a most-likely-first strategy. We can achieve this by simply changing the above code to use a priority queue (instead of `push` and `pop`).

Here we compare different enumeration orders for a simple computation. The argument to the `Enumerate` methods indicates how many executions to complete before stopping. Try reducing it to 1, 2, and 3 to see what each method finds in the first few executions.

~~~
var binomial = function(){
    var a = sample(bernoulliERP, [0.1])
    var b = sample(bernoulliERP, [0.9])
    var c = sample(bernoulliERP, [0.1])
    return a + b + c
}

var numexec = 10

print(EnumerateDepthFirst(binomial, numexec))

print(EnumerateBreadthFirst(binomial, numexec))

print(EnumerateLikelyFirst(binomial, numexec))
~~~


## Caching

Because the return value from `Enumerate(foo)` is a deterministic marginal distribution, there is no reason to compute it multiple times even if it is used multiple times. Instead we can explicitly instruct the system to *cache* the marginal distribution.

Next chapter: [Patterns of inference](/chapters/04-patterns-of-inference.html)