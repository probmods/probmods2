---
layout: exercise
title: Algorithms for Inference - exercises
---

## Exercise 1. Sampling Implicit Curves

In the code box below, the `curve` function defines a vaguely heart-shaped curve. Below, we use rejection sampling to sample points along the boundary of the curve.

~~~~
// takes z = 0 cross section of heart surface to some tolerance
// see http://mathworld.wolfram.com/HeartSurface.html
var onCurve = function(x, y) {
  var x2 = x*x;
  var term1 = y - Math.pow(x2, 1/3);
  var crossSection = x2 + term1*term1 - 1;
  return Math.abs(crossSection) < 0.01;
};
var xbounds = [-1, 1];
var ybounds = [-1, 1.6];

var xmu = 0.5 * (xbounds[0] + xbounds[1]);
var ymu = 0.5 * (ybounds[0] + ybounds[1]);
var xsigma = 0.5 * (xbounds[1] - xbounds[0]);
var ysigma = 0.5 * (ybounds[1] - ybounds[0]);

var model = function() {
  var x = gaussian(xmu, xsigma);
  var y = gaussian(ymu, ysigma);
  condition(onCurve(x, y));
  return {x: x, y: y};
};

var post = Infer({method: 'rejection', samples: 1000}, model);
viz.auto(post);
~~~~

### a) 

Try using MCMC with Metropolis-Hastings instead of rejection sampling. You'll notice that it does not fare as well as rejection sampling. Why not?

### b)

Change the *model* to make MH successfully trace the curves. Your solution should result in a graph that clearly traces a heart-shaped figure -- though it need not do quite as well as rejection sampling. Why does this work better?

HINT: is there a way you can sample a single (x,y) pair instead of separately sampling x and then y? You might want to check out the distribution [DiagCovGaussian()](https://webppl.readthedocs.io/en/master/distributions.html#DiagCovGaussian) in the docs. Note that it expects parameters to be [Vectors](https://webppl.readthedocs.io/en/master/functions/tensors.html#Vector) and you can extract elements from vectors with `T.get` (`T` is webppl shorthand for `ad.tensor`: for more information on tensor functions, see [adnn docs](https://github.com/dritchie/adnn/blob/master/ad/README.md#available-ad-primitive-functions)).

### c)

Now change the the inference *algorithm* (with the original model) to successfully trace the curves. What parameters did you try, and what worked best?

HINT: you may want to explore HMC! start with the default parameters specified in the HMC [docs](https://webppl.readthedocs.io/en/master/inference/methods.html#mcmc) and play with different values.


## Exercise 2. Properties and pitfalls of Metropolis-Hastings


Consider this very simple model that chooses `y` and `w` such that `-10 * w + y * (1 - w)` is as close as possible to `0`.

### `TODO` motivate why we're interested in this relationship between `y` and `w`...

~~~~
var likelihood = function(x,y,w){
  return Gaussian({mu: 0, sigma:0.1}).score(x*w + y*(1-w))
}

var model = function(){
  var x = -10
  var y = uniform(-100,100)
  var w = dirichlet(Vector([1,1])).data[0]
  factor(likelihood(x,y,w))
  return {y: y, w: w, s: x*w + y*(1-w)}
}

var posteriorDistr = Infer({
  method: 'MCMC',
  samples: 5000,
  lag: 100,
}, model);

editor.put("posteriorDistr", posteriorDistr)
~~~~

Let's plot the joint distribution over over `y` and `w`. Given that they are related by our model this distribution seems reasonable.

~~~~
var posteriorDistr = editor.get("posteriorDistr")
var xyDistr = marginalize(posteriorDistr, function(x) {
  return {'y': x.y, 'w': x.w}
  })
viz(xyDistr)
~~~~

### a
Plot the marginal distribution over `s`.  Does the resulting distribution tend to favor values that satisify our model above?

~~~~
// Answer
var posteriorDistr = editor.get("posteriorDistr")
var sDistr = marginalize(posteriorDistr, function(x) {
  return {'s': x.s}
  })
viz(sDistr)
~~~~

We constructed the posterior above using an approximate inference technique in the MCMC family. Given that we are approximating the posterior using samples, a nice webppl feature is that we can access those samples directly via the distributions `.samples` attribute.
~~~~
var posteriorDistr = editor.get("posteriorDistr")
// Helper for extracting samples
var getSample = function(d) {
  return {
    "w": d["value"]["w"], 
    "y": d["value"]["y"]}
} 
var mcmcSamples = map(getSample, posteriorDistr.samples)
editor.put("mcmcSamples", mcmcSamples)
// Print first 10 MCMC samples
mcmcSamples.slice(1, 10)
~~~~

### b
Imagine a scenario in which we *only* had access the samples from an MCMC chain. How can we turn those into a distribution object? Create a new distribution object of using the `w` and `y` samples by calling `Infer()` and plot it using viz.
~~~~
var mcmcSamples = editor.get("mcmcSamples", mcmcSamples)
var distrFromSamples = Infer(function() {
  // Your code here
  //Answer (remove)
  // return categorica({vs:mcmcSamples})
  })
viz(var)
~~~~

### c
A nice feature of having direct access the samples is that we can examine the chain directly to assess how while it is mixing (burn-in time). Do you think these plots indicate that the chain has converged to the stationary distribution? Why or why not?
~~~~
var mcmcSamples = editor.get("mcmcSamples", mcmcSamples)
// Visualize w's
viz.line(_.range(mcmcSamples.length), 
         map(function(x){return x["w"]}, mcmcSamples))
// Visualize y's
viz.line(_.range(mcmcSamples.length), 
         map(function(x){return x["y"]}, mcmcSamples))
~~~~

### d

Drift kernel question here!!!


# Old question below useful for drift kernel stuff...


### a)

Try re-writing the model to use rejection sampling. Note that you will need to find a way to turn the `factor` statement into a `condition` statement (Hint: See Exercise #1). Is using rejection sampling here a good idea? Why or why not?

### b)

Describe a proposal distribution that you could use for Metropolis-Hastings inference for this model. Show that it satisfies the necessary conditions. 

