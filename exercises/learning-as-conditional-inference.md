---
layout: exercise
title: Learning as conditional inference - exercises
---

## Exercise 1: Prior beliefs about coins

### Exercise 1.1

Recall our final coin weight model, "fair-vs-uniform", in which the coin weight was either 0.5 with high probability or drawn from a uniform distribution otherwise.
This implies that a two-faced coin (always heads) is equally likely as a 70% heads coin.
Intuitively you might be inclined to think that a two-faced coin is easier to make, and thus more likely.
Adjust the model to express a prior where 90% of biased coins are always heads.

~~~~
var weightPosterior = function(observedData){
  return Infer({method: 'MCMC', burn:1000, samples: 10000}, function() {
    var isFair = flip(0.9);
    var realWeight = isFair ? 0.5 : uniform({a:0, b:1});
    var coin = Bernoulli({p: realWeight});
    var obsFn = function(datum){ observe(coin, datum=='h') };
    mapData({data: observedData}, obsFn);
    return realWeight;
  })
}

var fullDataSet = repeat(50, function() { 'h' });
var observedDataSizes = [0,1,2,4,6,8,10,12,15,20,25,30,40,50];
var estimates = map(function(N) { expectation(weightPosterior(fullDataSet.slice(0, N))) }, observedDataSizes);
viz.line(observedDataSizes, estimates);
~~~~

#### b)

How does your solution behave differently than the fair-vs-uniform model from the chapter?
Find a data set such that the learning curves are qualitatively different.
You may want to increase the burn-in samples for more reliable MCMC.

~~~~
var weightPosterior = function(observedData){
  return Infer({method: 'MCMC', burn:1000, samples: 10000}, function() {
    var isFair = flip(0.999);
    var realWeight = isFair ? 0.5 : uniform({a:0, b:1});
    var coin = Bernoulli({p: realWeight});
    var obsFn = function(datum){ observe(coin, datum=='h') };
    mapData({data: observedData}, obsFn);
    return realWeight;
  })
}

var fullDataSet = repeat(50, function() { 'h' });
var observedDataSizes = [0,1,2,4,6,8,10,12,15,20,25,30,40,50];
var estimates = map(function(N) { expectation(weightPosterior(fullDataSet.slice(0, N))) }, observedDataSizes);
viz.line(observedDataSizes, estimates);
~~~~


## Exercise 2: The strength of beliefs

In the chapter, we observed how the model's best guess about the weight of the coin changed across a sequence of successive heads.
See what happens if instead we see heads and tails in alternation.

~~~~
var pseudoCounts = {a: 10, b: 10};

var weightPosterior = function(observedData){
  return Infer({method: 'MCMC', burn:1000, samples: 1000}, function() {
    var coinWeight = sample(Beta(pseudoCounts));
    var coinDist = Bernoulli({p: coinWeight});
    var obsFn = function(datum){ observe(coinDist, datum=='h') };
    mapData({data: observedData}, obsFn);
    return coinWeight;
  })
}

var fullDataSet = repeat(50, function() { ['h', 't'] }).flat();
var observedDataSizes = [0,2,4,6,8,10,20,30,40,50,70,100];
var estimates = map(function(N) { expectation(weightPosterior(fullDataSet.slice(0,N))) }, observedDataSizes);
viz.line(observedDataSizes, estimates);
~~~~

It looks like we haven't learned anything!
Since our best estimate for the coin's weight was 0.5 *prior* to observing anything, our best estimate, the maximum a posteriori (MAP), is hardly going to change when we get data consistent with that prior.

### Exercise 2.1

Modify the code below to see whether our posterior *distribution* is at all changed by observing this data set.
Compare the prior and the posterior after all 100 observations.
What are some similarities and differences?
Why does this occur?

~~~~
var pseudoCounts = {a: 10, b: 10};

var weightPosterior = function(observedData){
  return Infer({method: 'MCMC', burn:1000, samples: 1000}, function() {
    var coinWeight = sample(Beta(pseudoCounts));
    var coinDist = Bernoulli({p: coinWeight});
    var obsFn = function(datum){ observe(coinDist, datum=='h') };
    mapData({data: observedData}, obsFn);
    return coinWeight;
  })
}

var fullDataSet = repeat(50, function() { ['h', 't'] }).flat();

var prior = ...
var post = ...

display("Prior distribution");
viz(prior);
display("Posterior distribution");
viz(post);
~~~~


### Exercise 2.2

This time, let's see how our belief distribution changes as more data are observed in.
Although entropy would be a good measure here, calculating entropy for a Beta distribution is [somewhat involved](https://en.wikipedia.org/wiki/Beta_distribution#Quantities_of_information_(entropy)). 

An alternative we can use is variance: the expected squared difference between a sample from the distribution and the distribution mean.
This doesn't take into account the shape of the distribution, and so it won't give us quite what we want if the distribution is non-symmetric; but it is a reasonable first try. 

Modify the code to see how the variance changes as more data are observed.

HINT: `expectation` can take an optional function parameter. For example:
~~~~norun
expectation(Categorical({ps: [.2, .8], vs: [0, 1]}), function(x) { 2*x });
~~~~

~~~~
var pseudoCounts = {a: 10, b: 10};

var weightPosterior = function(observedData){
  return Infer({method: 'MCMC', burn:1000, samples: 1000}, function() {
    var coinWeight = sample(Beta(pseudoCounts));
    var coinDist = Bernoulli({p: coinWeight});
    var obsFn = function(datum){ observe(coinDist, datum=='h') };
    mapData({data: observedData}, obsFn);
    return coinWeight;
  })
}

var fullDataSet = repeat(50, function() { ['h', 't'] }).flat();
var observedDataSizes = [0,2,4,6,8,10,20,30,40,50,70,100];
var estimates = map(function(N) { expectation(weightPosterior(fullDataSet.slice(0,N))) }, observedDataSizes);
viz.line(observedDataSizes, estimates);
~~~~


## 3. Causal Power

Consider our model of causal power from the chapter.

~~~~
var causalPowerModel = function(observedData) {
  // Causal power of C to cause E
  var cp = uniform(0, 1);

  // Background probability of E
  var b = uniform(0, 1);

  mapData({data: observedData}, function(datum) {
    // The noisy causal relation to get E given C
    var E = (datum.C && flip(cp)) || flip(b);
    condition(E == datum.E);
  })

  return {causal_power: cp, background: b};
}

var observedData = [{C: true, E: false}];
var posterior = Infer({method: 'MCMC', samples: 10000, lag:2},
                      function() { causalPowerModel(observedData) })
viz.marginals(posterior);
~~~~

For each list item, find a set of `observedData` that produce the following properties.
Then explain intuitively why the data produce these results.

1. High causal power for C and low background probability of E.
2. Low causal power for C and high background probability of E.
3. High causal power for C and high background probability of E.
4. C is present at least 5 times, E is present each time C is present, and C does not have high causal power.
