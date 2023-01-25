---
layout: exercise
title: Algorithms for Inference - exercises
custom_js:
- assets/js/custom.js
---

## Exercise 1. Sampling Implicit Curves

In the code box below, the `curve` function defines a vaguely heart-shaped curve.
Below, we use rejection sampling to sample points along the boundary of the curve.

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

### Exercise 1.1) 

Try using MCMC with Metropolis-Hastings instead of rejection sampling.
You'll notice that it does not fare as well as rejection sampling. Why not?

~~~~
///fold:
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
///

var post = Infer({method: 'rejection', samples: 1000}, model);
viz.auto(post);
~~~~

### Exercise 1.2)

Change the *model* to make MH successfully trace the curves.
Your solution should result in a graph that clearly traces a heart-shaped figure -- though it need not do quite as well as rejection sampling.
Why does this work better?

You may find the following piece of code useful.

~~~~
var a = diagCovGaussian({mu: Vector([0, 100]),
                         sigma: Vector([1, 10])});
display(T.get(a, 0));
display(T.get(a, 1));
~~~~

~~~~
///fold:
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
///

var model = function() {
  var x = gaussian(xmu, xsigma);
  var y = gaussian(ymu, ysigma);
  condition(onCurve(x, y));
  return {x: x, y: y};
};

var post = Infer({method: 'rejection', samples: 1000}, model);
viz.auto(post);
~~~~

### Exercise 1.3

Using the original model (not the modified one in 1.2), change the inference *algorithm* to HMC to successfully trace the curves.
What parameters work best?
*Why* does this inference algorithm work better than MH?

