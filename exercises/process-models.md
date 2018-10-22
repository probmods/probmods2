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

In addition to collecting judgements about whether 'A' was a blicket, suppose that we collected response times (RTs). Response time is measured in behavioral experiments by calculating the time elapsed between presentation of the stimulus and the participant's response. Here is the data:

~~~~
var data = [
  {baserate: 0.5, evidence: ['A'], response: true, RT: 10},
  {baserate: 0.5, evidence: ['A', 'B', 'C', 'D', 'E'], response: true, RT: 20},
  {baserate: 0.5, evidence: ['A', 'B', 'C'], response: true, RT: 15},
  {baserate: 0.01, evidence: ['A'], response: true, RT: 8},
  {baserate: 0.01, evidence: ['A', 'B', 'C', 'D', 'E'], response: false, RT: 24},
  {baserate: 0.01, evidence:['A', 'B', 'C'], response: true, RT: 14},
  {baserate: 0.1, evidence: ['A'], response: true, RT: 10},
  {baserate: 0.1, evidence:['A', 'B', 'C', 'D', 'E'], response: false, RT: 22},
  {baserate: 0.1, evidence: ['A', 'B', 'C'], response: true, RT: 16}
]
~~~~

In this exercise, you will extend your model from the Bayesian Data Analysis exercises to evaluate different process models on this new data set.

A) Write a linking function from your model to the observed response and RT.

HINT: use the `time` function we defined in class. there should be one `observe` function for the response and one for the RT:

~~~~ norun
var time = function(foo, trials) {
  var start = _.now()
  var ret = repeat(trials, foo)
  var end = _.now()
  return (end-start)/trials
}

map(function(dataPoint) {
  var modelOutput = detectingBlickets(...)
  observe(..., dataPoint.response);
  observe(..., dataPoint.RT);
}, data)
~~~~

B) instead of fixing 'enumerate' in the `Infer` statement, lift the inference method and number of samples passed to Infer into your BDA, so that you as the scientist are inferring the inference method and parameters the participant is using. Examine the posteriors: which algorithm are they most likely using?

C) Do you think any of these algorithms are a good description of how you intuitively solve this problem? 