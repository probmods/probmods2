---
layout: chapter
title: Bayesian data analysis
description: Making scientific inferences about data and models
custom_js:
- assets/js/towData.js
---


<!--
mht: some similar ideas (and examples) are presented in occams razor chapter. make sure the division of labor is good.
-->

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

The above models make different predictions about what people will do in such situations. 
We can create these situations in a laboratory, and record our participants' responses.
But, how are we to decide which model is better?
Another way of putting this is: How are we supposed to update our beliefs about these models in light of the experimental data we've observed?

You'll notice this question directly parallels those we've been dealing with in probabilistic models of cognition.
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

Let's pretend we ran the "predict the next 10" experiment with 20 particiapnts, and observed the following responses:


<!--
to generate expt data:
var FairUnfairModel = function(){
  var isFair = flip(0.5)
  var weight = isFair ? 0.5 : uniform(0, 1)
  var coinFlipper = Binomial({n:20, p:weight})
  observe(coinFlipper, 15)
  return binomial(weight, 10)
}
var opts = {method: "rejection", samples: 5000}
var posteriorBeliefs = Infer(opts, FairUnfairModel)
repeat(20, function(){sample(posteriorBeliefs)})
-->

~~~~ norun
var experimentalData = [9,8,7,7,4,5,6,7,9,4,7,7,3,3,9,6,5,5,8,5]
~~~~

We are now ready to put all the pieces together:

~~~~
///fold:
var opts = {method: "rejection", samples: 5000}
print("running observer model")
var ObserverModel = Infer(opts, function(){
  var weight = uniform(0, 1)
  var coinFlipper = Binomial({n:20, p:weight})
  observe(coinFlipper, 15)
  return binomial(weight, 10)
})

print("running fair unfair model")
var FairUnfairModel = Infer(opts, function(){
  var isFair = flip(0.5)
  var weight = isFair ? 0.5 : uniform(0, 1)
  var coinFlipper = Binomial({n:20, p:weight})
  observe(coinFlipper, 15)
  return binomial(weight, 10)
})
///

var experimentalData = [9,8,7,7,4,5,6,7,9,4,7,7,3,3,9,6,5,5,8,5]

// so we can use the name and the distribution
var modelObject = {ObserverModel: ObserverModel, FairUnfairModel: FairUnfairModel};

var scientistModel = function(){
  var theBetterModel_name = flip(0.5) ? "ObserverModel" : "FairUnfairModel"
  var theBetterModel = modelObject[theBetterModel_name]
  map(function(d){ observe(theBetterModel, d) }, experimentalData)
  return {betterModel: theBetterModel_name}
}

var modelPosterior = Infer({method: "enumerate"}, scientistModel)

viz(modelPosterior)
~~~~

#### Introduce a parameter into FairUnfair?

# Learning about a model

Bayesian data analysis is a general purpose data analysis approach for making explicit hypotheses about where the data came from (e.g. the hypothesis that data from 2 experimental conditions came from two different distributions). 
Inference is then performed to *invert* the model: go from data to inferences about hypotheses. 

