---
layout: chapter
title: Learning with a language of thought
description: Compositional hypothesis spaces.
chapter_num: 10
---

<!--
    * **add number game?**

    * **more on LoT / RR style models**

-->


An important worry about Bayesian models of learning is that the Hypothesis space must either be too simple (as in the models above), specified in a rather ad-hoc way, or both. There is a tension here: human representations of the world are enormously complex and so the space of possible representations must be correspondingly big, and yet we would like to understand the representational resources in simple and uniform terms. How can we construct very large (possibly infinite) hypothesis spaces, and priors over them? One possibility is to use a grammar to specify a *hypothesis language*: a small grammar can generate an infinite array of potential hypotheses. Because grammars are themselves generative processes, a prior is provided for free from this formulation.

## Example: Inferring an Arithmetic Expression

<!--
We generate an expression as a list, and then turn it into a value (in this case a procedure) by using `apply`---a function that invokes evaluation.

~~~~
var randomArithmeticExpression = function() {
  return (flip(.7) ?
          (flip() ? 'x' : randomInteger({n: 10})) :
	  (randomArithmeticExpression()
	  + categorical({vs: ['+', '-'], ps: [.5, .5]})
	  + randomArithmeticExpression()));
};

var funcFromExpression = function(expression) {
  return _top.eval('(function(x) { ' + expression + '})');
};

var expressionPosterior = Infer({method: 'enumerate', maxExecutions: 100}, function() {
  var fExpression = randomArithmeticExpression();
  var f = funcFromExpression(fExpression);
  condition(f(1) == 3);
  return fExpression;
});

viz.table(expressionPosterior);
~~~~
-->

Consider the following WebPPL program, which induces an arithmetic function from examples. This model can learn any function consisting of the integers 0 to 9 and the operations add, subtract, multiply, divide, and raise to a power. (The helper functions `prettify` and `runify`, above the fold, make the expression pretty to look at and a runnable function, respectively.)

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
///

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

viz.table(Infer({method: 'enumerate', maxExecutions: 100}, function() {
  var e = randomArithmeticExpression();
  var s = prettify(e);
  var f = runify(e);
  condition(f(1) == 3);

  return {s: s};
}))
~~~~

The query asks for an arithmetic expression on variable `x` such that it evaluates to `3` when `x` is `1`. In this example there are many extensionally equivalent ways to satisfy the condition, for instance the expressions `3`, `1 + 2`, and `x + 2`, but because the more complex expressions require more choices to generate, they are chosen less often. What happens if we observe more data? For instance, try changing the condition in the above query to `f(1) == 3 && f(2) == 4`. This model learns from an infinite hypothesis space---all expressions made from 'x', '+', '-', and constant integers---but specifies both the hypothesis space and its prior using the simple generative process `randomArithmeticExpression`.

Notice that the model puts the most probability on a function that always returns `3` ($$f(x) = 3$$). This is the simplest hypothesis consistent with the data. Let's see what happens if we have more data:

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

viz.table(Infer({method: 'enumerate', maxExecutions: 100}, function() {
  var e = randomArithmeticExpression();
  var s = prettify(e);
  var f = runify(e);
  condition(f(1) == 3);
  condition(f(2) == 6);

  return {s: s};
}))
~~~~


## Example: Rational Rules

How can we account for the productivity of human concepts (the fact that every child learns a remarkable number of different, complex concepts)? The "classical" theory of concepts formation accounted for this productivity by hypothesizing that concepts are represented compositionally, by logical combination of the features of objects (see for example Bruner, Goodnow, and Austin, 1951). That is, concepts could be thought of as rules for classifying objects (in or out of the concept) and concept learning was a process of deducing the correct rule.

While this theory was appealing for many reasons, it failed to account for a variety of categorization experiments. Here are the training examples, and one transfer example, from the classic experiment of Medin and Schaffer (1978). The bar graph above the stimuli shows the portion of human participants who said that bug was a "fep" in the test phase (the data comes from a replication by Nosofsky, Gluck, Palmeri, McKinley (1994); the bug stimuli are courtesy of Pat Shafto):

<img src='../assets/img/Medin54-bugs.png' width='500' />

Notice three effects: there is a gradient of generalization (rather than all-or-nothing classification), some of the Feps are better (or more typical) than others (this is called "typicality"), and the transfer item is a ''better'' Fep than any of the Fep exemplars (this is called "prototype enhancement"). Effects like these were difficult to capture with classical rule-based models of category learning, which led to deterministic behavior. As a result of such difficulties, psychological models of category learning turned to more uncertain, prototype and exemplar based theories of concept representation. These models were able to predict behavioral data very well, but lacked  compositional conceptual structure.

