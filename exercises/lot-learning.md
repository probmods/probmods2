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

Many people find the high probability assignmed by our model in (b) to `27` to be unintuitive (i.e. if we ran this as an experiment, 27 would be a very infrequent response). This suggests our model is an imperfect model of human intuitions. How could we decrease the probability of inferring `27`? (HINT: Consider the priors). 

## 2. The Number Game

When we used our model above to reason about continuations of sequences (e.g. $$1,4,...$$), our hypothesis space was defined over *rules*: abstract arithmetic functions.

In a related task called the *number game*, proposed in a [2001 paper by Josh Tenenbaum](https://web.mit.edu/cocosci/Papers/nips99preprint.ps), participants were presented with *sets* of numbers and asked how well different numbers completed them.  A rule-based generative model accurately captured responses for some stimuli (e.g. for $$16, 8, 2, 64$$ or $$60, 80, 10, 30$$, participants assigned high fit to powers of two and multiples of ten, respectively). But it failed to capture others. For instance, what numbers seem like good completions of the set $$16, 23, 19, 20$$? How good is 18, relative to 13, relative to 99? 

#### a)

We've implemented a rule-only model of this task for you below. Examine the posterior over rules for the following inputs: $$3$$, $$3, 9$$, $$3, 5, 9$$. For the example of just feeding in $$3$$, why are some rules so strongly preferred over others, even though they are assigned equal probability under the prior? (HINT: think about the likelihood; read the section of the linked number game paper on the *size principle* if you're stuck).

~~~~
///fold:
var filterByInRange =  function(set) {
  var inRange = function(v) {v <= 100 && v >= 0};
  return _.uniq(filter(inRange, set))
}

var genEvens = function() {
  return filter(function(v) {return v % 2 == 0}, _.range(1, 101))
}

var genOdds = function() {
  return filter(function(v) {return (v + 1) % 2 == 0}, _.range(1, 101))
}

var genMultiples = function(base) {
  var multiples = map(function(v) {return base * v}, _.range(100))
  return filterByInRange(multiples)
}

var genPowers = function(base) {
  var powers = map(function(v) {return Math.pow(base, v)}, _.range(100))
  return filterByInRange(powers)
}

var inSet = function(val, set) {
  return _.includes(set, val)
}

var getSetFromHypothesis = function(rule) {
  var parts = rule.split('_')
  return (parts[0] == 'multiples' ? genMultiples(parts[2]) : 
          parts[0] == 'powers' ? genPowers(parts[2]) :
          parts[0] == 'evens' ? genEvens() :
          parts[0] == 'odds' ? genOdds() :
          console.error('unknown rule' + rule))
};
///

// Considers 4 kinds of rules: evens, odds, and multiples and powers of small numbers <12
var makeRuleHypothesisSpace = function() {
  var multipleRules = map(function(base) {return 'multiples_of_' + base}, _.range(1, 12))
  var powerRules = map(function(base) {return 'powers_of_' + base}, _.range(1, 12))   
  return multipleRules.concat(powerRules).concat(['evens', 'odds'])
} 

// Takes an undordered array of examples of a concept in the number game
// and also a test query (i.e. a new number that the experimenter is asking about)
var learnConcept = function(examples, testQuery) {
 Infer({method: 'enumerate'}, function() {
   var rules = makeRuleHypothesisSpace()
   var hypothesis = uniformDraw(rules)
   var set = getSetFromHypothesis(hypothesis)
   mapData({data: examples}, function(example) {
     // note: this likelihood corresponds to size principle
     observe(Categorical({vs: set}), example)
   })
   return {hypothesis, testQueryResponse : inSet(set, testQuery)}
 }); 
}

var examples = [3]
var testQuery = 12
var posterior = learnConcept(examples, testQuery)
marginalize(posterior, function(x) {return x.hypothesis})
~~~~

#### b) 

Now supplement this model to include similarity-based hypotheses (represented most simply as intervals). 

~~~~
///fold:
var filterByInRange =  function(set) {
  var inRange = function(v) {v <= 100 && v >= 0};
  return _.uniq(filter(inRange, set))
}

var genEvens = function() {
  return filter(function(v) {return v % 2 == 0}, _.range(1, 101))
}

