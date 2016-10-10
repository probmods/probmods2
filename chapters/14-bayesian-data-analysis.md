---
layout: chapter
title: Bayesian data analysis
description: Making scientific inferences about data and models
custom_js:
- assets/js/towData.js
- assets/js/towConfigurations.js
---

### Authors: Michael Henry Tessler; Noah Goodman

<!--
mht: some similar ideas (and examples) are presented in occams razor chapter. make sure the division of labor is good.
-->


Inference by conditioning a generative model is also a basic building block of Bayesian statistics.
In cognitive science this tool can be used in two ways.
If the generative model is a hypothesis about a person's model of the world, then we have a Bayesian *cognitive model* -- the main topic of this book.
If the generative model is instead the scientist's model of how the data are generated, then we have *Bayesian data analysis*.
Bayesian data analysis can be an extremely useful tool to us as scientists, when we are trying to understand what our data mean about psychological hypotheses.
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
print("Expected value = " + expectation(posteriorBeliefs))
viz.density(posteriorBeliefs, {bounds: [0,1]})
~~~~

This is a hypothesis about how person updates her prior beliefs about a coin weight (or, a continuous parameter between 0 and 1) after observing outcomes.
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

## Scientists' models of people

The above models make different predictions about what people will do in such situations.
We can create these situations in a laboratory, and record our participants' responses.
But, how are we to decide which model is better?
Another way of putting this is: How are we supposed to update our beliefs about these models in light of the experimental data we've observed?

You'll notice this question directly parallels those we've been dealing with in probabilistic models of cognition.
Now instead of asking "what inference should be people draw?", we are asking "what inferences should *we* draw?".
Instead of thinking about people's prior beliefs, we must consider our own.

Here, we consider the case of trying to decide which is the better model:

~~~~ norun
var scientistModel = function(){
  var theBetterModel = flip(0.5) ? ObserverModel : FairUnfairModel
  observe(theBetterModel, experimentalData)
  return theBetterModel
}
~~~~

