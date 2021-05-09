---
layout: exercise
title: Learning as conditional inference - solutions
---

## Exercise 1: Inferring Functions

> Consider our model of function inference from the chapter.
> We can reconceptualize our program as a sequence-generator by making the input arguments 1,2,3,….
> Suppose that the first number in the sequence `f(1)` is 1 and the second number `f(2)` is 4.
> What number would come next?

~~~~
///fold:
// make expressions easier to look at
var prettify = function(e) {
  if (e == 'x' || _.isNumber(e)) {
    return e
  } else {
    var op = e[0]
    var arg1 = prettify(e[1])
    var prettyarg1 = (!_.isArray(e[1]) ? arg1 : '(' + arg1 + ')')
    var arg2 = prettify(e[2])
    var prettyarg2 = (!_.isArray(e[2]) ? arg2 : '(' + arg2 + ')')
    return prettyarg1 + ' ' + op + ' ' + prettyarg2
  }
}

// make expressions runnable
var runify = function(e) {
  //helper functions:
  var plus = function(a,b) {return a + b}
  var multiply = function(a,b) {return Math.round(a * b,0)}
  var divide = function(a,b) {return Math.round(a/b,0)}
  var minus = function(a,b) {return a - b}
  var power = function(a,b) {return Math.pow(a,b)}
  var identity = function(a) {return a}
  
  if (e == 'x') {
    return identity
  } else if (_.isNumber(e)) {
    return function(z) { return e }
  } else {
    var op = (e[0] == '+') ? plus : 
             (e[0] == '-') ? minus :
             (e[0] == '*') ? multiply :
             (e[0] == '/') ? divide :
              power
    var arg1Fn = runify(e[1])
    var arg2Fn = runify(e[2])
    return function(z) {
      return op(arg1Fn(z),arg2Fn(z))
    }
  }
}

var randomConstantFunction = function() {
  return uniformDraw(_.range(10))
}

var randomCombination = function(f,g) {
  var op = uniformDraw(['+','-','*','/','^']);
  return [op, f, g];
}

// sample an arithmetic expression
var randomArithmeticExpression = function() {
  if (flip()) {
    return randomCombination(randomArithmeticExpression(), randomArithmeticExpression())
  } else {
    if (flip()) {
      return 'x'
    } else {
      return randomConstantFunction()
    }
  }
}
///

viz.table(Infer({method: 'enumerate', maxExecutions: 10000}, function() {
  var e = randomArithmeticExpression();
  var s = prettify(e);
  var f = runify(e);
  
  condition(f(1) == 1);
  condition(f(2) == 4);
  return f(3);
}))
~~~~


### Exercise 1.1

> Not surprisingly, the model predicts `9` as the most likely result for `f(3)`.
> However, it also puts significant probability on `27`.
> Explain why these two numbers have the highest posterior probabilities.

These results are largely due to the high probability of the functions `x * x` and `x ^ x`, which return `9` and `27` for `f(3)`, respectively.


### Exercise 1.2

> Why is the probability of `x ^ 2` is so much lower than `x * x`?

> HINT: Think about the probability assigned to `x ^ 2`.

The two expressions differ in the final draw from the recursive function `randomArithmeticExpression`.
On each step through the function, there is a 0.3 * 0.5 = 0.15 chance of returning `x`, but only a 0.3 * 0.5 * 0.1 = 0.015 chance of drawing `2`.
In general, drawing an `x` is much likely than drawing any particular number.

We can check these with the following modification:

~~~~norun
viz.table(Infer({method: 'enumerate', maxExecutions: 10000}, function() {
  var e = randomArithmeticExpression();
  var s = prettify(e);
  var f = runify(e);
  
  condition(f(1) == 1);
  condition(f(2) == 4);
  
  return s;
}))
~~~~

### Exercise 1.3

> Many people find the high probability assigned to `27` to be unintuitive (i.e. if we ran this as an experiment, 27 would be a very infrequent response).
> This suggests our model is an imperfect model of human intuitions. How could we decrease the probability of inferring `27`?
>
> HINT: Consider the priors.

Currently, each function (`*`, `^`, `+`) is equally likely (they are drawn from a uniform distribution).
We could decrease the probability of the latter function by decreasing the probability of drawing `^`, e.g.

~~~~norun
var randomCombination = function(f,g) {
  var op = categorical({vs: ['+','-','*','/','^'], ps: [.24, .24, .24, .24, .04]});
  return [op, f, g];
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