HINT: start with the default parameters specified in the HMC [docs](https://webppl.readthedocs.io/en/master/inference/methods.html#mcmc) and play with different values.

~~~~
///fold:
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
///

var post = Infer({method: 'rejection', samples: 1000}, model);
viz.auto(post);
~~~~

## Exercise 2. Properties and pitfalls of Metropolis-Hastings

Consider a very simple function that interpolates between two endpoints. 

Suppose one endpoint is fixed at `-10`, but we have uncertainty over the value of the other endpoint and the interpolation weight between them.
By conditioning on the resulting value being close to 0, we can infer what the free variables must have been.

~~~~
var interpolate = function(point1, point2, interpolationWeight) {
  return (point1 * interpolationWeight +
          point2 * (1 - interpolationWeight));
}

var model = function(){
  var point1 = -10;
  var point2 = uniform(-100, 100);
  var interpolationWeight = uniform(0, 1);
  var pointInMiddle = interpolate(point1, point2, interpolationWeight);
  observe(Gaussian({mu: 0, sigma:0.1}), pointInMiddle);
  return {point2, interpolationWeight, pointInMiddle};
}

var posterior = Infer({method: 'MCMC', samples: 5000, lag: 100}, model);
var samples = posterior.samples;
viz(marginalize(posterior, function(x) { x.pointInMiddle }));

// Store these for future use
editor.put("posterior", posterior);
editor.put("samples", samples);
~~~~

By looking at the marginal distribution of `pointInMiddle`, we can see that `Infer()` successfully finds values of `point2` and `interpolationWeight` that satisfy our condition. 

### Exercise 2.1

Visualize the separate marginal distributions of `point2` and `interpolationWeight`.
How would you describe their shapes, compared to the marginal distribution of `pointInMiddle`?

HINT: use the [marginalize](http://docs.webppl.org/en/master/functions/other.html#marginalize) helper to elegantly construct these marginal distributions

~~~~
var posterior = editor.get("posterior");
~~~~

### Exercise 2.2

Visualize the *joint* marginal distribution of point2 and interpolationWeight.
What does this tell you about their dependence?

~~~~
var posterior = editor.get("posterior");
~~~~

### Exercise 2.3

WebPPL also exposes the list of MCMC samples that the density plots above are built from.
This is saved in `posterior.samples`.
Set `samples = 100` and `lag = 0`, then plot `pointInMiddle` as a function of the sample number.
Run this several times to get a feel for the shape of this curve.
What do you notice about the samples generated by MCMC?

HINT: this will require some 'data munging' on the array of samples.
Some useful functions will be [`map`](http://docs.webppl.org/en/master/functions/arrays.html#map), `_.range()`, and `viz.line` which takes arrays `x` and `y`.

~~~~
///fold:
var interpolate = function(point1, point2, interpolationWeight) {
  return (point1 * interpolationWeight +
          point2 * (1 - interpolationWeight));
}

var model = function(){
  var point1 = -10;
  var point2 = uniform(-100, 100);
  var interpolationWeight = uniform(0, 1);
  var pointInMiddle = interpolate(point1, point2, interpolationWeight);
  observe(Gaussian({mu: 0, sigma:0.1}), pointInMiddle);
  return {point2, interpolationWeight, pointInMiddle};
}
///

var posterior = Infer({method: 'MCMC', samples: 5000, lag: 100}, model);
~~~~

### Exercise 2.4 

Rewrite the code to use rejection sampling.
Note that you will need to find a way to turn the `observe` statement into a `condition` statement (Hint: See Exercise #1).
Is using rejection sampling here a good idea?
Why or why not?

~~~~
///fold:
var interpolate = function(point1, point2, interpolationWeight) {
  return (point1 * interpolationWeight +
          point2 * (1 - interpolationWeight));
}
///

var model = function(){
  var point1 = -10;
  var point2 = uniform(-100, 100);
  var interpolationWeight = uniform(0, 1);
  var pointInMiddle = interpolate(point1, point2, interpolationWeight);
  observe(Gaussian({mu: 0, sigma:0.1}), pointInMiddle);
  return {point2, interpolationWeight, pointInMiddle};
}

viz.marginals(Infer({method: 'MCMC', samples: 5000, lag: 100}, model));
~~~~


### Exercise 2.5

Using `verbose: true` in our `MH` algorithm, we can observe the proportion of proposals actually accepted.
What is the acceptance rate over time and what about the model puts it at this level? 

Consider the list of built-in drift kernels [here](https://webppl.readthedocs.io/en/master/driftkernels.html?highlight=drift%20kernel#helpers).
Which of these would be appropriate to use in your model in place of the current uniform prior from which `point2` is sampled?
Replace `uniform(-100, 100)` with a drift kernel and adjust the `width` parameter to raise the acceptance rate.
Why does using this drift kernel influence the acceptance rate?
What is a drawback of this approach?

~~~~
///fold:
var interpolate = function(point1, point2, interpolationWeight) {
  return (point1 * interpolationWeight +
          point2 * (1 - interpolationWeight));
}
///

var model = function(){
  var point1 = -10;
  var point2 = uniform(-100, 100);
  var interpolationWeight = uniform(0, 1);
  var pointInMiddle = interpolate(point1, point2, interpolationWeight);
  observe(Gaussian({mu: 0, sigma:0.1}), pointInMiddle);
  return {point2, interpolationWeight, pointInMiddle};
}

var posterior = Infer({method: 'MCMC',
                       samples: 500,
                       verbose: true}, model);
~~~~

<!--
### c)

Edit the code below to implement your Metropolis-Hastings recipe. Use `viz.marginals` to show that it reliably chooses values of `y` and `w` that satisfy the condition.

Hint 1: Check out possible [WebPPL distributions](https://webppl.readthedocs.io/en/master/distributions.html) you might use. 

Hint 2: Many WebPPL distributions require vectors as input. Turn an array into a vector with the function `Vector()` (e.g., `Vector([x, y])`).

Hint 3: Remember that `dist.score(x)` returns the log probability (density) of `x` given distribution `dist`. To turn that into a a probability, use `Math.exp()`. 


## Exercise 4. Topic models

[Topic models](https://en.wikipedia.org/wiki/Topic_model) are a popular method for classifying texts. A "topic" is a probability distribution over a vocabulary. Importantly, different topics have different distributions: a topic pertaining to animals will have higher probability on "wolf" than a topic pertaining to programming. Crucially, different documents are assumed to be generated by drawing words from one or more topics. The job of the model is to, based on some set of documents, infer the latent topics, their probability distributions, and which topics are implicated in which documents. 

Topic models are an example of a [mixture model](11-mixture-models.html). The following code box shows a very simple mixture model, in which each data point was generated by one of three Gaussian distributions, each with its own mean and standard deviation. The variable `weights` represents the relative proportion of data generated by each Gaussian. For instance, the first Gaussian generates 40% of the data. We can use MCMC to recover the means, standard deviations, and weights.

~~~~
var mus = [-2, 0, 2];
var sigmas = [0.25, 1, 0.5];
var weights = [0.4, 0.1, 0.5];

var data = repeat(100, function() {
  var i = discrete(weights);
  return gaussian(mus[i], sigmas[i]);
});

var gaussianMixtureModel = function() {
  var weights = dirichlet(Vector([1, 1, 1]));
  var mus = repeat(3, function() { return gaussian(0, 1); });
  var sigmas = repeat(3, function() { return Math.exp(gaussian(0, 1)); });
  map(function(d) {
    var i = discrete(weights);
    factor(Gaussian({mu: mus[i], sigma: sigmas[i]}).score(d));
  }, data);
  return {mus: mus, sigmas: sigmas, weights: weights};
};

var post = Infer({
  method: 'MCMC',
  steps: 1000
}, gaussianMixtureModel);

print(sample(post))
~~~~

Note that the order of the Gaussians returned by `post` won't necessarily be the same as in `mus`. Thus, we may see a result like this:

```
{"mus":[2.0588258375411383,-1.502841653870516,-0.3507690954089829],"sigmas":[0.7751841178726206,0.8098945135050652,1.411033688748035],"weights":{"dims":[3,1],"length":3,"data":{"0":0.12358930290684293,"1":0.35801309847048407,"2":0.5183975986226731}}}
```

The Gaussian with the mean near `2` is listed first rather than last. You may see a different ordering. We return to this issue in (b) and (c), below.

### a) 

In the model below, we are presented with six very boring texts. Implement a topic model that will infer the probability distribution across words for each of two topics. 

~~~~
var vocabulary = ['DNA', 'evolution', 'parsing', 'phonology'];
var eta = ones([vocabulary.length, 1])

var numTopics = 2
var alpha = ones([numTopics, 1])

var corpus = [
  'DNA evolution DNA evolution DNA evolution DNA evolution DNA evolution'.split(' '),
  'DNA evolution DNA evolution DNA evolution DNA evolution DNA evolution'.split(' '),
  'DNA evolution DNA evolution DNA evolution DNA evolution DNA evolution'.split(' '),
  'parsing phonology parsing phonology parsing phonology parsing phonology parsing phonology'.split(' '),
  'parsing phonology parsing phonology parsing phonology parsing phonology parsing phonology'.split(' '),
  'parsing phonology parsing phonology parsing phonology parsing phonology parsing phonology'.split(' ')
]

var model = function() {

  var topics = repeat(numTopics, function() {
    return T.toScalars(dirichlet({alpha: eta}))
  })

  mapData({data: corpus}, function(doc) {
  
  		// your code here

    })
  })

  return topics
}

var results = // your code here

//plot expected probability of each word, for each topic:
print("Topic 1:")
viz.bar(vocabulary, map(function(i) {return expectation(results, function(v) {return v[0][i]})}, _.range(vocabulary.length)))
print("Topic 2:")
viz.bar(vocabulary, map(function(i) {return expectation(results, function(v) {return v[1][i]})}, _.range(vocabulary.length)))
~~~~

### b)

Run your code from (a) several times. You should see that sometimes Topic 1 favors the words 'DNA' and 'evolution' and Topic 2 favors 'parsing' and 'phonology'. Other times, this is reversed, with Topic 1 favoring 'parsing' and 'phonology' and Topic 2 favoring 'DNA' and 'evolution'.

Why is this? 

### c)

If we ran MCMC on the model in (a) for an infinite amount of time, we would no longer see a distinction between Topic 1 and Topic 2. Why?

Given the answer to that question, why does our model in (a) seem to work?

HINT: We do not need to run our initial mixture model example above nearly as long to get the same effect. This is why we printed samples from the distribution. 
--> 
