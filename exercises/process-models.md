---
layout: exercise
title: Rational process models - exercises
---

## Exercise 1

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


#### a)

Complete the code to infer the posterior distributions of the base rate and that the model is conditioned on both the participants' responses and response times.

HINT: The `observe()` function requires a distribution as its first parameter.


#### b)

How do your inferences about the base rates change with the following modifications?

1. Only `observe()` on `response`.
2. Only `observe()` on `RT`.

What does this say about the information provided about the base rate from each source?


#### c)

Note that there is some subject variability in RT.
Modify your model to allow the two subjects to have different base rates in mind.
Visualize the base rates for each participant.

What do you notice about the base rates?
What makes their base rates different?


#### d)

Suppose we went to survey another group of aliens on Venus and collected another data set.
Run this same BDA on these subjects.
How do the Venusians compare to the Martians?


#### e)

Suppose you want to compare the hypotheses that the aliens use rejection sampling versus enumeration to estimate probabilities.
Modify your code to infer the posterior probabilities of each method for each planet.
Which algorithm is each kind of alien most likely to be using?

Hint: Make `method` a random variable.


#### f)

Do you think any of these algorithms are good descriptions of how people intuitively do the Blicket task?
Explain what aspects of the inference may or may not be analogous to what people do.

## Exercise 2

Consider the particle filter example from the chapter that we used to infer the number of hypotheses vocabulary-learners are entertaining. It's straightforward to apply this model to experimental datasets where subjects are learning names of novel objects. What's one problem you might run into in trying to apply it to understand children's actual learning in the real world? 

## Exercise 3

In the chapter, we investigated how many samples we should take when deciding whether to guess `heads` or `tails` for a coin of known weight. Let's consider a related problem. In this case, all we know is the weight of the coin is drawn from a uniform distribution from 0 to 1. We are allowed to flip the coin as many times as we want before guessing the outcome of the next flip. How many flips should we take? 

#### a) 

What's the best-case scenario? That is, suppose you know the actual weight of the coin. How often can you guess the next flip? 

~~~~
// your code here
~~~~

#### b)

Now figure out how often you could guess the next flip based on first flipping it 10 times. (Keep in mind that in this scenario, you can do as much inference as you want; no need to restrict samples during inference. It's the number of observations you can make about the coin that we are restricting.)