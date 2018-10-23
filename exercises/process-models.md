---
layout: exercise
title: Rational process models - exercises
---

## Exercise 1. 

Consider once again the simple blicket detector experiment from the Conditional Dependence chapter and Bayesian Data Analysis exercises. Here, we have simplified the model such that the only free parameter is the base rate of being a blicket, and the participant only sees one data point of evidence at a time (i.e. one set of blocks that makes the machine beep).

~~~~
var detectingBlickets = function(evidence, params) {
  return Infer({method: 'rejection', samples: 50}, function() {
    var blicket = mem(function(block) {return flip(params.baseRate)})
    var power = function(block) {return blicket(block) ? .95 : .05}
    var machineBeeps = function(blocks) {
      return (blocks.length == 0 ? flip(0.05) :
              flip(power(first(blocks))) || machineBeeps(rest(blocks)))
    }
    condition(machineBeeps(evidence))
    return blicket('A')
  })
}
~~~~

In this exercise, you will extend your model from the Bayesian Data Analysis exercises to evaluate different process models on new data sets. 

Specifically, we went to Mars to study the cognition of the aliens that live there, and in addition to collecting judgements about whether 'A' was a blicket, we collected response times (RTs) to get better resolution into their cognitive processes. Response time is measured in behavioral experiments by calculating the time elapsed between presentation of the stimulus and the participant's response. 

Here is the (totally fake) data, where each row represents a particular subject's response and RT for a particular set of evidence.

~~~~
var marsData = [
  {subjectID: 1, evidence: ['A'], response: true, RT: .9},
  {subjectID: 1, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: true, RT: 1.1},
  {subjectID: 1, evidence: ['A', 'B', 'C'], response: true, RT: 1.2},
  {subjectID: 2, evidence: ['A'], response: true, RT: 4.5},
  {subjectID: 2, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: false, RT: 5},
  {subjectID: 2, evidence: ['A', 'B', 'C'], response: true, RT: 4},
]
~~~~

A) Write a linking function from your model to the observed response and RT, and infer the *baseRate* subjects likely have in mind.

HINT: use the `time` function we defined in class. there should be one `observe` function for the response and one for the RT. Remember that the first argument to `observe` must be a *distribution* object. 

~~~~ norun
var time = function(foo, trials) {
  var start = _.now()
  var ret = repeat(trials, foo)
  var end = _.now()
  return (end-start)/trials
}

var responseOutput = function(...) {
  ...
}

var rtOutput = function(...) {
  ...
}

var dataAnalysis = function() {
  var parameters = {...}

  map(function(dataPoint) {
    observe(responseOutput(...), dataPoint.response);
    observe(rtOutput(...), dataPoint.RT);
  }, data)

  return parameters
}


var nSamples = 500
// Do not change below
var opts = {method: 'MCMC', callbacks: [editor.MCMCProgress()], samples: nSamples}
var posterior = Infer(opts, dataAnalysis)
viz.marginals(posterior)
~~~~

B) Note that there is some subject variability in RT. Modify your model to allow the two subjects to have different base rates, and examine the posteriors over these two subject-level parameter. 

HINT: make a `baseRatePrior` function that uses `mem`

C) Try removing the observe statement for RT from your model so that you're just conditioning on 'response'. Then try removing the observe statement for 'response' so that you're just conditioning on RT. How does your inference about the baserates change or not change? What does this say about the information provided about the base rate from each source?

D) Now suppose we went to survey another group of aliens on Venus and collected the following data set. Run your BDA on these subjects. Do you conclude the same thing?

~~~~
var venusData = [
  {subjectID: 1, evidence: ['A'], response: true, RT: .9},
  {subjectID: 1, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: true, RT: 4},
  {subjectID: 1, evidence: ['A', 'B', 'C'], response: true, RT: 2},
  {subjectID: 2, evidence: ['A'], response: true, RT: 1.5},
  {subjectID: 2, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: false, RT: 5},
  {subjectID: 2, evidence: ['A', 'B', 'C'], response: true, RT: 2.2},
];
~~~~

E) Instead of fixing 'enumerate' in the `Infer` statement, lift the inference method and number of samples passed to Infer into your BDA, so that you as the scientist are inferring the inference method ('enumerate' vs. 'rejection') and parameters of inference (e.g. number of samples) the participant is using. Examine the posteriors: which algorithm are they most likely using?

Hint: When we `lift` variables instead of using fixed estimates, we express uncertainty over their values using priors. We can then compute posterior probabilities for those variables (conditioning on data). For an example, see `lazinessPrior` in the `dataAnalysisModel` in the BDA reading.

Hint: you may want to consider the [`randomInteger` distribution](http://docs.webppl.org/en/master/distributions.html#RandomInteger) as a prior on number of samples. And you may find the [`extend` helper function](http://docs.webppl.org/en/master/functions/other.html#extend) useful when manipulating the parameter object.

F) Do you think any of these algorithms are a good description of how you intuitively solve this problem? Explain what aspects of the inference may or may not be be analogous to what people do.
