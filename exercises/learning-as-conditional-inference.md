---
layout: exercise
title: learning - exercises
---

## 1. Calculating learning curves

#### a)

How does a *learning curve* differ from a *learning trajectory*?

#### b)

In the chapter, we graphed *learning trajectories* for a number of models. Below is one of these models (the one with the Beta(10,10) prior). In the chapter, we observed how the model's best guess as to the weight of the coin changed across a sequence of sucessive heads. See what happens if instead we see heads and tails in alternation:

(Notice that we make use of [globalStore](https://webppl.readthedocs.io/en/master/globalstore.html) to create our data set.)

~~~~js
///fold:
var makeCoin = function(weight) {
  return function() {
    return flip(weight) ? 'h' : 't';
  }
};
///

var pseudoCounts = {a: 10, b: 10};

var weightPosterior = function(observedData){
  return Infer({method: 'MCMC', burn:1000, samples: 1000}, function() {
    var coinWeight = sample(Beta({a: pseudoCounts.a, b: pseudoCounts.b}))
    var coinDist = Bernoulli({p: coinWeight})
    var obsFn = function(datum){observe(coinDist, datum=='h')}
    mapData({data: observedData}, obsFn)
    return coinWeight
  })
}

//creating 50 pairs of 'h' and 't' alternating
globalStore.fullDataSet = ['h', 't']
var ignore = repeat(49, function(){
  globalStore.fullDataSet = globalStore.fullDataSet.concat(['h','t'])
});

var observedDataSizes = [0,2,4,6,8,10,20,30,40,50,70,100];
var estimates = map(function(N) {
  return expectation(weightPosterior(globalStore.fullDataSet.slice(0,N)))
}, observedDataSizes);
viz.line(observedDataSizes, estimates);
~~~~

It looks like we haven't learned anything! Indeed, since our best estimate for the coin's weight was 0.5 *prior* to observing anything, our best estimate is hardly going to change when we get data consistent with that prior.

The problem is that we've been looking at the MAP (maximum a posteriori) estimate. Edit the code below to see whether our posterior *distribution* is at all changed by observing this data set. (You only need to compare the prior and the posterior after all 100 observations):

~~~~js
///fold:
var makeCoin = function(weight) {
  return function() {
    return flip(weight) ? 'h' : 't';
  }
};

var pseudoCounts = {a: 10, b: 10};

//creating 50 pairs of 'h' and 't' alternating
globalStore.fullDataSet = ['h', 't']
var ignore = repeat(49, function(){
  globalStore.fullDataSet = globalStore.fullDataSet.concat(['h','t'])
});
///

var weightPosterior = function(observedData){
  return Infer({method: 'MCMC', burn:1000, samples: 1000}, function() {
    var coinWeight = sample(Beta({a: pseudoCounts.a, b: pseudoCounts.b}))
    var coinDist = Bernoulli({p: coinWeight})
    var obsFn = function(datum){observe(coinDist, datum=='h')}
    mapData({data: observedData}, obsFn)
    return coinWeight
  })
}

var prior = //your code here
var post = //your code here

viz(prior); //should graph the prior distribution on weights
viz(post); //should graph the posterior distribution on weights
~~~~

You should see a much sharper peak in the posterior. Note that the bounds on the x-axis are likely to be different in the two graphs, which could obscure this. (The `viz` package doesn't appear to allow you to adjust the bounds on the axes.)

#### c)

Ideally, we'd like to see how our belief distribution shifts as more data comes in. A particularly good measure would be entropy. Unfortunately, calculating entropy for a Beta distribution is [somewhat involved](https://en.wikipedia.org/wiki/Beta_distribution#Quantities_of_information_(entropy)). 

A somewhat hacky alternative we can use is variance: the expected squared difference between a sample from the distribution and the distribution mean. This is hacky because it doesn't take into account the shape of the distribution, and so won't give us quite what we want if the distribution is non-symmetric. 

Edit the code below to see how variance changes as more data is observed. 

~~~~js
///fold:
var makeCoin = function(weight) {
  return function() {
    return flip(weight) ? 'h' : 't';
  }
};

var pseudoCounts = {a: 10, b: 10};

var weightPosterior = function(observedData){
  return Infer({method: 'MCMC', burn:1000, samples: 1000}, function() {
    var coinWeight = sample(Beta({a: pseudoCounts.a, b: pseudoCounts.b}))
    var coinDist = Bernoulli({p: coinWeight})
    var obsFn = function(datum){observe(coinDist, datum=='h')}
    mapData({data: observedData}, obsFn)
    return coinWeight
  })
}

//creating 256 pairs of 'h' and 't' alternating
globalStore.fullDataSet = ['h', 't']
var ignore = repeat(499, function(){
  globalStore.fullDataSet = globalStore.fullDataSet.concat(['h','t'])
});
///


var observedDataSizes = [0,2,4,8,16,32,64,128,256,512];
var posts = map(function(N) {
  return weightPosterior(globalStore.fullDataSet.slice(0,N))
}, observedDataSizes); 
// returns an array of posteriors of length observedDataSizes.length

var variances = mapN(function(i){
	// your code here
}, observedDataSizes.length)

viz.line(observedDataSizes, variances);
~~~~

You may need to look up how to use [mapN()](https://webppl.readthedocs.io/en/master/functions/arrays.html?highlight=mapN).

HINT: notice how the variable `posts` differs from `estimates` in the code above.

## 2. Causal Power

Consider our model of causal power from the chapter:

~~~~js
var observedData = [{C:true, E:false}]

var causalPowerPost = Infer({method: 'MCMC', samples: 10000, lag:2}, function() {
  // Causal power of C to cause E
  var cp = uniform(0, 1)

  // Background probability of E
  var b = uniform(0, 1)

  var obsFn = function(datum) {
    // The noisy causal relation to get E given C
    var E = (datum.C && flip(cp)) || flip(b)
    condition( E == datum.E)
  }

  mapData({data: observedData}, obsFn)

  return {causal_power: cp, background: b}
});

viz.marginals(causalPowerPost);
~~~~

#### a)

Find a set of observations that result in inferring a fairly high causal power for C and a low background probability of E. Explain why this works.

#### b)

Find a set of observations that result in inferring a fairly low causal power for C and a high background probability of E. Explain why this works.

#### c)

Find a set of observations that result in inferring a fairly high causal power for C and a high background probability of E. Explain why this works.

#### d)

Suppose every time C is present, so is the effect E. Suppose C is present at least 5 times. Is there a way to nonetheless fail to infer a high causal power for C? 
