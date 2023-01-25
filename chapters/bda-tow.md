---
layout: chapter
title: BDA for Tug of War
description: BDA! For Tug of War!
custom_js:
- assets/js/towData.js
- assets/js/towConfigurations.js
---


# Example: Linear regression and tug of war

One of the virtues of Bayesian data analysis is its ability to interface with Bayesian models of cognition in a natural way.
Bayesian cognitive models are formalizations of hypotheses about cognition, which we then can test with an experiment.
We can contrast our rich Bayesian cognitive models with more standard models from data science, like linear regression, and evaluate them all using Bayesian data analysis.

Regression is the workhorse of data science.
Regression models are useful in situations when you have (1) data and (2) some (potentially vague) hypotheses about how variables relate to each other (e.g., that demographics might predict political party affiliation [in some unspecified way]).
In psychology and many other behavioral sciences, experiments are often constructed with discrete/categorical manipulations (e.g., measuring processing time of words vs. pseudowords).
The question "is A greater than B?" (is the processing time of words faster than the processing time of pseudowords?) can be answered using a regression model.

To explore a Bayesian linear regression model, we will use data from the Tug-of-War experiment by @Gerstenberg2012.
Let's be good data scientists, and start by just taking a look at the data set, found in the `towData` variable (available in this page only).

~~~~
var levels = function(a, lvl){ return _.uniq(_.map(a, lvl)) }

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
viz.hist(_.map(towData, "ratingZ"))
~~~~

This distribution of ratings is from all trials, all participants, all experimental conditions.
We see that the ratings range from about -2 to 2.
The most likely ratings are one standard deviation above or below the mean, though some ratings are at the mean of 0.

## Single regression

Let's say we ran this experiment and hypothesized that the number of times the target character won (`"nWins"` in the data set) is a predictor of how participants' ratings of strength.
We'll formalize this in a Bayesian regression framework, where ratings of strength $$r$$ are a linear combination of a fixed intercept $$\beta_0$$ and weighted component of number of wins $$\beta_1 *  n_{wins}$$.

$$y_{predicted} = \beta_0 + \beta_1 * n_{wins}$$

Because we're in the business of building generative models, we will have to be explicit about how $$y_{predicted}$$ relates to the actual rating data we observed.
We make the standard assumption that the actual ratings are normally distributed around $$y_{predicted}$$, with some noise $$\sigma$$. [This is analagous to having "randomly distributed errors".]

$$d \sim \mathcal{N}(y_{predicted}, \sigma)$$

This is a model of our data.
As in cognitive models, we will put priors on the parameters: $$\beta_0, \beta_1, \sigma$$, and infer their likely values by conditioning on the observed data.

~~~~
// alternative proposal distribution for metropolis-hastings algorithm
var uniformKernel = function(prevVal) {
  return Uniform({a: prevVal - 0.2, b: prevVal + 0.2});
};

