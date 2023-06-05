---
layout: exercise
title: Rational process models - exercises
---

Consider once again the simple blicket detector experiment from the Conditional Dependence chapter and Bayesian Data Analysis exercises.
Here, we have simplified the model such that the only free parameter is the base rate of being a blicket and the participant only sees one data point of evidence at a time (i.e. one set of blocks that makes the machine beep).

In this exercise, you will extend the model from the Bayesian Data Analysis exercises to evaluate different process models on new data sets.

Specifically, imagine we went to Mars to study the cognition of the aliens that live there, and in addition to collecting judgements about whether `A` was a blicket, we also collected response times (RTs) to get a better resolution into their cognitive processes.
Response time is measured in behavioral experiments by calculating the time elapsed between presentation of the stimulus and the participant's response.
Assume that the participants make inferences about the base rate by sampling a certain number of times.
If they take many samples, their responses will be more accurate but at the cost of longer RTs.
If they take few samples, their responses may be noisier but have shorter RTs.

For simplicity, assume that the RT measures are in the same units as returned by `timeIt()` (milliseconds).


~~~
///fold:
var timeIt = function(func) {
  var start = _.now();
  func();
  var end = _.now();
  return end - start;
}

var detectingBlickets = function(evidence, baseRate, numSamples) {
  return Infer({method: 'rejection', samples: numSamples}, function() {
    var blicket = mem(function(block) { flip(baseRate) });
    var power = function(block) { blicket(block) ? .95 : .05 };
    var machineBeeps = function(blocks) {
      blocks.length == 0
        ? flip(0.05)
        : flip(power(first(blocks))) || machineBeeps(rest(blocks))
    };
    condition(machineBeeps(evidence));
    return blicket('A');
  })
}

var marsData = [
  {subjectID: 1, evidence: ['A'], response: true, RT: .9},
  {subjectID: 1, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: true, RT: 1.1},
  {subjectID: 1, evidence: ['A', 'B', 'C'], response: true, RT: 1.2},
  {subjectID: 2, evidence: ['A'], response: true, RT: 3.5},
  {subjectID: 2, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: false, RT: 4},
  {subjectID: 2, evidence: ['A', 'B', 'C'], response: true, RT: 3.4},
];

var venusData = [
  {subjectID: 1, evidence: ['A'], response: true, RT: .9},
  {subjectID: 1, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: true, RT: 4},
  {subjectID: 1, evidence: ['A', 'B', 'C'], response: true, RT: 2},
  {subjectID: 2, evidence: ['A'], response: true, RT: 1.5},
  {subjectID: 2, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: false, RT: 5},
  {subjectID: 2, evidence: ['A', 'B', 'C'], response: true, RT: 2.2},
];
///

var getModelRT = function(...) {
  // HINT: estimate the parameters by timing the model runtime by calling timeIt()
  ...
  // sigma should be at least 1
  return Gaussian({mu: ..., sigma: ...});
}

var dataAnalysis = function() {
  var baseRate = uniform(0, 1);
  var numSamples = randomInteger(100) + 1;
  
  map(function(datapoint) {
    ...
    observe(...);
    observe(...);
  }, marsData);

  return {baseRate, numSamples};
}

var opts = {method: 'MCMC',
            callbacks: [editor.MCMCProgress()], 
            samples: 500,
            burn: 100};
viz.marginals(Infer(opts, dataAnalysis));
~~~


## Exercise 1

Complete the code to infer the posterior distributions of the base rate and that the model is conditioned on both the participants' responses and response times.

HINT: The `observe()` function requires a distribution as its first parameter.


## Exercise 2

How do your inferences about the base rates change with the following modifications?

1. Only `observe()` on `response`.
2. Only `observe()` on `RT`.

What does this say about the information provided about the base rate from each source?


## Exercise 3

Note that there is some subject variability in RT.
Modify your model to allow the two subjects to have different base rates in mind.
Visualize the base rates for each participant.

What do you notice about the base rates?
What makes their base rates different?


## Exercise 4

Suppose we went to survey another group of aliens on Venus and collected another data set.
Run this same BDA on these subjects.
How do the Venusians compare to the Martians?


## Exercise 5

Suppose you want to compare the hypotheses that the aliens use rejection sampling versus enumeration to estimate probabilities.
Modify your code to infer the posterior probabilities of each method for each planet.
Which algorithm is each kind of alien most likely to be using?

Hint: Make `method` a random variable.


## Exercise 6

Do you think any of these algorithms are good descriptions of how people intuitively do the Blicket task?
Explain what aspects of the inference may or may not be analogous to what people do.