We must specify prior beliefs about which is the better model; in this case we say that we don't have any bias in our prior beliefs: each model is equally likely to be better *a priori*.
We then seek to update our beliefs about which is the better model, by observing `experimentalData`, assuming that it came from `theBetterModel`.
(If it didn't come from the better model, then the model that wasn't the better model would be the better model, so it's safe to assume the data came from the better model.)

Let's pretend we ran the "predict the next 10" experiment with 20 participants, and observed the following responses:


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

Look again at the model predictions for `nextTenOutcomes` for the two models above.
Which model do you think is better?

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

<!--
#### Introduce a parameter into FairUnfair?
-->

# Learning about a model

Bayesian data analysis is a general purpose data analysis approach for making explicit hypotheses about where the data came from (e.g., the hypothesis that data from two experimental conditions came from two different distributions).
Inference is then performed to *invert* the model: go from data to beliefs.

For further reading on Bayesian data analysis: see [Lee & Wagenmakers (2013)](https://bayesmodels.com/),
[Kruschke (2014)](https://sites.google.com/site/doingbayesiandataanalysis/), and [Gelman et al. (2014)](http://www.stat.columbia.edu/~gelman/book/).

## Parameters and predictives

Models have parameters.
Parameters are in general unobservable.
For instance, we may build a data analysis model where we're trying to estimate how many people in a population prefer Candidate A to Candidate B.
It would be impractical to measure the whole distribution.
Instead, we measure a sample (maybe we ask 1000 people), and use that to make inference about the "true population proportion" (an unobservable parameter).

Bayes’ rule provides a bridge between the unobserved parameters of models and the observed data.
We can update our beliefs about parameters from data.
The "Bayes bridge" can handle two-way traffic, however: we can use our updated beliefs about a parameter to make predictions about future data sets.

For a given Bayesian model (together with data), there are four conceptually distinct distributions of interest:

For parameters, we have priors and posteriors:

+ The *prior distribution over parameters* captures our initial state of knowledge (or, our beliefs) about the latent variables those parameters represent.
+ The *posterior distribution over parameters* captures what we know about the latent variables having updated our beliefs with the evidence provided by data.

We can run either the prior or the posterior model forward, and have it make predictions about data sets:

+ The *prior predictive distribution* tells us what data to expect, given our model and our initial beliefs about the parameters.
The prior predictive is a distribution over data, and gives the relative probability of different *observable* outcomes before we have seen any data.
+ The *posterior predictive distribution* tells us what data to expect, given the same model we started with, but with beliefs that have been updated by the observed data. The posterior predictive is a distribution over data, and gives the relative probability of different observable outcomes, after some data has been seen.

Loosely speaking, *predictive* distributions are in "data space" and *parameter* distributions are in "latent space".

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


Make sure you understand the prior, posterior, prior predictive, and posterior predictive distributions, and how they relate to each other.
Why are some plots densities and others bar graphs?
Understanding these ideas is a key to understanding Bayesian analysis.
Check your understanding by trying other data sets, varying both `k` and `n`.

<!-- 2. Try different priors on `p`, by changing `p = uniform(0, 1)` to `p = beta(10,10)`, `beta(1,5)` and `beta(0.1,0.1)`. Use the figures produced to understand the assumptions these priors capture, and how they interact with the same data to produce posterior inferences and predictions.

3. Predictive distributions are not restricted to exactly the same experiment as the observed data, and can be used in the context of any experiment where the inferred model parameters make predictions. In the current simple binomial setting, for example, predictive distributions could be found by an experiment that is different because it has `n' != n` observations. Change the model to implement an example of this.
 -->

## Posterior prediction and model checking

One important use of posterior predictive distributions is to examine the descriptive adequacy of a model.
The posterior predictive can be viewed as a set of predictions about the data by the model, based on the posterior distribution over parameters.
If these predictions do not match the data *already seen* (i.e., the data used to arrive at the posterior distribution over parameters), the model is descriptively inadequate.

Imagine we're running a visual perception experiment.
The task is fairly simple: say whether or not a dot on the screen appears above or below another dot on the screen.
We ran one group of 10 participants in the morning, and then went to lunch, and then ran another group of 10 participants.
Suppose we observed the following data from those groups of participants: `k1=0; k2=10`.

~~~~
///fold:
var marginalize = function(dist, key){
  return Infer({method: "enumerate"}, function(){
    return sample(dist)[key]
  })
}
///
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

  return {
    parameter : p,
    predictive: {
      predictive1: posteriorPredictive1,
      predictive2: posteriorPredictive2
    }
  };
}

var opts = {
  method: "MCMC", callbacks: [editor.MCMCProgress()],
  samples: 20000, burn: 10000
};

var posterior = Infer(opts, model);

var parameterPosterior = marginalize(posterior, "parameter")
viz.density(parameterPosterior, {bounds: [0, 1]})

var posteriorPredictive = marginalize(posterior, "predictive")
viz(posteriorPredictive)

var posteriorPredictiveMAP = posteriorPredictive.MAP().val
viz.scatter(
  [{model: posteriorPredictiveMAP.predictive1, data: k1},
   {model: posteriorPredictiveMAP.predictive2, data: k2}]
)
~~~~

Examine the heat map displaying the posterior predictive.
What sort of data is this model expecting to see?
Where in this 2-d grid does our observed data land?
What can you conclude about the parametere `p`?

<!-- **TODO: This doesn't yet quite make the point about what a model check is. Show example of typical posterior predictive scatter plot?**
 -->
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
Indeed, we saw an example above when we decided whether `"ObserverModel"` or  `"FairUnfairModel"` was a better explanation of some (made-up) data.

This is actually a special case of learning about the parameters of a model.
We can define an uber model, that has a binary decision parameter that we'd like to learn about.
In this case, the binary decision variable will gate between which of our two (or more) models we let generate  the data.
We then go backwards (performing Bayesian inference) to decide which model was more likely to have generate the data we observed.

The simplest data analysis model for model comparison mimics a simple cognitive model for subjective randomness.
We observe some number of binary outcomes and want to decide if the pattern we see is random or not.
Formally, a "true random" pattern would be generated by a fair coin; a "non random" pattern would be generated by a trick coin.
We run into our first complication: A fair coin is simple to define: `Bernoulli({p: 0.5})`, but how can we treat a trick coin?
For purposes of scientific hypothesis testing, a trick coin is formalized as a coin with some *unknown* weight:

~~~~ norun
var p = uniform(0,1);
Bernoulli({p: p})
~~~~

Using this to now compare models:

~~~~
var k = 7, n = 20;

var compareModels = function() {
  var x = flip(0.5) ? "simple" : "complex";
  var p = (x == "simple") ? 0.5 : uniform(0, 1);
  observe(Binomial({p: p, n: n}), k);
  return {model: x}
}

var opts = {method: "rejection", samples: 2000};
print("We observed " + k + " successes out of " + n + " attempts")
var modelPosterior = Infer(opts, compareModels);
viz(modelPosterior)
~~~~

This model is an example from the classical hypothesis testing framework.
We consider a model that fixes one of its parameters to a pre-specified value of interest (here $$\mathcal{H_0} : p = 0.5$$).
This is sometimes referred to as a *null hypothesis*.
The other model says that the parameter is free to vary.
In the classical hypothesis testing framework, we would write: $${H_1} : p \neq 0.5$$.
With Bayesian hypothesis testing, we must be explicit about what $$p$$ is (not just what p is not), so we write $${H_1} : p \sim \text{Uniform}(0, 1) $$.

One might have a conceptual worry: Isn't the second model just a more general case of the first model?
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
For now, it's sufficient to know that more complex models will be penalized for being more complex intuitively because they will be diluting their predictions.
At the same time, more complex models are more flexible and can capture a wider variety of data.
Bayesian model comparison lets us weigh these costs and benefits.


## Bayes' factor

What we are plotting above are **posterior model probabilities**.
These are a function of the marginal likelihoods of the data under each hypothesis and the prior model probabilities (here, defined to be equal: `flip(0.5)`).
Sometimes, scientists feel a bit strange about reporting values that are based on prior model probabilities (what if scientists have different priors as to the relative plausibility of the hypotheses?) and so often report the ratio of marginal likelihoods, a quantity known as a *Bayes Factor*.

Let's compute the Bayes' Factor, by computing the likelihood of the data under each hypothesis.

~~~~
var k = 7, n = 20;

var simpleLikelihood = Math.exp(Binomial({p: 0.5, n: n}).score(k))

var complexModel = Infer({method: "forward", samples: 10000}, function(){
  var p = uniform(0, 1);
  return binomial(p, n)
})
var complexLikelihood = Math.exp(complexModel.score(k))

var bayesFactor_01 = simpleLikelihood / complexLikelihood
bayesFactor_01
~~~~

How does the Bayes Factor in this case relate to posterior model probabilities above?

## Savage-Dickey method

For this example, the Bayes factor can be obtained by integrating out the model parameter (using `Infer` with `{method: "forward"}`).
However, it is not always easy to get good estimates of the two marginal probabilities.
It turns out, the Bayes factor can also be obtained by considering *only* the more complex hypothesis ($$\mathcal{H}_1$$).
What you do is look at the distribution over the parameter of interest (here, $$p$$) at the point of interest (here, $$p = 0.5$$).
Dividing the probability density of the posterior by the density of the prior (of the parameter at the point of interest) also gives you the Bayes Factor!
This perhaps surprising result was described by Dickey and Lientz (1970), and they attribute it to Leonard "Jimmie" Savage.
The method is called the *Savage-Dickey density ratio* and is widely used in experimental science.

We would use it like so:

~~~~
var k = 7, n = 20;

var complexModelPrior = Infer({method: "forward", samples: 10000}, function(){
  var p = uniform(0, 1);
  return p
})

var complexModelPosterior = Infer({method: "rejection", samples: 10000}, function(){
  var p = uniform(0, 1);
  observe(Binomial({p: p, n: n}), k);
  return p
})

var savageDickeyDenomenator = expectation(complexModelPrior, function(x){return Math.abs(x-0.5)<0.05})
var savageDickeyNumerator = expectation(complexModelPosterior, function(x){return Math.abs(x-0.5)<0.05})
var savageDickeyRatio = savageDickeyNumerator / savageDickeyDenomenator
print( savageDickeyRatio )
~~~~

(Note that we have approximated the densities by looking at the expectation that $$p$$ is within $$0.05$$ of the target value $$p=0.5$$.)

<!--
**Discuss difficulties with model comparison? (harmonic mean estimators, mcmc for likelihoods)**
-->

<!-- # Linking functions
 -->

# Example: Linear regression and tug of war

One of the virtues of Bayesian data analysis is it's ability to interface with Bayesian cognitive models in a natural way.
Bayesian cognitive models are formalizations of hypotheses about cognition, which we then can test with an experiment.
We can contrast our rich Bayesian cognitive models with more standard models from data science, like linear regression, and evaluate them all using Bayesian data analysis.

Regression is the workhorse of data science.
Regression models are useful in situations when you have (1) data and (2) some (potentially vague) hypotheses about how variables relate to each other (e.g., that demographics might predict political party affiliation [in some unspecified way]).
In psychology and many other behavioral sciences, experiments are often constructed with discrete/categorical manipulations (e.g., measuring processing time of words vs. pseudowords).
The question "is A greater than B?" (is the processing time of words faster than the processing time of pseudowords?) can be answered using a regression model.

To explore a Bayesian linear regression model, we will use data from the Tug-of-War experiment by @Gerstenberg2012.
Let's be good data scientists, and start by just taking a look at the data set, found in the `towData` variable (available in this page only).

~~~~
var levels = function(a, lvl){ return _.uniq(_.pluck(a, lvl)) }

// display single row of the data frame
print(towData[0])
// display unique levels of "pattern" variable
print(levels(towData, "pattern"))
// display unique levels of "tournament" variable
print(levels(towData, "tournament"))
// display unique levels of "nWins" variable
print(levels(towData, "nWins"))
// display unique levels of "id" variable [participant id]
print(levels(towData, "id"))
~~~~

The first line printed is a line from our data set: one participant on one trial.
We see that it has many different fields, including the trial number, their raw rating ("rating"), a normalized score ("ratingZ"), and information about the experimental condition.
Here, this was the condition "confounded evidence" in a "singles" tournament: here, the target player won 3 times against the same player (for a full list of the experimental conditions see @Gerstenberg2012 Tables 2 and 3).

The other lines show the unique values different variables can take on.

Let's plot the `ratingZ` variable (a normalized rating).

~~~~
viz.hist(_.pluck(towData, "ratingZ"))
~~~~

This distribution of ratings is from all trials, all participants, all experimental conditions.
We see that the ratings range from about -2 to 2.
The most likely ratings are one standard deviation above or below the mean, though some ratings are at the mean of 0.

## Single regression

Let's say we ran this experiment and hypothesized that the number of times the target character won (`"nWins"` in the data set) is a predictor of how participants' ratings of strength.
We'll formalize this in a Bayesian regression framework, where ratings of strength $$r$$ are a linear combination of a fixed intercept $$\beta_0$$ and weighted component of number of wins $$\beta_1 *  n_{wins}$$.

$$y_{predicted} = \beta_0 + \beta_1 * n_{wins}$$

Because we're in the realm of generative models, we will have to be explicit about how $$y_{predicted}$$ relates to the actual rating data we observed.
We make the standard assumption that the actual ratings are normally distributed around $$y_{predicted}$$, with some noise $$\sigma$$.

$$d \sim \mathcal{N}(y_{predicted}, \sigma)$$

This is a model of our data.
As in cognitive models, we will put priors on the parameters: $$\beta_0, \beta_1, \sigma$$, and infer their likely values by conditioning on the observed data.
We'll use the `editor.put()` function to save our results.

~~~~
var singleRegression = function(){
  var b0 = uniformDrift({a: -1, b: 1, width: 0.2})
  var b1 = uniformDrift({a: -1, b: 1, width: 0.2})
  var sigma = uniformDrift({a: 0, b: 2, width: 0.2})

  map(function(d){

    var predicted_y = b0 + d.nWins*b1
    observe(Gaussian({mu: predicted_y, sigma: sigma}), d.ratingZ)

  }, towData)

  return {b0: b0, b1: b1, sigma: sigma}
}

var nSamples = 2500
var opts = { method: "MCMC", callbacks: [editor.MCMCProgress()],
             samples: nSamples, burn: nSamples/2 }

var posterior = Infer(opts, singleRegression)

editor.put("singleRegression", posterior)
~~~~


~~~~
var posterior = editor.get("singleRegression")
viz.marginals(posterior)
~~~~

The posteriors are somewhat noisy because we haven't taken that many samples.
We see that the intercept $$\beta_0$$ is around 0, which we might expect given that our data is normalized.
The slope weight $$\beta_1$$ is around 0.35, with relatively low variance around that.
The fact that it's very unlikely for $$\beta_1$$ to be 0 suggests that there is an effect of the number of times the actor has won in Tug of War on participants' judgments of the relative strength of that actor, as we might hope.
$$\sigma$$ is almost around 0.5, which seems a little bit high given that the full range of the response ratings is 4 (-2 to +2).

### Model criticism with posterior prediction

We can now critique the model by asking how well it would generate our data.
To do this, we look at the posterior predictive distribution.
There are 20 different experimental conditions (wins vs. loss, singles vs. doubles, and 4 - 6 different kinds of tournaments).
We want to examine our predictions for each of these conditions separately, so we rewrite the model slightly by mapping over each condition variable separately.

~~~~
var merge = function(m, d){
  var keys = _.keys(d)
  map(function(k){return {model: m[k], data: d[k], item:k} }, keys)
}

var levels = function(a, lvl){ return _.uniq(_.pluck(a, lvl)) }

var outcomes = levels(towData, "outcome");
var tournaments = levels(towData, "tournament");
var patterns = {
  single: levels(_.where(towData, {tournament: "single"}), "pattern"),
  double: levels(_.where(towData, {tournament: "double"}), "pattern")
};

var singleRegression = function(){
  var b0 = uniformDrift({a: -1,b: 1, width: 0.2})
  var b1 = uniformDrift({a: -1,b: 1, width: 0.2})
  var sigma = uniformDrift({a: 0, b: 2, width: 0.2})

  var predictions = map(function(tournament){
    return map(function(outcome){
      return map(function(pattern){

        var itemInfo = {pattern: pattern, tournament: tournament, outcome: outcome}
        var itemData = _.where(towData, itemInfo)

        // linear equation
        var predicted_y = b0 + itemData[0]["nWins"]*b1

        map(function(d){ observe(Gaussian({mu: predicted_y, sigma: sigma}), d.ratingZ)}, itemData)

        return _.object([[pattern + "_" + tournament + "_" + outcome, predicted_y]])

      }, patterns[tournament]) // singles tournaments don't have all patterns
    }, outcomes)
  }, tournaments)

  // nasty data munging
  return _.object(_.flatten(map(function(i){ _.pairs(i) }, _.flatten(predictions)), true))
}

var nSamples = 500
var opts = { method: "MCMC", callbacks: [editor.MCMCProgress()],
             samples: nSamples, burn: nSamples/2 }

var posterior = Infer(opts, singleRegression)

var modelDataDF = merge(posterior.MAP().val, towMeans)

viz.scatter(modelDataDF)
editor.put('singleRegression', posterior)
editor.put('modelDataDF', modelDataDF)

~~~~

<!-- // To do: have summary data include match schematics (Tables 2 & 3)
// or just include tables 2 and 3 from paper -->

~~~
///fold:
var correlation = function(xs, ys) {
    var mx = sum(xs)/xs.length,
        my = sum(ys)/ys.length;
    var num = sum(map2(function(x,y) { (x-mx) * (y-my)}, xs, ys));
    var den = Math.sqrt(sum(map(function(x) { (x-mx) * (x-mx)},xs))) *
        Math.sqrt(sum(map(function(y) { (y-my) * (y-my)},ys)));
    return num/den
}
///

var modelDataDF = editor.get('modelDataDF')

var summaryData = map(function(x){
  return _.extend(x, {sqErr: Math.pow(x.model-x.data, 2)})
}, modelDataDF)

viz.table(summaryData)
print("Mean squared error = " + listMean(_.pluck(summaryData, "sqErr")))

var varianceExplained = Math.pow(correlation(_.pluck(summaryData, "data"), _.pluck(summaryData, "model")), 2)
print("Model explains " + Math.round(varianceExplained*100) + "% of the data")
~~~

The simple linear regression does surprisingly well on this data set (at least at predicting the mean responses).
This is important to know; it provides a standard against which we can evaluate richer models.

At the same time, we observe in the posterior predictive scatterplot that not all the linear model is predicting certain symmetries that don't come out.
Why might that be?

## Mutiple regression

Now, some of the conditions has Alice winning against the same person, so maybe it's also important how many unique wins she has.

$$y_{predicted} = \beta_0 + \beta_1 * n_{wins} + \beta_2 * wins_{unique}$$


~~~~
///fold:
var levels = function(a, lvl){ return _.uniq(_.pluck(a, lvl)) }

var outcomes = levels(towData, "outcome");
var tournaments = levels(towData, "tournament");
var patterns = {
  single: levels(_.where(towData, {tournament: "single"}), "pattern"),
  double: levels(_.where(towData, {tournament: "double"}), "pattern")
};
///

var multipleRegression = function(){
  var b0 = uniformDrift({a: -1,b: 1, width: 0.2})
  var b1 = uniformDrift({a: -1,b: 1, width: 0.2})
  var b2 = uniformDrift({a: -1,b: 1, width: 0.2})
  var sigma = uniformDrift({a: 0, b: 2, width: 0.2})

  var predictions = map(function(tournament){
    return map(function(outcome){
      return map(function(pattern){

        var itemInfo = {pattern: pattern, tournament: tournament, outcome: outcome}
        var itemData = _.where(towData, itemInfo)

        // linear equation
        var predicted_y = b0 + itemData[0]["nWins"]*b1 + itemData[0]["nUniqueWins"]*b2

        map(function(d){ observe(Gaussian({mu: predicted_y, sigma: sigma}), d.ratingZ) }, itemData)

        return _.object([[pattern + "_" + tournament + "_" + outcome, predicted_y]])

      }, patterns[tournament]) // singles tournaments don't have all patterns
    }, outcomes)
  }, tournaments)

  return {
    parameters: {b0: b0, b1: b1, b2: b2, sigma: sigma},
    predictives: _.object(_.flatten(map(function(i){ _.pairs(i) }, _.flatten(predictions)), true))
  }
}

var nSamples = 250
var opts = { method: "MCMC", kernel: {HMC: {steps: 5, stepSize: 0.01}},
            callbacks: [editor.MCMCProgress()],
             samples: nSamples, burn: nSamples/2 }

var posterior = Infer(opts, multipleRegression)
editor.put('multiRegression', posterior)
~~~~

Look at parameters.

~~~~
///fold:
var marginalize = function(dist, key){
  return Infer({method: "enumerate"}, function(){
    return sample(dist)[key];
  })
}
///
var posterior = editor.get('multiRegression');
var parameterPosterior = marginalize(posterior, "parameters")
viz.marginals(parameterPosterior)
~~~~

We see that $$\beta_2$$ is also probably not 0, suggesting that the number of *unique* wins a player has is relavent for predicting participants' judgments of their strength.
How well does the model fit the data?

~~~~
///fold:
var marginalize = function(dist, key){
  return Infer({method: "enumerate"}, function(){
    return sample(dist)[key];
  })
}
var merge = function(m, d){
  var keys = _.keys(d)
  return map(function(k){return {model: m[k], data: d[k], item:k} }, keys)
}
var correlation = function(xs, ys) {
    var mx = sum(xs)/xs.length,
        my = sum(ys)/ys.length;
    var num = sum(map2(function(x,y) { (x-mx) * (y-my)}, xs, ys));
    var den = Math.sqrt(sum(map(function(x) { (x-mx) * (x-mx)},xs))) *
        Math.sqrt(sum(map(function(y) { (y-my) * (y-my)},ys)));
    return num/den
}
///
var posterior = editor.get('multiRegression');
var posteriorPredictive = marginalize(posterior, "predictives")

var modelDataDF = merge(posteriorPredictive.MAP().val, towMeans)

viz.scatter(modelDataDF)

var summaryData = map(function(x){
  return _.extend(x, {sqErr: Math.pow(x.model-x.data, 2)})
}, modelDataDF)

viz.table(summaryData)
print("Mean squared error = " + listMean(_.pluck(summaryData, "sqErr")))
var varianceExplained = Math.pow(correlation(_.pluck(summaryData, "data"), _.pluck(summaryData, "model")), 2)
print("Model explains " + Math.round(varianceExplained*100) + "% of the data")
~~~~

The multiple linear regression model fit is improved a little bit, but still fails to predict meaningful difference between certain conditions.

With regressions like these, we're often asking binary questions (e.g., "is this parameter 0 or not?").
These kinds of questions provide just a few bits of information.
Instantiating a hypothesis in a cognitive model can answer more than just categorical questions by testing a richer theory of the data.

## BDA of Tug-of-war model

Recall the Tug-of-war model from the chapter on [conditioning]({{site.baseurl}}/chapters/03-conditioning.html).

~~~~
var options = {method: 'MCMC', samples: 2500}

var lazinessPrior = 0.3;
var lazyPulling = 0.5;

var model = function() {

  var strength = mem(function(person){
    return gaussian(0, 1)
  })
  var lazy = function(person){
    return flip(lazinessPrior)
  }
  var pulling = function(person) {
    return lazy(person) ?
            strength(person) * lazyPulling :
            strength(person)
  }
  var totalPulling = function(team){return sum(map(pulling, team)) }
  var winner = function(team1, team2){
    totalPulling(team1) > totalPulling(team2) ? team1 : team2
  }
  var beat = function(team1,team2){winner(team1,team2) == team1}

  condition(beat(["bob", "mary"], ["tom", "sue"]))

  return strength("bob")
}

var posterior = Infer(options, model)
print("Bob's strength, given that he and Mary beat Tom and Sue")

print("Expected value = " + expectation(posterior))
viz(posterior)
~~~~

<!-- Here, I've explicitly defined the `lazinessPrior` and `lazyPulling` parameters outside of the model.
 -->
### Learning about the Tug-of-War model

To learn more about (and test) the tug-of-war model, we're going to connect it the data from the experiment.
You'll notice that we have two parameters in this model: the proportion of a person's strength they pull with when they are being lazy (`lazyPulling`) and the prior probability of a person being lazy (`lazyPulling`).
(Technical note: Because we are comparing relative strengths, we have normalized the human ratings, we don't have to infer the parameters of the gaussian in `strength`.
We just use the standard normal distribution.)
Above, we set these parameters to be `0.5` and `0.3`, respectively.
(People are lazy about a third of the time, and when they are lazy, they pull with half their strength.)

Those parameter values aren't central to our hypothesis.
They are peripheral details to the larger hypothesis which is that people reason about team games like Tug of War by running a structured, generative model in their heads and doing posterior inference.
Rather than guessing at what values we should put for these parameters, we can use the data to inform our beliefs about what those parameters are likely to be (assuming the general model is a good one).

~~~~
///fold:
var levels = function(a, lvl){ return _.uniq(_.pluck(a, lvl)) }

var outcomes = levels(towData, "outcome");
var tournaments = levels(towData, "tournament");
var patterns = {
  single: levels(_.where(towData, {tournament: "single"}), "pattern"),
  double: levels(_.where(towData, {tournament: "double"}), "pattern")
};

var round = function(x){
  return Math.round(x*10)/10
}

var bins = map(round, _.range(-2.2, 2.2, 0.1))
///

// add a tiny bit of noise, and make sure every bin has at least epsilon probability
var smoothToBins = function(dist, sigma, bins){
  Infer({method: "enumerate"}, function(){
    var x = sample(dist);
    var smoothedProbs = map(function(b){return Number.EPSILON+Math.exp(Gaussian({mu: x, sigma: sigma}).score(b)) }, bins)
    return categorical(smoothedProbs, bins)
  })
}

var tugOfWarOpts = {method: "rejection", samples: 50}

var tugOfWarModel = function(lazyPulling, lazinessPrior, matchInfo){
  Infer(tugOfWarOpts, function(){

    var strength = mem(function(person){
      return gaussianDrift({mu: 0, sigma: 1, width: 0.3})
    })

    var lazy = function(person){
      return flip(lazinessPrior)
    }
    var pulling = function(person) {
      return lazy(person) ?
              strength(person) * lazyPulling :
              strength(person)
    }
    var totalPulling = function(team){return sum(map(pulling, team)) }
    var winner = function(team1, team2){
      totalPulling(team1) > totalPulling(team2) ? team1 : team2
    }
    var beat = function(team1,team2){winner(team1,team2) == team1}

    condition(beat(matchInfo.winner1, matchInfo.loser1))
    condition(beat(matchInfo.winner2, matchInfo.loser2))
    condition(beat(matchInfo.winner3, matchInfo.loser3))

    return round(strength("A"))

  })
}


var dataAnalysisModel = function(){
  var lazinessPrior = uniformDrift({a:0, b:0.5, width: 0.1})
  var lazyPulling =  uniformDrift({a:0, b:1, width: 0.2})

  var predictions = map(function(tournament){
    return map(function(outcome){
      return map(function(pattern){


        var itemInfo = {pattern: pattern, tournament: tournament, outcome: outcome}
        // participants' ratings
        var itemData = _.where(towData, itemInfo)

        // information about the winners and losers
        var matchInformation = _.where(matchConfigurations, itemInfo)[0]

        var modelPosterior = tugOfWarModel(lazyPulling, lazinessPrior, matchInformation)
        var smoothedPredictions = smoothToBins(modelPosterior, 0.05, bins)

        map(function(d){ observe(smoothedPredictions, d.roundedRating) }, itemData)

        return _.object([[pattern + "_" + tournament + "_" + outcome, expectation(modelPosterior)]])

      }, patterns[tournament]) // singles tournaments don't have all patterns
    }, outcomes)
  }, tournaments)

  return {
    parameters: {lazinessPrior: lazinessPrior, lazyPulling: lazyPulling},
    predictives: _.object(_.flatten(map(function(i){ _.pairs(i) }, _.flatten(predictions)), true))
  }
}

var nSamples = 10
var opts = { method: "MCMC", //kernel: {HMC: {steps: 5, stepSize: 0.01}},
            callbacks: [editor.MCMCProgress()],
             samples: nSamples, burn: 0 }

var posterior = Infer(opts, dataAnalysisModel)
editor.put("bda_bcm", posterior)
~~~~

Look at parameters.

~~~~
///fold:
var marginalize = function(dist, key){
  return Infer({method: "enumerate"}, function(){
    return sample(dist)[key];
  })
}
///
var posterior = editor.get('bda_bcm');
var parameterPosterior = marginalize(posterior, "parameters")
viz.marginals(parameterPosterior)
~~~~

Critique posterior predictive

~~~~
///fold:
var marginalize = function(dist, key){
  return Infer({method: "enumerate"}, function(){
    return sample(dist)[key];
  })
}
var merge = function(m, d){
  var keys = _.keys(d)
  return map(function(k){return {model: m[k], data: d[k], item:k} }, keys)
}
var correlation = function(xs, ys) {
    var mx = sum(xs)/xs.length,
        my = sum(ys)/ys.length;
    var num = sum(map2(function(x,y) { (x-mx) * (y-my)}, xs, ys));
    var den = Math.sqrt(sum(map(function(x) { (x-mx) * (x-mx)},xs))) *
        Math.sqrt(sum(map(function(y) { (y-my) * (y-my)},ys)));
    return num/den
}
///
var posterior = editor.get('bda_bcm');
var posteriorPredictive = marginalize(posterior, "predictives")

var modelDataDF = merge(posteriorPredictive.MAP().val, towMeans)

viz.scatter(modelDataDF)

var summaryData = map(function(x){
  return _.extend(x, {sqErr: Math.pow(x.model-x.data, 2)})
}, modelDataDF)

viz.table(summaryData)
print("Mean squared error = " + listMean(_.pluck(summaryData, "sqErr")))
var varianceExplained = Math.pow(correlation(_.pluck(summaryData, "data"), _.pluck(summaryData, "model")), 2)
print("Model explains " + Math.round(varianceExplained*100) + "% of the data")
~~~~

Test your knowledge: [Exercises]({{site.baseurl}}/exercises/14-bayesian-data-analysis.html)