var genOdds = function() {
  return filter(function(v) {return (v + 1) % 2 == 0}, _.range(1, 101))
}

var genMultiples = function(base) {
  var multiples = map(function(v) {return base * v}, _.range(100))
  return filterByInRange(multiples)
}

var genPowers = function(base) {
  var powers = map(function(v) {return Math.pow(base, v)}, _.range(100))
  return filterByInRange(powers)
}

var inSet = function(val, set) {
  return _.includes(set, val)
}

///

// TODO: add a condition to this function that
// calls genInterval with the parameters extracted from
// your hypothesis string
// *Hint*: If you're having trouble converting fron strings to integgers try the lodash function _.parseInt().
var getSetFromHypothesis = function(rule) {
  var parts = rule.split('_')
  return (parts[0] == 'multiples' ? genMultiples(parts[2]) : 
          parts[0] == 'powers' ? genPowers(parts[2]) :
          parts[0] == 'evens' ? genEvens() :
          parts[0] == 'odds' ? genOdds() :
          parts[0] == 'between' ? genSetFromInterval(_.parseInt(parts[1]), _.parseInt(parts[3])) :
          console.error('unknown rule' + rule))
};

// TODO: this function should construct the interval
// of integers between the endpoints a and b
// *Hint*: Don't forget that `rage(a, b)` generates numbers from a up to (but not including) b.
var genSetFromInterval = function(a, b) {
  return _.range(a, b+1)
} 

var makeRuleHypothesisSpace = function() {
  var multipleRules = map(function(base) {return 'multiples_of_' + base}, _.range(1, 12))
  var powerRules = map(function(base) {return 'powers_of_' + base}, _.range(1, 12))   
  return multipleRules.concat(powerRules).concat(['evens', 'odds'])
} 

// TODO: build a list of all possible hypothesis intervals between 1 and 100
var makeIntervalHypothesisSpace = function() {
  var start = 1
  var end = 100
  var allIntervals = _.flatten(map(function(s) {
    return map(function(e) {
      return [s, e];
    }, genSetFromInterval(s+1, end))
  }, genSetFromInterval(start, end)))
  var createIntervalName = function(a, b) {
    return 'between_' + a + '_and_' + b
  }
  var intervalNames = map(function(x) {createIntervalName(x[0], x[1])}, allIntervals)
  return intervalNames
}


// Takes an undordered array of examples of a concept in the number game
// and also a test query (i.e. a new number that the experimenter is asking about)
var learnConcept = function(examples, testQuery) {
 Infer({method: 'enumerate'}, function() {
   var rules = makeRuleHypothesisSpace()
   // TODO: build space of intervals
   var intervals = makeIntervalHypothesisSpace()
   // TODO: implement a hypothesis prior that first assigns probability *lambda* to rules
   // and (1- lambda) to intervals, then samples uniformly within each class
   var hypothesis = flip(0.5) ? uniformDraw(rules) : uniformDraw(intervals)
   var set = getSetFromHypothesis(hypothesis)
   mapData({data: examples}, function(example) {
     // note: this likelihood corresponds to size principle
     observe(Categorical({vs: set}), example)
   })
   return {hypothesis, testQueryResponse : inSet(set, testQuery)}
 }); 
}

var examples = [3]
var testQuery = 12
var posterior = learnConcept(examples, testQuery)
marginalize(posterior, function(x) {return x.hypothesis})
~~~~

#### c)

Now examine the sets $$3$$, $$3, 6, 9$$, and $$3, 5,6,7,9$$. Sweep across all integers as testQueries to see the 'hotspots' of the model predictions. 

#### d)

Look at some of the data in the large-scale replication of the number game [here](https://openpsychologydata.metajnl.com/articles/10.5334/jopd.19/). Can you think of an additional concept people might be using that we did not include in our model?

<!--

  Ok, the goal here is to introduce josh's number game paradigm, and use it to illustrate and explore the ability of bayesian models to move between graded generalization and rule-like generalization.

  To do this it's important that the data are sets of numbers, not sequences as above. (Otherwise you don't get the range concepts with graded falloff...) I think it's still feasible to do this via enumeration, but might need to keep the range small.

  -->