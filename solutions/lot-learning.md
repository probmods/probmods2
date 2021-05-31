---
layout: exercise
title: Learning with a language of thought - solutions
---

## Exercise 1: Inferring Functions

> Consider our model of function inference from the chapter.
> We can reconceptualize our program as a sequence-generator by making the input arguments 1,2,3,….
> Suppose that the first number in the sequence `f(1)` is 1 and the second number `f(2)` is 4.
> What number would come next?

~~~~
///fold:
var plus = {fn: function(a,b) {return a + b}, expr: '+'}
var multiply = {fn: function(a,b) {return Math.round(a * b,0)}, expr: '*'}
var divide = {fn: function(a,b) {return Math.round(a/b,0)}, expr: '/'}
var minus = {fn: function(a,b) {return a - b}, expr: '-'}
var power = {fn: function(a,b) {return Math.pow(a,b)}, expr: '**'}
var binaryOps = [plus, multiply, divide, minus, power]

var identity = {fn: function(x) {return x}, expr: 'x'}

var randomConstantFunction = function() {
  var c = uniformDraw(_.range(10))
  return {fn: function(x){return c}, expr: c}
}

var randomCombination = function(f,g) {
  var op = uniformDraw(binaryOps);
  var opfn = op.fn
  var ffn = f.fn
  var gfn = g.fn
  return {fn: function(x){return opfn(ffn(x),gfn(x))}, 
          expr: f.expr+op.expr+g.expr}
}

// sample an arithmetic expression
var randomArithmeticExpression = function() {
  if (flip()) {
    return randomCombination(randomArithmeticExpression(), 
                             randomArithmeticExpression())
  } else {
    return flip() ? identity : randomConstantFunction()
  }
}
///

viz.table(Infer({method: 'enumerate', maxExecutions: 1000}, function() {
  var e = randomArithmeticExpression();
  var f = e.fn;
  
  condition(f(1) == 1);
  condition(f(2) == 4);
  
  return f(3); // use this for Exercise 1.1
//   return e.expr; // use this for Exercise 1.2
}))
~~~~


### Exercise 1.1

> Not surprisingly, the model predicts `9` as the most likely result for `f(3)`.
> However, it also puts significant probability on `27`.
> Explain why these two numbers have the highest posterior probabilities.

These results are largely due to the high probability of the functions `x * x` and `x ** x`, which return `9` and `27` for `f(3)`, respectively.


### Exercise 1.2

> Why is the probability of `x ** 2` is so much lower than `x * x`?

The two expressions differ in the final draw from the recursive function `randomArithmeticExpression`.
On each step through the function, there is a 0.3 * 0.5 = 0.15 chance of returning `x`, but only a 0.3 * 0.5 * 0.1 = 0.015 chance of drawing `2`.
In general, drawing an `x` is much likely than drawing any particular number.


### Exercise 1.3

> Many people find the high probability assigned to `27` to be unintuitive (i.e. if we ran this as an experiment, 27 would be a very infrequent response).
> This suggests our model is an imperfect model of human intuitions. How could we decrease the probability of inferring `27`?
>
> HINT: Consider the priors.

Currently, each function (`*`, `^`, `+`) is equally likely (they are drawn from a uniform distribution).
We could decrease the probability of the latter function by decreasing the probability of drawing `^`, e.g.

~~~~norun
var randomCombination = function(f,g) {
  var op = categorical({vs: binaryOps, ps: [.24, .24, .24, .24, .04]});
  var opfn = op.fn
  var ffn = f.fn
  var gfn = g.fn
  return {fn: function(x){return opfn(ffn(x),gfn(x))}, 
          expr: f.expr+op.expr+g.expr}
}
~~~~

It seems reasonable that people are less likely to consider sequences made from powers, though this would need to be confirmed empirically.



## Exercise 2: Role-governed concepts (optional)

In the Rational Rules model we saw in the chapter, concepts were defined in terms of the features of single objects (e.g. "it's a raven if it has black wings").
Psychologists have suggested that many concepts are not defined by the features of a single objects, but instead by the relations the object has to other objects.
For instance, "a key is something that opens a lock".
These are called *role-governed* concepts.

Extend the Rational Rules model to capture role-governed concepts.

Hint: You will need primitive relations in your language of thought.

Hint: Consider adding quantifiers (e.g. *there exists*) to your language of thought.
