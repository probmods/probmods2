---
layout: chapter
title: Bayesian data analysis
description: Making scientific inferences about data and models
---

In this book we are primarily concerned with probabilistic models of cognition: understanding inferences that people draw, as Bayesian conditioning given a person's model of the world (a generative model). 
Bayesian conditioning given a generative model is basic building block of Bayesian statistics, as well. 
Bayesian data analysis (in addition to Bayesian cognitive modeling) is equally useful to us as scientists, when we are trying to understand what our data means about psychological hypotheses. 
This can become confusing: a particular modeling assumption can be something we hypothesize that people assume about the world, or can be something that we as scientists want to assume (but don't assume that people assume). 
A pithy way of saying this is that we can make assumptions about "Bayes in the head" (Bayesian cognitive models) or about "Bayes in the notebook" (Bayesian data analysis). 

# Prologue: Of people and coins

## People's models of coins

Consider a cognitive model of an observer who is trying to estimate the weight of a biased coin. 
She flips the coin 20 times, observes 15 heads, and updates her beliefs accordingly.

~~~~
var observerModel = function(){
  var weight = uniform(0, 1)
  var coinFlipper = Binomial({n:20, p:weight})
  observe(coinFlipper, 15)
  return weight
}

var opts = {method: "rejection", samples: 5000}
var posteriorBeliefs = Infer(opts, observerModel)
print("Maximum a posteriori value = " + posteriorBeliefs.MAP().val)
viz.density(posteriorBeliefs, {bounds: [0,1]})
~~~~

This is a hypothesis about how person updates her prior beliefs about a coin weight (or, a continuous parameter between 0 and 1) after observing outcomes of flipping that (or, simple binary outcomes).
We can imagine an experiment where we show a person 20 coin flips, 15 of which result in heads.
This model would make predictions about the likely weights a person would infer.
We can then have this model make further predictions about different kinds of questions we could then ask the person.
For instance, we could ask them to predict the result of the next flip, or say that we are going to flip the coin 10 more times and have them predict the number of heads.

~~~~
var observerModel = function(){
  var weight = uniform(0, 1)
  var coinFlipper = Binomial({n:20, p:weight})
  observe(coinFlipper, 15)
  return {
    nextOutcome: flip(weight),
    nextTenOutcomes: binomial(weight, 10)
  }
}

var opts = {method: "rejection", samples: 5000}
var posteriorBeliefs = Infer(opts, observerModel)
viz.marginals(posteriorBeliefs)
~~~~

There are other hypotheses we could make about this experiment. 
Rather than have uniform prior beliefs, maybe we think people tend to think coins are either fair or unfair.
If the coin is fair, then the weight is just 0.5.
If the coin is unfair, then the observer has uncertainty about the weight, and we'll assume uniform uncertainty as before.

~~~~
var FairUnfairModel = function(){
  var isFair = flip(0.5)
  var weight = isFair ? 0.5 : uniform(0, 1)
  var coinFlipper = Binomial({n:20, p:weight})
  observe(coinFlipper, 15)
  return {
    nextOutcome: flip(weight),
    nextTenOutcomes: binomial(weight, 10)
  }
}

var opts = {method: "rejection", samples: 5000}
var posteriorBeliefs = Infer(opts, FairUnfairModel)
viz.marginals(posteriorBeliefs)
~~~~

The predictions are subtly different.
`fairUnfairModel` pulls the predictions more towards 50/50.
Why is that?
One way to understand this model is to example the prior.
Try commenting out the `observe` statement and looking at the predictions.
(You can also try to understand this by returning the `weight` variable as well.)

## Scientist's models of people

The above models make different predictions about what people will due in such situations. 
We can create these situations in a laboratory, and record our participants' responses.
But, how are we to decide which model is better?
Another way of putting this is: How are we supposed to update our beliefs about these models in light of the experimental data we've observed?

The question is of the exact same form of the questions we deal with in probabilistic models of cognition.
Now instead of asking "what inference should be people draw?", we are asking "what inferences should *we* draw?".
Instead of thinking about people's prior beliefs, we must consider our own.

~~~~ norun
var scientistModel = function(){
  var theBetterModel = flip(0.5) ? ObserverModel : FairUnfairModel
  observe(theBetterModel, experimentalData)
  return theBetterModel
}
~~~~

In the above, we specify prior beliefs about which is the better model.
Here, we say that we don't have any bias in our prior beliefs: we think each model is equally likely to be better *a priori*. 
We then seek to update our beliefs about which is the better model, by observing `experimentalData`, assuming that it came from `theBetterModel`. 
(If it didn't come from the better model, then the model that wasn't the better model would be the better model, so it's safe to assume the data came from the better model.)


#### Run this model

#### Introduce a parameter into FairUnfair

# Basics of BDA

Basics from [PPAML school](http://probmods.github.io/ppaml2016/chapters/5-data.html)

# Linking functions

# Model comparison, Bayes Factor, Savage-Dickey

Discuss difficulties with model comparison? (harmonic mean estimators, mcmc for likelihoods)

# Example: Linear regression and tug of war


