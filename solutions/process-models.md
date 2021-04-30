---
layout: exercise
title: Rational process models - solutions
---

> Consider once again the simple blicket detector experiment from the Conditional Dependence chapter and Bayesian Data Analysis exercises.
> Here, we have simplified the model such that the only free parameter is the base rate of being a blicket and the participant only sees one data point of evidence at a time (i.e. one set of blocks that makes the machine beep).
>
> In this exercise, you will extend the model from the Bayesian Data Analysis exercises to evaluate different process models on new data sets.
>
> Specifically, imagine we went to Mars to study the cognition of the aliens that live there, and in addition to collecting judgements about whether `A` was a blicket, we also collected response times (RTs) to get a better resolution into their cognitive processes.
> Response time is measured in behavioral experiments by calculating the time elapsed between presentation of the stimulus and the participant's response.
> Assume that the participants make inferences about the base rate by sampling a certain number of times.
> If they take many samples, their responses will be more accurate but at the cost of longer RTs.
> If they take few samples, their responses may be noisier but have shorter RTs.
>
> For simplicity, assume that the RT measures are in the same units as returned by `timeIt()` (milliseconds).


## Exercise 1

> Complete the code to infer the posterior distributions of the base rate and that the model is conditioned on both the participants' responses and response times.

> HINT: The `observe()` function requires a distribution as its first parameter.

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
///

var getModelRT = function(func, numRepeats) {
  var rt = repeat(numRepeats, function() { timeIt(func) });
  return Gaussian({mu: listMean(rt), sigma: Math.max(listVar(rt), 1)});
}

var dataAnalysis = function() {
  var baseRate = uniform(0, 1);
  var numSamples = randomInteger(100) + 1;
  
  map(function(datapoint) {
    var blicketModel = function() { 
      return detectingBlickets(datapoint.evidence, baseRate, numSamples)
    };
    
    observe(blicketModel(), datapoint.response);
    observe(getModelRT(blicketModel, 10), datapoint.RT);
  }, marsData);

  return {baseRate, numSamples};
}

var opts = {method: 'MCMC',
            callbacks: [editor.MCMCProgress()], 
            samples: 500,
            burn: 100};
viz.marginals(Infer(opts, dataAnalysis));
~~~


## Exercise 2

> How do your inferences about the base rates change with the following modifications?
>
> 1. Only `observe()` on `response`.
> 2. Only `observe()` on `RT`.
>
> What does this say about the information provided about the base rate from each source?

Looking at just the responses, we see that the `base rate` is relatively high.
This is because 5 of the 6 responses were `true`.
Looking at just the `RT`, we now see that the `base rate` is much lower.
This is because slow `RT` means that more proposals were rejected which suggests a low `base rate`.


## Exercise 3

> Note that there is some subject variability in RT.
> Modify your model to allow the two subjects to have different base rates in mind.
> Visualize the base rates for each participant.
> 
> What do you notice about the base rates?
> What makes their base rates so different?


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

var getModelRT = function(func, numRepeats) {
  var rt = repeat(numRepeats, function() { timeIt(func) });
  return Gaussian({mu: listMean(rt), sigma: Math.max(listVar(rt), 1)});
}
///

var dataAnalysis = function() {
  var baseRate = mem(function(subjectID) { uniform(0, 1) });
  var numSamples = randomInteger(100) + 1;
  
  map(function(datapoint) {
    var blicketModel = function() { 
      return detectingBlickets(datapoint.evidence, baseRate(datapoint.subjectID), numSamples)
    };
    
    observe(blicketModel(), datapoint.response);
    observe(getModelRT(blicketModel, 10), datapoint.RT);
  }, marsData);

  return {subject1: baseRate(1),
          subject2: baseRate(2),
          numSamples: numSamples};
}

var opts = {method: 'MCMC',
            callbacks: [editor.MCMCProgress()], 
            samples: 500,
            burn: 100};
viz.marginals(Infer(opts, dataAnalysis));
~~~

Looking at the responses, we see that Subject 1 responds `true` to trial 2 whereas Subject 2 responds `false`.
This suggests that Subject 1 has a very high prior believing that a block is a Blicket since there are 6 blocks that could have set the machine off.
Looking at the response times (RT), we see that Subject 1 was very quick to respond while Subject 2 took much longer.
Since we assumed that they both used rejection sampling, Subject 2 most likely had far more rejections which also indicates a low prior.


## Exercise 4

> Suppose we went to survey another group of aliens on Venus and collected another data set.
> Run this same BDA on these subjects.
> How do the Venusians compare to the Martians?

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

