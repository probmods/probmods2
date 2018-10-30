---
layout: exercise
title: Learning with a language of thought - exercises
---

## 1. Inferring Functions

Consider our model of function inference from the chapter:

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

var plus = function(a,b) {
  return a + b;
}

var multiply = function(a,b) {
  return Math.round(a * b,0);
}

var divide = function(a,b) {
  return Math.round(a/b,0);
}

var minus = function(a,b) {
  return a - b;
}

var power = function(a,b) {
  return Math.pow(a,b);
}

// make expressions runnable
var runify = function(e) {
  if (e == 'x') {
    return function(z) { return z }
  } else if (_.isNumber(e)) {
    return function(z) { return e }
  } else {
    var op = (e[0] == '+') ? plus : 
             (e[0] == '-') ? minus :
             (e[0] == '*') ? multiply :
             (e[0] == '/') ? divide :
              power;
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
  if (flip(0.3)) {
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

viz.table(Infer({method: 'enumerate', maxExecutions: 100}, function() {
  var e = randomArithmeticExpression();
  var s = prettify(e);
  var f = runify(e);
  
  condition(f(0) == 0)
  condition(f(2) == 4)
  
  return {s: s};
}))
~~~~

#### a)

Why does this think the probability of `x * 2` is so much lower than `x * x`?

HINT: Think about the probability assigned to `x ^ 2`.

#### b)

Let's reconceptualize our program as a sequence-generator by making the input arguments $$1,2,3,\dots$$. Suppose that the first number in the sequence ($$f(1)$$) is `1` and the second number ($$f(2)$$) is `4`. What number comes next?

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

var plus = function(a,b) {
  return a + b;
}

var multiply = function(a,b) {
  return Math.round(a * b,0);
}

var divide = function(a,b) {
  return Math.round(a/b,0);
}

var minus = function(a,b) {
  return a - b;
}

var power = function(a,b) {
  return Math.pow(a,b);
}

// make expressions runnable
var runify = function(e) {
  if (e == 'x') {
    return function(z) { return z }
  } else if (_.isNumber(e)) {
    return function(z) { return e }
  } else {
    var op = (e[0] == '+') ? plus : 
             (e[0] == '-') ? minus :
             (e[0] == '*') ? multiply :
             (e[0] == '/') ? divide :
              power;
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
  if (flip(0.3)) {
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
  
  condition(f(1) == 1)
  condition(f(2) == 4)
  
  return {'f(3)':f(3)};
}))
~~~~

Not surprisingly, the model predicts `9` as the most likely next number. However, it also puts significant probability on `27`. Why does this happen? 

#### c)

Many people find the high probability assignmed by our model in (b) to `27` to be unintuitive. This suggests our model is an imperfect model of human intuitions. How could we decrease the probability of inferring `27`? (HINT: Consider the priors). 

## 2. The Number Game

When we used our model above to reason about continuations of sequences (e.g. $$1,4,...$$), our hypothesis space was defined over *rules*: abstract arithmetic functions.

In a related task called the *number game*, proposed by Josh Tenenbaum, participants were presented with sets of numbers and asked how well different numbers completed them.  While a rule-based generative model accurately capture responses for some stimuli (e.g. for $$16, 8, 2, 64$$ or $$60, 80, 10, 30$$, participants assigned high fit to powers of two and multiples of ten, respectively), it fails to capture others. For instance, what numbers seem like good completions of the set $$16, 23, 19, 20$$? How good is 18, relative to 13, relative to 99? 

#### a)

Why don't 

#### b) 

Supplement your model above to 

<!--

  Ok, the goal here is to introduce josh's number game paradigm, and use it to illustrate and explore the ability of bayesian models to move between graded generalization and rule-like generalization.

  To do this it's important that the data are sets of numbers, not sequences as above. (Otherwise you don't get the range concepts with graded falloff...) I think it's still feasible to do this via enumeration, but might need to keep the range small.

  -->