var singleRegression = function(){
  // parameters of a simple linear regression
  var b0 = sample(Uniform({a: -1, b: 1}), {driftKernel: uniformKernel})
  var b1 = sample(Uniform({a: -1, b: 1}), {driftKernel: uniformKernel})
  var sigma = sample(Uniform({a: 0, b: 2}), {driftKernel: uniformKernel})

  map(function(d){

    // linear regression formula
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

var levels = function(a, lvl){ return _.uniq(_.map(a, lvl)) }

var outcomes = levels(towData, "outcome");
var tournaments = levels(towData, "tournament");
var patterns = {
  single: levels(_.filter(towData, {tournament: "single"}), "pattern"),
  double: levels(_.filter(towData, {tournament: "double"}), "pattern")
};

// alternative proposal distribution for metropolis-hastings algorithm
var uniformKernel = function(prevVal) {
  return Uniform({a: prevVal - 0.2, b: prevVal + 0.2});
};

var singleRegression = function(){
  var b0 = sample(Uniform({a: -1, b: 1}), {driftKernel: uniformKernel})
  var b1 = sample(Uniform({a: -1, b: 1}), {driftKernel: uniformKernel})
  var sigma = sample(Uniform({a: 0, b: 2}), {driftKernel: uniformKernel})

  var predictions = map(function(tournament){
    return map(function(outcome){
      return map(function(pattern){

        var itemInfo = {pattern: pattern, tournament: tournament, outcome: outcome}
        var itemData = _.filter(towData, itemInfo)

        // linear regression formula
        var predicted_y = b0 + itemData[0]["nWins"]*b1

        map(function(d){ observe(Gaussian({mu: predicted_y, sigma: sigma}), d.ratingZ)}, itemData)

        return [pattern + "_" + tournament + "_" + outcome, predicted_y]

      }, patterns[tournament]) // singles tournaments don't have all patterns
    }, outcomes)
  }, tournaments)

  // nasty data munging
  return _.fromPairs(_.flattenDepth(predictions, 2))
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

print("Mean squared error = " + listMean(_.map(summaryData, "sqErr")))

var varianceExplained = Math.pow(correlation(_.map(summaryData, "data"), _.map(summaryData, "model")), 2)
print("Model explains " + Math.round(varianceExplained*100) + "% of the data")

viz.table(summaryData)
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
var levels = function(a, lvl){ return _.uniq(_.map(a, lvl)) }

var outcomes = levels(towData, "outcome");
var tournaments = levels(towData, "tournament");
var patterns = {
  single: levels(_.filter(towData, {tournament: "single"}), "pattern"),
  double: levels(_.filter(towData, {tournament: "double"}), "pattern")
};

// alternative proposal distribution for metropolis-hastings algorithm
var uniformKernel = function(prevVal) {
  return Uniform({a: prevVal - 0.2, b: prevVal + 0.2});
};
///

var multipleRegression = function(){
  var b0 = sample(Uniform({a: -1, b: 1}), {driftKernel: uniformKernel})
  var b1 = sample(Uniform({a: -1, b: 1}), {driftKernel: uniformKernel})
  var b2 = sample(Uniform({a: -1, b: 1}), {driftKernel: uniformKernel})
  var sigma = sample(Uniform({a: 0, b: 2}), {driftKernel: uniformKernel})


  var predictions = map(function(tournament){
    return map(function(outcome){
      return map(function(pattern){

        var itemInfo = {pattern: pattern, tournament: tournament, outcome: outcome}
        var itemData = _.filter(towData, itemInfo)

        // linear equation
        var predicted_y = b0 + itemData[0]["nWins"]*b1 + itemData[0]["nUniqueWins"]*b2

        map(function(d){ observe(Gaussian({mu: predicted_y, sigma: sigma}), d.ratingZ) }, itemData)

        return [pattern + "_" + tournament + "_" + outcome, predicted_y]

      }, patterns[tournament]) // singles tournaments don't have all patterns
    }, outcomes)
  }, tournaments)

  return {
    parameters: {b0: b0, b1: b1, b2: b2, sigma: sigma},
    predictives: _.fromPairs(_.flattenDepth(predictions, 2))
  }
}

var nSamples = 1000
var opts = { method: "MCMC", kernel: 'MH',
            callbacks: [editor.MCMCProgress()],
             samples: nSamples, burn: nSamples/2 }

var posterior = Infer(opts, multipleRegression)
editor.put('multiRegression', posterior)
~~~~

Look at parameters.

~~~~
var posterior = editor.get('multiRegression');
var parameterPosterior = marginalize(posterior, function(x){return x.parameters})
viz.marginals(parameterPosterior)
~~~~

We see that $$\beta_2$$ is also probably not 0, suggesting that the number of *unique* wins a player has is relevant for predicting participants' judgments of their strength.
How well does the model fit the data?

~~~~
///fold:
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
var posteriorPredictive = marginalize(posterior, function(x){return x.predictives})

var modelDataDF = merge(posteriorPredictive.MAP().val, towMeans)


var summaryData = map(function(x){
  return _.extend(x, {sqErr: Math.pow(x.model-x.data, 2)})
}, modelDataDF)

print("Mean squared error = " + listMean(_.map(summaryData, "sqErr")))
var varianceExplained = Math.pow(correlation(_.map(summaryData, "data"), _.map(summaryData, "model")), 2)
print("Model explains " + Math.round(varianceExplained*100) + "% of the data")

viz.scatter(modelDataDF)

viz.table(summaryData)
~~~~

The multiple linear regression model fit is improved a little bit, but still fails to predict meaningful difference between certain conditions.

With regressions like these, we're often asking binary questions (e.g., "is this parameter 0 or not?").
These kinds of questions provide just a few bits of information.
Instantiating a hypothesis in a cognitive model can answer more than just categorical questions by testing a richer theory of the data.

## BDA of Tug-of-war model

Recall the Tug-of-war model from the chapter on [conditioning]({{site.baseurl}}/chapters/conditioning.html).

~~~~
var options = {method: 'rejection', samples: 1000}

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


### Learning about the Tug-of-War model

To learn more about (and test) the tug-of-war model, we're going to connect it to the data from the experiment.
You'll notice that we have two parameters in this model: the proportion of a person's strength they pull with when they are being lazy (`lazyPulling`) and the prior probability of a person being lazy (`lazinessPrior`).
Above, we set these parameters to be `0.5` and `0.3`, respectively.
People are lazy about a third of the time, and when they are lazy, they pull with half their strength.
(Technical note: Because we are comparing relative strengths and we have normalized the human ratings, we don't have to infer the parameters of the gaussian in `strength`.
We just use the standard normal distribution.)

Those parameter values aren't central to our hypothesis.
They are peripheral details to the larger hypothesis which is that people reason about team games like Tug of War by running a structured, generative model in their heads and doing posterior inference.
Rather than guessing at what values we should put for these parameters, we can use the data to inform our beliefs about what those parameters are likely to be (assuming the general model is a good one).

~~~~
///fold:
var levels = function(a, lvl){ return _.uniq(_.map(a, lvl)) }

var outcomes = levels(towData, "outcome");
var tournaments = levels(towData, "tournament");
var patterns = {
  single: levels(_.filter(towData, {tournament: "single"}), "pattern"),
  double: levels(_.filter(towData, {tournament: "double"}), "pattern")
};

var round = function(x){
  return Math.round(x*10)/10
}

var bins = map(round, _.range(-2.2, 2.2, 0.1))

// alternative proposal distribution for metropolis-hastings algorithm
var lazinessPriorKernel = function(prevVal) {
  return Uniform({a: prevVal - 0.1, b: prevVal + 0.1});
};
var lazyPullingKernel = function(prevVal) {
  return Uniform({a: prevVal - 0.2, b: prevVal + 0.2});
};
///

// add a tiny bit of noise, and make sure every bin has at least epsilon probability
var smoothToBins = function(dist, sigma, bins){
  Infer({method: "enumerate"}, function(){
    var x = sample(dist);
    var smoothedProbs = map(function(b){return Number.EPSILON+Math.exp(Gaussian({mu: x, sigma: sigma}).score(b)) }, bins)
    return categorical(smoothedProbs, bins)
  })
}

var tugOfWarOpts = {method: "rejection", samples: 500}

var tugOfWarModel = function(lazyPulling, lazinessPrior, matchInfo){
  Infer(tugOfWarOpts, function(){

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

    condition(beat(matchInfo.winner1, matchInfo.loser1))
    condition(beat(matchInfo.winner2, matchInfo.loser2))
    condition(beat(matchInfo.winner3, matchInfo.loser3))

    return round(strength("A"))

  })
}

var dataAnalysisModel = function(){
  var lazinessPrior = sample(Uniform({a: 0, b: 0.5}), {driftKernel: lazinessPriorKernel})
  var lazyPulling = sample(Uniform({a: 0, b: 1}), {driftKernel: lazyPullingKernel})

  var predictions = map(function(tournament){
    return map(function(outcome){
      return map(function(pattern){


        var itemInfo = {pattern: pattern, tournament: tournament, outcome: outcome}
        // participants' ratings
        var itemData = _.filter(towData, itemInfo)

        // information about the winners and losers
        var matchInformation = _.filter(matchConfigurations, itemInfo)[0]

        var modelPosterior = tugOfWarModel(lazyPulling, lazinessPrior, matchInformation)
        var smoothedPredictions = smoothToBins(modelPosterior, 0.05, bins)

        map(function(d){ observe(smoothedPredictions, d.roundedRating) }, itemData)

        return [pattern + "_" + tournament + "_" + outcome, expectation(modelPosterior)]

      }, patterns[tournament]) // singles tournaments don't have all patterns
    }, outcomes)
  }, tournaments)

  return {
    parameters: {lazinessPrior: lazinessPrior, lazyPulling: lazyPulling},
    predictives: _.fromPairs(_.flattenDepth(predictions, 2))
  }
}

var nSamples = 20
var opts = { method: "MCMC",
            callbacks: [editor.MCMCProgress()],
             samples: nSamples, burn: 0 }

var posterior = Infer(opts, dataAnalysisModel)
editor.put("bda_bcm", posterior)
~~~~

Look at parameters.

~~~~
var posterior = editor.get('bda_bcm');
var parameterPosterior = marginalize(posterior, function(x) {return x.parameters})
viz.marginals(parameterPosterior)
~~~~

Critique posterior predictive

~~~~
///fold:
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
var posteriorPredictive = marginalize(posterior, function(x) {return x.predictives})

var modelDataDF = merge(posteriorPredictive.MAP().val, towMeans)


var summaryData = map(function(x){
  return _.extend(x, {sqErr: Math.pow(x.model-x.data, 2)})
}, modelDataDF)

print("Mean squared error = " + listMean(_.map(summaryData, "sqErr")))
var varianceExplained = Math.pow(correlation(_.map(summaryData, "data"), _.map(summaryData, "model")), 2)
print("Model explains " + Math.round(varianceExplained*100) + "% of the data")

viz.scatter(modelDataDF)
viz.table(summaryData)
~~~~

An extended analysis of the Tug of War model (using [RWebPPL](https://github.com/mhtess/rwebppl)) can be found [here](http://rpubs.com/mhtess/bda-tow).