var venusData = [
  {subjectID: 1, evidence: ['A'], response: true, RT: .9},
  {subjectID: 1, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: true, RT: 4},
  {subjectID: 1, evidence: ['A', 'B', 'C'], response: true, RT: 2},
  {subjectID: 2, evidence: ['A'], response: true, RT: 1.5},
  {subjectID: 2, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: false, RT: 5},
  {subjectID: 2, evidence: ['A', 'B', 'C'], response: true, RT: 2.2},
];

var getModelRT = function(func, numRepeats) {
  var rt = repeat(numRepeats, function() { timeIt(func) });
  return Gaussian({mu: listMean(rt), sigma: Math.max(listVar(rt), 1)});
}
///

var dataAnalysis = function() {
  var baseRate = mem(function(subjectID) { uniform(0, 1) });
  var numSamples = randomInteger(100) + 1;
  
  map(function(datapoint) {
    var blicketModel = function() { 
      return detectingBlickets(datapoint.evidence, baseRate(datapoint.subjectID), numSamples)
    };
    
    observe(blicketModel(), datapoint.response);
    observe(getModelRT(blicketModel, 10), datapoint.RT);
  }, venusData);

  return {subject1: baseRate(1),
          subject2: baseRate(2),
          numSamples: numSamples};
}

var opts = {method: 'MCMC',
            callbacks: [editor.MCMCProgress()], 
            samples: 500,
            burn: 100};
viz.marginals(Infer(opts, dataAnalysis));
~~~

The trends are fairly similar.


## Exercise 5

> Suppose you want to compare the hypotheses that the aliens use rejection sampling versus enumeration to estimate probabilities.
> Modify your code to infer the posterior probabilities of each method for each planet.
> Which algorithm is each kind of alien most likely to be using?

> Hint: Make `method` a random variable.


~~~
///fold:
var timeIt = function(func) {
  var start = _.now();
  func();
  var end = _.now();
  return end - start;
}

var detectingBlickets = function(evidence, baseRate, algorithm, numSamples) {
  return Infer({method: algorithm, samples: numSamples}, function() {
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

var data = [
  {planet: 'Mars', subjectID: 1, evidence: ['A'], response: true, RT: .9},
  {planet: 'Mars', subjectID: 1, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: true, RT: 1.1},
  {planet: 'Mars', subjectID: 1, evidence: ['A', 'B', 'C'], response: true, RT: 1.2},
  {planet: 'Mars', subjectID: 2, evidence: ['A'], response: true, RT: 3.5},
  {planet: 'Mars', subjectID: 2, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: false, RT: 4},
  {planet: 'Mars', subjectID: 2, evidence: ['A', 'B', 'C'], response: true, RT: 3.4},
  {planet: 'Venus', subjectID: 3, evidence: ['A'], response: true, RT: .9},
  {planet: 'Venus', subjectID: 3, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: true, RT: 4},
  {planet: 'Venus', subjectID: 3, evidence: ['A', 'B', 'C'], response: true, RT: 2},
  {planet: 'Venus', subjectID: 4, evidence: ['A'], response: true, RT: 1.5},
  {planet: 'Venus', subjectID: 4, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: false, RT: 5},
  {planet: 'Venus', subjectID: 4, evidence: ['A', 'B', 'C'], response: true, RT: 2.2},
];


var getModelRT = function(func, numRepeats) {
  var rt = repeat(numRepeats, function() { timeIt(func) });
  return Gaussian({mu: listMean(rt), sigma: Math.max(listVar(rt), 1)});
}
///

var dataAnalysis = function() {
  var baseRate = mem(function(subjectID) { uniform(0, 1) });
  var algorithm = mem(function(planet) { flip() ? 'rejection' : 'enumerate' });
  var numSamples = randomInteger(100) + 1;
  
  map(function(datapoint) {
    var blicketModel = function() { 
      return detectingBlickets(datapoint.evidence,
                               baseRate(datapoint.subjectID),
                               algorithm(datapoint.planet),
                               numSamples)
    };
    
    observe(blicketModel(), datapoint.response);
    observe(getModelRT(blicketModel, 10), datapoint.RT);
  }, data);

  return {algVenus: algorithm('Venus'),
          algMars: algorithm('Mars')};
}

var opts = {method: 'MCMC',
            callbacks: [editor.MCMCProgress()], 
            samples: 500,
            burn: 100};
viz.marginals(Infer(opts, dataAnalysis));
~~~


## Exercise 6

> Do you think any of these algorithms are good descriptions of how people intuitively do the Blicket task?
> Explain what aspects of the inference may or may not be analogous to what people do.

Answers may vary. Some possible observations are
1. Full enumeration seems unlikely when many blocks are involved since people would have to calculate probability estimates for an exponential number of quantities.
2. Rejection sampling would be difficult when most of the proposed samples are rejected.