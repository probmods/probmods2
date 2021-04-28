---
layout: exercise
title: Algorithms for nested inference
---

We've seen that nested-Infer models are very useful for modeling social cognition and for doing Bayesian data analysis of Bayesian cognitive models. In a nested Infer there are *two* inference algorithm choices that have to be made. These choices interact. Let's explore...


# Combining algorithms

Below is a toy nested-Infer model. Try different combinations of algorithm choices (in `innerOpt` and `outerOpt`). How does run time vary? How accurate are the results? (For exploring bias and variance you can take the initial 'enumerate'/'enumerate' setting as the true answer.) 

Make sure to at least try different combinations of 'enumerate', 'rejection', and 'mcmc'!

~~~~
//a timing utility: run 'foo' 'trials' times, report average time.
var time = function(foo, trials) {
  var start = _.now()
  var ret = repeat(trials, foo)
  var end = _.now()
  return (end-start)/trials
}

var innerOpt = {method: 'enumerate'}
var inner = function(A) {Infer(innerOpt, function(){
  var C = flip(0.1)
  var D = flip(0.1)
  var w = flip( (C*A+D)/2 )
  condition(w)
  return C
})}
                       
var outerOpt = {method: 'enumerate'}
var outer = function(){Infer(outerOpt, function(){
    var A = flip(0.1)
    var B = flip(0.1)
    var C = sample(inner(A))
    condition(A+B+C >= 2)
    return C
})}          

viz(outer())
time(outer,100)
~~~~

For the special cases of 'enumerate'/'enumerate' and 'rejection'/'rejection', how does the run time for `outer()` depend on the run time for `inner`? (Recall you can affect run times by changing base rate and/or number of choices.)


# Caching

One way to reduce run time in order nested-Infer models is to *reuse* the results of the inner inference. Finish adjusting the below code to precompute and reuse the inner inference, see how run time differs from the earlier version. 

~~~~
//a timing utility: run 'foo' 'trials' times, report average time.
var time = function(foo, trials) {
  var start = _.now()
  var ret = repeat(trials, foo)
  var end = _.now()
  return (end-start)/trials
}

var innerOpt = {method: 'enumerate'}
var inner = function(A) {Infer(innerOpt, function(){
  var C = flip(0.1)
  var D = flip(0.1)
  var w = flip( (C*A+D)/2 )
  condition(w)
  return C
})}

//precompute values of inner inference for each input:
var innerATrue = ...
var innerAFalse = ...
                       
var outerOpt = {method: 'enumerate'}
var outer = function(){Infer(outerOpt, function(){
    var A = flip(0.1)
    var B = flip(0.1)
    //adjust this to use the precomputed values:
    var C = sample(inner(A))
    condition(A+B+C >= 2)
    return C
})}          

time(outer,100)
~~~~

Writing an explicit variable for each possible input to the inner function is cumbersome. An alternative is to *memoize* (or cache) the `inner` function -- since the inner function returns the same distribution every time it is called for each input, this doesn't change the meaning of the program. Try achieving the same reuse via `dp.cache`. (Note `dp.cache` is like `mem` but assumes the function it is applied to is deterministic, and can therefore work more efficiently.) This form of reuse is an instance of [dynamic programming](https://en.wikipedia.org/wiki/Dynamic_programming).

What happens, in terms of speed and accuracy, when you reuse the inner inference when using 'rejection'?


# Continuous variables

It is common, especially in BDA, to have an outer inference with continuous random variables, and an inner inference with discrete variables (either naturally or by discretizing the model). In this case we can't use `enumerate` for the outer inference. 

We have adjusted the model to have continuous variables. (Note we don't cache the inner inference. Why not?) Try different approaches for inference in the outer Infer. How does time and accuracy vary? (Try 'rejection' and 'MCMC' with both default and HMC proposals.)

~~~~
//a timing utility: run 'foo' 'trials' times, report average time.
var time = function(foo, trials) {
  var start = _.now()
  var ret = repeat(trials, foo)
  var end = _.now()
  return (end-start)/trials
}

var innerOpt = {method: 'enumerate'}
var inner = function(A) {Infer(innerOpt, function(){
  var C = flip(0.1)
  var D = flip(0.1)
  var p = (C*A+D)/2
  var w = flip( p<0?0 : p>1?1 : p)
  condition(w)
  return C
})}
                       
var outerOpt = {method: 'rejection'}
var outer = function(){Infer(outerOpt, function(){
    var A = gaussian(0,1)
    var B = gaussian(0,1)
    var C = sample(inner(A))
    condition(A+B+C >= 2)
    return C
})}          

viz(outer())
time(outer,100)
~~~~