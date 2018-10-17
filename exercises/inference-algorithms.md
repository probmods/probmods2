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

Consider this very simple model that chooses `y` and `w` such that `-10 * w + y * (1 - w)` is as close as possible to `0`:

~~~~
var mymodel = function(){
  var point1 = -10
  var point2 = uniform(-100,100)
  var interpolationWeight = uniform(0,1)
  var pointInMiddle = (point1 * interpolationWeight +
                       point2 * (1 - interpolationWeight))
  observe(Gaussian({mu: 0, sigma:0.1}), pointInMiddle)
  return {point2, interpolationWeight, pointInMiddle}
}

var posteriorSamples = Infer({
  method: 'MCMC',
  samples: 5000,
  lag: 100,
}, mymodel).samples;

viz(marginalize(post, function(x) {return x.pointInMiddle}))
~~~~

By looking at the marginal distribution of `pointInMiddle`, we can see that `Infer()` successfully finds values of `y` and `w` that satisfy our condition. 

### a)

Visualize the separate marginal distributions of `point2` and `interpolationWeight`. How would you describe their shapes, compared to the marginal distribution of `pointInMiddle`? 

Now visualize the *joint* marginal distribution of point2 and interpolationWeight. What does this tell you about their dependence?

HINT: use the [marginalize](http://docs.webppl.org/en/master/functions/other.html#marginalize) helper to elegantly construct these marginal distributions

### b)

WebPPL also exposes the list of MCMC samples that the density plots above are built from. This is saved in the `samples` variable. Decrease the number of samples to `50` (and the `lag` to 0) and plot `pointInMiddle` as a function of the sample number. Run this several times to get a feel for the shape of this curve. What do you notice? What property of MCMC are you observing?

HINT: this will require some 'data munging' on the array of samples. Some useful functions will be [`map`](http://docs.webppl.org/en/master/functions/arrays.html#map), `_.range()`, and `viz.line` which takes arrays `x` and `y`.

### c) 

Try re-writing the model to use rejection sampling. Note that you will need to find a way to turn the `factor` statement into a `condition` statement (Hint: See Exercise #1). Is using rejection sampling here a good idea? Why or why not?

### d)

Add `verbose: true` to the list of options. What is the acceptance rate over time (i.e. what proportion of proposals are actually accepted in the chain?). What about the model puts it at this level? 

Consider the list of built-in drift kernels [here](https://webppl.readthedocs.io/en/master/driftkernels.html?highlight=drift%20kernel#helpers). Which of these would be appropriate to use in your model in place of the current uniform prior from which `point2` is sampled? After using that kernel in your model, what effect do you observe on the acceptence rate, and why?

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
