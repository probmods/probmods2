---
layout: exercise
title: Rational process models - exercises
---

## Exercise 1. 

Consider once again the simple blicket detector model from the Conditional Dependence chapter and Bayesian Data Analysis exercises. Here, we have simplified the model such that the only free parameter is the base rate of being a blicket, and the participant only sees one data point (i.e. only one set of blocks that make it go off).

~~~~
var detectingBlickets = function(evidence, params) {
  return Infer({method: 'enumerate'}, function() {
    var blicket = mem(function(block) {return flip(params.baseRate)})
    var power = function(block) {return blicket(block) ? .95 : .05}
    var machine = function(blocks) {
      return (blocks.length == 0 ? flip(0.05) :
              flip(power(first(blocks))) || machine(rest(blocks)))
    }
    condition(machine(evidence))
    return blicket('A')
  })
}
~~~~

In addition to collecting judgements about whether 'A' was a blicket, suppose that we collected response times (RTs). Response time is measured in behavioral experiments by calculating the time elapsed between presentation of the stimulus and the participant's response. Here is the (totally fake) data:

~~~~
var data = [
  {baserate: 0.5, evidence: ['A'], response: true, RT: .9},
  {baserate: 0.5, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: true, RT: 4},
  {baserate: 0.5, evidence: ['A', 'B', 'C'], response: true, RT: 2},
  {baserate: 0.01, evidence: ['A'], response: true, RT: 1.5},
  {baserate: 0.01, evidence: ['A', 'B', 'C', 'D', 'E', 'F'], response: false, RT: 5},
  {baserate: 0.01, evidence:['A', 'B', 'C'], response: true, RT: 2.2},
]
~~~~

In this exercise, you will extend your model from the Bayesian Data Analysis exercises to evaluate different process models on this new data set. 

A) Write a linking function from your model to the observed response and RT.

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
    observe(rtOutput(...)) dataPoint.RT);
  }, data)

  return parameters
}


var nSamples = 500
// Do not change below
var opts = {method: 'MCMC', callbacks: [editor.MCMCProgress()], samples: nSamples}
var posterior = Infer(opts, dataAnalysis)
viz.marginals(posterior)
~~~~

B) Instead of fixing 'enumerate' in the `Infer` statement, lift the inference method and number of samples passed to Infer into your BDA, so that you as the scientist are inferring the inference method ('enumerate' vs. 'rejection') and parameters of inference (e.g. number of samples) the participant is using. Examine the posteriors: which algorithm are they most likely using?

Hint: When we `lift` variables instead of using fixed estimates, we express uncertainty over their values using priors. We can then compute posterior probabilities for those variables (conditioning on data). For an example, see `lazinessPrior` in the `dataAnalysisModel` in the BDA reading.

Hint: you may want to consider the [`randomInteger` distribution](http://docs.webppl.org/en/master/distributions.html#RandomInteger) as a prior on number of samples. And you may find the [`extend` helper function](http://docs.webppl.org/en/master/functions/other.html#extend) useful when manipulating the parameter object.

C) Do you think any of these algorithms are a good description of how you intuitively solve this problem? Explain what aspects of the inference may or may not be be analogous to what people do.