Is it possible to get graded effects from rule-based concepts? Perhaps these effects are driven by uncertainty in *learning* rather than uncertainty in the representations themselves? To explore these questions Goodman, Tenenbaum, Feldman, and Griffiths (2008) introduced the Rational Rules model, which learns deterministic rules by probabilistic inference. This model has an infinite hypothesis space of rules (represented in propositional logic), which are generated compositionally. Here is a slightly simplified version of the model, applied to the above experiment:

~~~~
// first set up the training (cat A/B) and test objects:
var numFeatures = 4;

var makeObj = function(l) {return _.zipObject(['trait1', 'trait2', 'trait3', 'trait4'], l)}
var AObjects = map(makeObj, [[0,0,0,1], [0,1,0,1], [0,1,0,0], [0,0,1,0], [1,0,0,0]])
var BObjects = map(makeObj, [[0,0,1,1], [1,0,0,1], [1,1,1,0], [1,1,1,1]])
var TObjects = map(makeObj, [[0,1,1,0], [0,1,1,1], [0,0,0,0], [1,1,0,1], [1,0,1,0], [1,1,0,0], [1,0,1,1]])

//here are the human results from Nosofsky et al, for comparison:
var humanA = [.77, .78, .83, .64, .61]
var humanB = [.39, .41, .21, .15]
var humanT = [.56, .41, .82, .40, .32, .53, .20]

// two parameters: stopping probability of the grammar, and noise probability:
var tau = 0.3;
var noiseParam = Math.exp(-1.5)

// a generative process for disjunctive normal form propositional equations:
var traitPrior = Categorical({vs: ['trait1', 'trait2', 'trait3', 'trait4'],
                              ps: [.25, .25, .25, .25]});
var samplePred = function() {
  var trait = sample(traitPrior);
  var value = flip()
  return function(x) {return x[trait] == value};
}

var sampleConj = function() {
  if(flip(tau)) {
    var c = sampleConj();
    var p = samplePred();
    return function(x) {return c(x) && p(x)};
  } else {
    return samplePred();
  }
}

var getFormula = function() {
  if(flip(tau)) {
    var c = sampleConj();
    var f = getFormula();
    return function(x) {return c(x) || f(x)};
  } else {
    return sampleConj();
  }
}

var rulePosterior = Infer({method: 'MCMC', samples: 20000}, function() {
  // sample a classification formula
  var rule = getFormula();
  // condition on correctly (up to noise) accounting for A & B categories
  var obsFnA = function(datum){observe(Bernoulli({p: rule(datum) ? 0.999999999 : noiseParam}), true)}
  mapData({data:AObjects}, obsFnA)
  var obsFnB = function(datum){observe(Bernoulli({p: !rule(datum) ? 0.999999999 : noiseParam}), true)}
  mapData({data:BObjects}, obsFnB)
  // return posterior predictive
  var allObjs = TObjects.concat(AObjects).concat(BObjects);
  return _.zipObject(_.range(allObjs.length), map(rule, allObjs));
})

//build predictive distribution for each item
var predictives = map(function(item){return expectation(rulePosterior,function(x){x[item]})}, _.range(15))

var humanData = humanT.concat(humanA).concat(humanB)
viz.scatter(predictives, humanData)
~~~~
<!--note: this also works fine with enumerate.. switch?-->

Goodman, et al, have used to this model to capture a variety of classic categorization effects [@Goodman2008b]. Thus probabilistic induction of (deterministic) rules can capture many of the graded effects previously taken as evidence against rule-based models.

This style of compositional concept induction model, can be naturally extended to more complex hypothesis spaces. For examples, see:

* Compositionality in rational analysis: Grammar-based induction for concept learning. N. D. Goodman, J. B. Tenenbaum, T. L. Griffiths, and J. Feldman (2008). In M. Oaksford and N. Chater (Eds.). The probabilistic mind: Prospects for Bayesian cognitive science.

* A Bayesian Model of the Acquisition of Compositional Semantics. S. T. Piantadosi, N. D. Goodman, B. A. Ellis, and J. B. Tenenbaum (2008). Proceedings of the Thirtieth Annual Conference of the Cognitive Science Society.

* Piantadosi, S. T., & Jacobs, R. A. (2016). Four Problems Solved by the Probabilistic Language of Thought. Current Directions in Psychological Science, 25(1).

It has been used to model theory acquisition, learning natural numbers concepts, etc. Further, there is no reason that the concepts need to be deterministic; in WebPPL stochastic functions can be constructed compositionally and learned by induction:

* Learning Structured Generative Concepts. A. Stuhlmueller, J. B. Tenenbaum, and N. D. Goodman (2010). Proceedings of the Thirty-Second Annual Conference of the Cognitive Science Society.

Reading & Discussion: [Readings]({{site.baseurl}}/readings/lot-learning.html)

Test your knowledge: [Exercises]({{site.baseurl}}/exercises/lot-learning.html)