For further reading on Bayesian data analysis: see [Lee & Wagenmakers (2013)](https://bayesmodels.com/),
[Kruschke (2014)](https://sites.google.com/site/doingbayesiandataanalysis/), and [Gelman et al. (2014)](http://www.stat.columbia.edu/~gelman/book/).

## Parameters and predictives

Bayes’ rule provides a bridge between the unobserved parameters of models and the observed data.
The most useful part of this bridge is that data allow us to update the uncertainty, represented by probability distributions, about parameters.
But the bridge can handle two-way traffic, and so there is a richer set of possibilities for relating parameters to data.
For a given Bayesian model (together with data), there are four conceptually distinct distributions:

+ The *prior distribution over parameters* captures our initial beliefs about the latent variables those parameters represent.
+ The *prior predictive distribution* is (roughly speaking) a distribution in *data space*.
It tells us what data to expect, given our model and our initial beliefs about the parameters.
The prior predictive is a distribution over data, and gives the relative probability of different *observable* outcomes before we have seen any data.
+ The *posterior distribution over parameters* captures what we know about the latent variables having updated our prior beliefs with the evidence provided by data.
+ The *posterior predictive distribution* tells us what data to expect, given the same model we started with, but with beliefs that have been updated by the observed data.
Again, the posterior predictive is a distribution over data, and gives the relative probability of different observable outcomes after data has been seen.

Loosely speaking, *predictive* distribuions are in "data space" and *parameter* distributions are in "latent space".

## A simple illustration

Here, we explore the result of an experiment with 20 trials and binary outcomes (e.g., flipping a coin with an uncertain weight, asking people if they'll vote for Candidate A or Candidate B, ...).

~~~~
// observed data
var k = 1 // number of successes
var n = 20  // number of attempts

var model = function() {

   var p = uniform(0, 1);

   // Observed k number of successes, assuming a binomial
   observe(Binomial({p : p, n: n}), k);

   // sample from binomial with updated p
   var posteriorPredictive = binomial(p, n);

   // sample fresh p
   var prior_p = uniform(0, 1);
   // sample from binomial with fresh p
   var priorPredictive = binomial(prior_p, n);

   return {
       prior: prior_p, priorPredictive : priorPredictive,
       posterior : p, posteriorPredictive : posteriorPredictive
    };
}

var opts = {method: "rejection", samples: 2000};
var posterior = Infer(opts, model);

viz.marginals(posterior)
~~~~

<!--
1. Make sure you understand the prior, posterior, prior predictive, and posterior predictive distributions, and how they relate to each other. Why are some plots densities and others bar graphs? Understanding these ideas is a key to understanding Bayesian analysis. Check your understanding by trying other data sets, varying both k and n.

2. Try different priors on `p`, by changing `p = uniform(0, 1)` to `p = beta(10,10)`, `beta(1,5)` and `beta(0.1,0.1)`. Use the figures produced to understand the assumptions these priors capture, and how they interact with the same data to produce posterior inferences and predictions.

3. Predictive distributions are not restricted to exactly the same experiment as the observed data, and can be used in the context of any experiment where the inferred model parameters make predictions. In the current simple binomial setting, for example, predictive distributions could be found by an experiment that is different because it has `n' != n` observations. Change the model to implement an example of this.
-->

## Posterior prediction and model checking

One important use of posterior predictive distributions is to examine the descriptive adequacy of a model.
The posterior predictive can be viewed as a set of predictions about what data the model expects to see, based on the posterior distribution over parameters.
If these predictions do not match the data *already seen*, the model is descriptively inadequate.


Imagine we're running a visual perception experiment.
The task is fairly simple: say whether or not a dot on the screen appears above or below another dot on the screen.
We ran one group of 10 participants in the morning, and then went to lunch, and then ran another group of 10 participants.
\Suppose we observed the following data from those groups of participants: `k1=0; k2=10`.

~~~~
// Successes in 2 experiments
var k1 = 0;
var k2 = 10;

// Number of trials in 2 experiments
var n1 = 10;
var n2 = 10;

var model = function() {

  var p = uniform(0, 1);

  observe(Binomial({p: p, n: n1}), k1);
  observe(Binomial({p: p, n: n2}), k2);

  var posteriorPredictive1 = binomial(p, n1)
  var posteriorPredictive2 = binomial(p, n2)

  return {posterior : p,
          posteriorPredictive1: posteriorPredictive1,
          posteriorPredictive2: posteriorPredictive2
  };
}

var opts = {
  method: "MCMC", callbacks: [editor.MCMCProgress()],
  samples: 20000, burn: 10000
};

var posterior = Infer(opts, model);

viz.marginals(posterior)
~~~~

<!--
### Exercises 2

1.  What do you conclude about the descriptive adequacy of the model, based on the relationship between the observed data and the posterior predictive distribution? Recall the observed data is `k1 = 0; n1 = 10` and  `k2 = 10; n2 = 10`.

2. What can you conclude about the parameter `theta`?
-->

<!--
Basics from [PPAML school](http://probmods.github.io/ppaml2016/chapters/5-data.html)
-->

# Comparing models

In the above examples, we've had a single data-analysis model and used the experimental data to learn about the parameters of that model.
Often as scientists, we have multiple, distinct models in hand, and want to decide if one or another is a better description of the data.

This is actually a special case of learning about the parameters of a model.
We can define an uber model, that has a binary decision parameter that we'd like to learn about.
In this case, the binary decision variable will gate between which of our two (or more) models we let generate  the data.
We then go backwards (performing Bayesian inference) to decide which model was more likely to have generate the data we observed.

The simplest data analysis model for model comparison mimics a simple cognitive model for subjective randomness.
We observe some number of binary outcomes and want to decide if the pattern we see is random or not.
Formally, a "true random" pattern would be generated by a fair coin; a "non random" pattern would be generated by a trick coin.
We run into our first complication: A fair coin is simple to define: `Bernoulli({p: 0.5})`, but how can we treat a trick coin?
For purposes of scientific hypothesis testing, a trick coin is formlized as a coin with some *unknown* weight:

~~~~ norun
var p = uniform(0,1);
Bernoulli({p: p})
~~~~

We now have another conceptual worry: Isn't the second model just a more general case of the first model?
That is, if the second model has a uniform distribution over `p`, then `p: 0.5` is included in the second model. 
This is what's called a *nested model*.

Shouldn't the more general model always be better?
If we're at a track, and you bet on horse A, and I bet on horse A and B, aren't I strictly in a better position than you?
The answer is no, and the reason has to do with our metric for winning.
Intuitively, we don't care whether your horse won or not, but how much money you win.
How much money you win depends on how much money you bet, and the rule is, when we go to track, we have the same amount of money.
(Intuitively, our money is probability, and we each have a distribution to bet; a distribution has probabilities that must must sum to 1.)
So my act of betting on horse A and horse B actually requires me to split my money (say, betting 50 / 50 on each).
On the other hand, you put all your money on horse A (100 on A, 0 on B).
If A wins, you will gain more money because you put more money down.

This idea is called the principle of parsimony or Occam's razor, and will be discussed at length later in this book.
For now, it's sufficient to know that more complex models will be penalized for being more complexed intuitively because they will be diluting their predictions. 
At the same time, more complex models are more flexible and can capture a wider variety of data.
Bayesian model comparison let's us weigh these costs and benefits.


~~~~
var k = 7, n = 20;

var compareModels = function() {
  var x = flip(0.5) ? "simple" : "complex";
  var p = (x == "simple") ? 0.5 : uniform(0, 1);
  observe(Binomial({p: p, n: n}), k);
  return x
}

var opts = {method: "rejection", samples: 2000};
var modelPosterior = Infer(opts, compareModels);
viz(modelPosterior)
~~~~


#### Discuss difficulties with model comparison? (harmonic mean estimators, mcmc for likelihoods)

# Linking functions

# Example: Subjective randomness

# Example: Linear regression and tug of war

One of the main virtues of Bayesian data analysis is it's ability to interface with Bayesian cognitive models in a natural way.
Bayesian cognitive models should be thought of as formalizations of hypotheses, which we then can test with an experiment.
We can contrast our rich Bayesian cognitive models with more standard models from data science, like linear regression.

Regression models are the workhorse of data science.
They are useful in situations when you have data and some potentially vague hypotheses about how variables relate to each other (e.g., that demographics might predict political party affiliation [in some unspecified way]).
In psychology and many other behavioral sciences, experiments are often constructed with discrete/categorical manipulations (e.g., measuring processing time of words vs. pseudowords).
The question of "is A greater than B?" (is the processing time of words faster than the processing time of pseudowords?) can be answered using a regression model.

To explore a Bayesian linear regression model, we will use data from the Tug of War experiment by Gerstenberg et al. (2012). Let's start by just taking a look at the data set, found in the `towData` variable. 

~~~~
var levels = function(a, lvl){ return _.uniq(_.pluck(a, lvl)) }

// display single row of the data frame
print(towData[0])
// display unique levels of "pattern" variable
print(levels(towData, "pattern"))
// display unique levels of "tournament" variable
print(levels(towData, "tournament"))
// display unique levels of "id" variable [participant id]
print(levels(towData, "id"))
~~~~

Let's look at the `ratingZ` variable (a normalized rating).

~~~~
viz.hist(_.pluck(towData, "ratingZ"))
~~~~

The most likely ratings are one standard deviation above or below the mean, though some ratings are at the mean of 0.

Let's explore the hypothesis that subjects ratings of how strong the target character ("Alice") is depends upon the number of times she won.

~~~~
var singleRegression = function(){ 
  ...
}
~~~~

Now, some of the conditions has Alice winning against the same person, so maybe it's also important how many unique wins she has.

~~~~
var multipleRegression = function(){
  
}
~~~~

This kind of question represents a categorical manipulation; categorical manipulations provide 1 bit of information (answering the question: "Is it higher or lower in X than Y?").

Instantiating a hypothesis in a cognitive, generative model 

These data are usually analyzed using "statistical tests" (e.g., a t-test), or more often today, regression models. 


