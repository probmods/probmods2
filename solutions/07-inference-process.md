---
layout: exercise
title: Algorithms for Inference - exercises
description: MCMC, etc.
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


### Solution
Once M-H finds a state with reasonable probability, its proposals are generally going to be states with much lower probability (since almost every state it very low probability in this model). Thus, it is going to tend to get stuck in place and rarely sample new states. In contrast, every accepted sample in rejection sampling is likely to be unique. This can be demonstrated with the following code

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

var postr = Infer({method: 'rejection', samples: 1000}, model);
var postm = Infer({method: 'MCMC', samples: 1000}, model);
print("Rejection sampling:")
print("Distinct locations sampled: " + Object.keys(postr.getDist()).length)
viz.auto(postr);

print("Metropolis-Hastings sampling:")
print("Distinct locations sampled: " + Object.keys(postm.getDist()).length)
viz.auto(postm);
~~~~

![](Figures/inference-process-1.PNG)

Metropolis-Hastings sampling:

![](Figures/inference-process-2.PNG)
 
### b)

Change the *model* to make MH successfully trace the curves. Your solution should result in a graph that clearly traces a heart-shaped figure -- though it need not do quite as well as rejection sampling. Why does this work better?

HINT: is there a way you can sample a single (x,y) pair instead of separately sampling x and then y? You might want to check out the distribution [DiagCovGaussian()](https://webppl.readthedocs.io/en/master/distributions.html#DiagCovGaussian) in the docs. Note that it expects parameters to be [Vectors](https://webppl.readthedocs.io/en/master/functions/tensors.html#Vector) and you can extract elements from vectors with `T.get` (`T` is webppl shorthand for `ad.tensor`: for more information on tensor functions, see [adnn docs](https://github.com/dritchie/adnn/blob/master/ad/README.md#available-ad-primitive-functions)).

#### Solution #1: Find a better proposal distribution

~~~~
// Using multivariate gaussian
var curve = function(x, y) {
  var x2 = x*x;
  var term1 = y - Math.pow(x2, 1/3);
  return x2 + term1*term1 - 1;
};
var xbounds = [-1, 1];
var ybounds = [-1, 1.6];

var xmu = 0.5 * (xbounds[0] + xbounds[1]);
var ymu = 0.5 * (ybounds[0] + ybounds[1]);
var xsigma = 0.5 * (xbounds[1] - xbounds[0]);
var ysigma = 0.5 * (ybounds[1] - ybounds[0]);

var mu = Vector([xmu, ymu]);
var sigma = Vector([xsigma, ysigma]);

var model = function() {
  var xy = sample(DiagCovGaussian({mu: mu, sigma: sigma}));
  var x = T.get(xy, 0);
  var y = T.get(xy, 1);
  var c_xy = curve(x, y);
  condition(Math.abs(c_xy) < 0.01);
  return {x: x, y: y};
};

var post = Infer({method: 'MCMC', samples: 30000}, model);
viz.auto(post);
~~~~

This model *jointly* samples x and y which allows us to better model their dependence. Note that this still requires many, many more samples than does rejection sampling, and provides less accurate results.

![](Figures/inference-process-3.PNG)

Now change the the inference *algorithm* (with the original model) to successfully trace the curves. What parameters did you try, and what worked best?

#### Solution: Use Hamiltonian MCMC

~~~~
// Solution 2: Using HMC
var curve = function(x, y) {
  var x2 = x*x;
  var term1 = y - Math.pow(x2, 1/3);
  return x2 + term1*term1 - 1;
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
  var c_xy = curve(x, y);
  condition(Math.abs(c_xy) < 0.01);
  return {x: x, y: y};
};

var post = Infer({
  method: 'MCMC',
  kernel: { HMC: { stepSize: 0.1, steps: 10 } },
  samples: 10000
}, model);
viz.auto(post);
~~~~

![](Figures/inference-process-4.PNG)

A `stepSize=1` and `steps=10` for HMC gave good results.


## Exercise 2. Properties and pitfalls of Metropolis-Hastings

Consider a very simple function that interpolates between two endpoints. 

Suppose one endpoint is fixed at `-10`, but we have uncertainty over the value of the other endpoint and the interpolation weight between them. By conditioning on the resulting value being close to 0, we can infer what the free variables must have been:

~~~~
var interpolate = function(point1, point2, interpolationWeight) {
  return (point1 * interpolationWeight +
          point2 * (1 - interpolationWeight))
}

var model = function(){
  var point1 = -10;
  var point2 = uniform(-100,100);
  var interpolationWeight = uniform(0,1);
  var pointInMiddle = interpolate(point1, point2, interpolationWeight);
  observe(Gaussian({mu: 0, sigma:0.1}), pointInMiddle)
  return {point2, interpolationWeight, pointInMiddle}
}

var posterior = Infer({
  method: 'MCMC',
  samples: 5000,
  lag: 100,
}, model)

var samples = posterior.samples;
viz(marginalize(posterior, function(x) {return x.pointInMiddle}))

// Store these for future use
editor.put("posterior", posterior)
editor.put("samples", samples)
~~~~

By looking at the marginal distribution of `pointInMiddle`, we can see that `Infer()` successfully finds values of `point2` and `interpolationWeight` that satisfy our condition. 

### a)

Visualize the separate marginal distributions of `point2` and `interpolationWeight`. How would you describe their shapes, compared to the marginal distribution of `pointInMiddle`? 

#### Solution
~~~~
var posterior = editor.get("posterior")
viz(marginalize(posterior, function(x) {return x.point2}))
viz(marginalize(posterior, function(x) {return x.interpolationWeight}))
~~~~

Whereas `pointInMiddle` is peakd around 0. `point2` and `interpolationWeight` appear to be bimodal.

Now visualize the *joint* marginal distribution of point2 and interpolationWeight. What does this tell you about their dependence?

HINT: use the [marginalize](http://docs.webppl.org/en/master/functions/other.html#marginalize) helper to elegantly construct these marginal distributions

#### Solution
~~~~
var posterior = editor.get("posterior")
viz(marginalize(posterior, function(x) {
  return {'point2': x.point2, 'inter': x.interpolationWeight }
  }))
~~~~
Both variables have a close dependence. When `point2` is large then `interploation` weight also needs to increase if we want our model to be close to 0.

### b)

WebPPL also exposes the list of MCMC samples that the density plots above are built from. This is saved in the `samples` variable. Decrease the number of samples to `50` (and the `lag` to 0) and plot `pointInMiddle` as a function of the sample number. Run this several times to get a feel for the shape of this curve. What do you notice? What property of MCMC are you observing?

HINT: this will require some 'data munging' on the array of samples. Some useful functions will be [`map`](http://docs.webppl.org/en/master/functions/arrays.html#map), `_.range()`, and `viz.line` which takes arrays `x` and `y`.

#### Solution
~~~~
var samples = editor.get("samples")
var getPointInMiddleSamples = function(d) {
  return d["value"]["pointInMiddle"]
} 
var samples2 = map(getPointInMiddleSamples, samples)
viz.line(_.range(samples2.length), 
         samples2)
~~~~
The starting point of our chain varies a lot in for the first few example, but then converges. This is because our MCMC chain is initialized randomly.

### c) 

Try re-writing the model to use rejection sampling. Note that you will need to find a way to turn the `observe` statement into a `condition` statement (Hint: See Exercise #1). Is using rejection sampling here a good idea? Why or why not?

### Solution
~~~~
var interpolate = function(point1, point2, interpolationWeight) {
  return (point1 * interpolationWeight +
          point2 * (1 - interpolationWeight))
}

var model = function(){
  var point1 = -10;
  var point2 = uniform(-100,100);
  var interpolationWeight = uniform(0,1);
  var pointInMiddle = interpolate(point1, point2, interpolationWeight);

  condition(Math.abs(pointInMiddle) < 0.01)
  return {point2, interpolationWeight, pointInMiddle}
}

var posterior = Infer({
  method: 'rejection',
  samples: 1000
}, model)
viz(posterior)
~~~~

Rejection sampling doesn't work well here in part because the range of `point2` is very wide [-100, 100]. Since our prior is uniform we are sampling points that are almost always rejected.

### d)

Add `verbose: true` to the list of options when you run `MH`. What is the acceptance rate over time (i.e. what proportion of proposals are actually accepted in the chain?). What about the model puts it at this level? 

### Solution
The acceptance overall is quite low -- on average less than `0.05`. Since MH is generating proposals by sampling from the prior and our prior over `point2` is Uniform over a large range, we are rejecting most of the proposals.

Consider the list of built-in drift kernels [here](https://webppl.readthedocs.io/en/master/driftkernels.html?highlight=drift%20kernel#helpers). Which of these would be appropriate to use in your model in place of the current uniform prior from which `point2` is sampled? After using that kernel in your model, what effect do you observe on the acceptence rate, and why?

## Solution
~~~~
var interpolate = function(point1, point2, interpolationWeight) {
  return (point1 * interpolationWeight +
          point2 * (1 - interpolationWeight))
}

var model = function(){
  var point1 = -10;
  var point2 = uniformDrift({a: -100, b: 100, w: 20});
  var interpolationWeight = uniform(0,1);
  var pointInMiddle = interpolate(point1, point2, interpolationWeight);
  observe(Gaussian({mu: 0, sigma: 0.1}), pointInMiddle)
  return {point2, interpolationWeight, pointInMiddle}
}

var params = {
  method: 'MCMC',
  kernel: 'MH',
  samples: 500,
  verbose: true
}

var posterior = Infer(params, model)
~~~~

Using a drift kernel like uniformDrift means that we will sample proposals from distributions centered at the previous value of our random choice. This produces a random walk that allows MH to more efficiently explore areas of high probability. We notice that the acceptance on average is about an order of magnitude larger!

<!-- ===============
===============
===============

## Exercise 2. Metropolis-Hastings Part 1

Recall our code from the chapter that implements an Metropolis-Hastings markov chain:

```js
var p = 0.7

//the target distribution (not normalized):
//prob = 0 if x condition is violated, otherwise proportional to geometric distribution
var target_dist = function(x){
  return (x < 3 ? 0 : (p * Math.pow((1-p),(x-1))))
}

// the proposal function and distribution,
// here we're equally likely to propose x+1 or x-1.
var proposal_fn = function(x){
  return (flip() ? x - 1 : x + 1)
}
var proposal_dist = function (x1, x2){
  return 0.5
}

// the MH recipe:
var accept = function (x1, x2){
  let p = Math.min(1, (target_dist(x2) * proposal_dist(x2, x1)) / (target_dist(x1) * proposal_dist(x1,x2)))
  return flip(p)
}
var transition = function(x){
  let proposed_x = proposal_fn(x)
  return (accept(x, proposed_x) ? proposed_x : x)
}

//the MCMC loop:
var mcmc = function(state, iterations){
  return ((iterations == 1) ? [state] : mcmc(transition(state), iterations-1).concat(state))
}

var chain = mcmc(3, 10000) // mcmc for conditioned geometric
viz.table(chain)
```

Notice that `chain` is a list of samples, *not* a WebPPL probability distribution object. `viz.table` helpfully compiles a probability distribution for us. However, other functions such as `viz.marginals` will not work, because they require a WebPPL probability distribution object. 

To see the difference, try running `print(chain)` and compare that to the output of running `print(post)` at the end of the code block for Exercise 1.

Edit the code below to derive a WebPPL probability distribution object from `chain`. Prove that this works by running `viz.marginals()` on your distribution.

HINT: The WebPPL function `Infer()` returns a probability distribution object. Can you find a way to use `Infer()` to sample from `chain`, thus returning a probability distribution object?

```js
var p = 0.7

//the target distribution (not normalized):
//prob = 0 if x condition is violated, otherwise proportional to geometric distribution
var target_dist = function(x){
  return (x < 3 ? 0 : (p * Math.pow((1-p),(x-1))))
}

// the proposal function and distribution,
// here we're equally likely to propose x+1 or x-1.
var proposal_fn = function(x){
  return (flip() ? x - 1 : x + 1)
}
var proposal_dist = function (x1, x2){
  return 0.5
}

// the MH recipe:
var accept = function (x1, x2){
  let p = Math.min(1, (target_dist(x2) * proposal_dist(x2, x1)) / (target_dist(x1) * proposal_dist(x1,x2)))
  return flip(p)
}
var transition = function(x){
  let proposed_x = proposal_fn(x)
  return (accept(x, proposed_x) ? proposed_x : x)
}

//the MCMC loop:
var mcmc = function(state, iterations){
  return ((iterations == 1) ? [state] : mcmc(transition(state), iterations-1).concat(state))
}

var chain = mcmc(3, 10000) // mcmc for conditioned geometric

var post = Infer({method: 'forward'}, function(){
  return sample(Categorical({vs: chain}))
})

viz.marginals(post)
```

![](Figures/inference-process-6.PNG)


## Exercise 3. Metropolis-Hastings Part 2

Consider this very simple model that chooses `y` and `w` such that `-10 * w + y * (1 - w)` is as close as possible to `0`:

~~~~
var p = function(x,y,w){
  return Gaussian({mu: 0, sigma:0.1}).score(x*w + y*(1-w))
}

var mymodel = function(){
  var x = -10
  var y = uniform(-100,100)
  var w = dirichlet(Vector([1,1])).data[0]
  factor(p(x,y,w))
  return {y: y, w: w, s: x*w + y*(1-w)}
}

var post = Infer({
  method: 'MCMC',
  samples: 5000,
  lag: 100,
}, mymodel);

viz.marginals(post)
~~~~

By looking at the marginal distribution of `s`, we can see that `Infer()` tends to choose values of `y` and `w` that satisfy our condition. 

### a)

*Try re-writing the model to use rejection sampling. Note that you will need to find a way to turn the `factor` statement into a `condition` statement (Hint: See Exercise #1). Is using rejection sampling here a good idea? Why or why not?*

Here is a version of the code using rejection sampling:

~~~~
var p = function(x,y,w){
  return Math.abs(x*w + y*(1-w)) < .01
}

var mymodel = function(){
  var x = -10
  var y = uniform(-100,100)
  var w = dirichlet(Vector([1,1])).data[0]
  condition(p(x,y,w))
  return {y: y, w: w, s: x*w + y*(1-w)}
}

var post = Infer({
  method: 'rejection',
  samples: 1000,
}, mymodel);

viz.marginals(post)
~~~~

This is a bad idea, though. The problem is that the range of `y` is extremely wide and our prior is uniform. As a result, random samples from the prior are almost always rejected. 

### b)

*Describe a proposal distribution that you could use for Metropolis-Hastings inference for this model. Show that it satisfies the necessary conditions.* 

We'll use a multivariate Gaussian centered on the current state, and with a reasonable-sized sigma. That is, too large of a sigma and proposals will usually be rejected. Too small of a sigma and it will take too long to traverse the stationary distribution.

Showing detailed balance is straightforward: 

$$p(x)\pi(x \rightarrow x') =? \space p(x')\pi(x' \rightarrow x)$$

$$\rightarrow p(x) \min\left(1, \frac{p(x')q(x'\rightarrow x)}{p(x)q(x\rightarrow x')}\right) =? \space p(x') \min\left(1, \frac{p(x)q(x\rightarrow x')}{p(x')q(x'\rightarrow x)}\right)$$

Importantly, the proposal distribution is symmetric for `x` and `x'`, this reduces to

$$\rightarrow p(x) \min\left(1, \frac{p(x')}{p(x)}\right) =? \space p(x') \min\left(1, \frac{p(x)}{p(x')}\right)$$

Suppose that $$p(x) > p(x')$$. This gives us: 

$$p(x) \frac{p(x')}{p(x)}  =? \space p(x') * 1$$

$$\rightarrow p(x') == p(x')$$

which is what we wanted. It is straightforward to show that the equation also holds when $$p(x) \lt p(x')$$ and when $$p(x) == p(x')$$.

### c)

Edit the code below to implement your Metropolis-Hastings recipe. Use `viz.marginals` to show that it reliably chooses values of `y` and `w` that satisfy the condition.

~~~~
var x = -10 // Fix this variable.

// target distribution
var target_dist = function(state){
  var y = state[0]
  var w = state[1]
  return (y < -100 || y > 100 || w < 0 || w > 1) ? 0 :
  Math.exp(Gaussian({mu: 0, sigma:1}).score(x*w + y*(1-w)))
}

// the proposal function and distribution,
var proposal_fn = function(state){
  var y = state[0]
  var w = state[1]
  var aprop = sample(DiagCovGaussian({mu: Vector([y, w]), sigma: Vector([3, .2])}))
  return [aprop.data[0], aprop.data[1]]
}
var proposal_dist = function (state1, state2){
  return Math.exp(DiagCovGaussian({mu: Vector(state1), sigma: Vector([3, .2])}).score(Vector(state2)))
}

// the MH recipe:
var accept = function (state1, state2){
  let p = Math.min(1, (target_dist(state2) * proposal_dist(state2, state1)) 
                   / (target_dist(state1) * proposal_dist(state1,state2)))
  return flip(p)
}
var transition = function(state){
  let proposed_state = proposal_fn(state)
  return (accept(state, proposed_state) ? proposed_state : state)
}

//the MCMC loop:
var mcmc = function(state, iterations){
  var y = state[0]
  var w = state[1]
  var s = x*w + y*(1-w)
  var stateobj = {y: y, w: w, s: s}
  return ((iterations == 1) ? [stateobj] : mcmc(transition(state), iterations-1).concat(stateobj))
}


var chain = mcmc([0,.5], 5000)

var post = Infer({method: 'forward'}, function(){
  return sample(Categorical({vs: chain}))
})

viz.marginals(post)
~~~~

![](Figures/inference-process-5.PNG)

## Exercise 4. Topic models

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
    var topicDist = dirichlet({alpha: alpha})
    mapData({data: doc}, function(word) {
      var z = sample(Discrete({ps: topicDist}))
      var topic = topics[z]
      observe(Categorical({ps: topic, vs: vocabulary}), word)
    })
  })

  return topics
}

var results = Infer({method: 'MCMC', samples: 20000}, model)

//plot expected probability of each word, for each topic:
print("Topic 1:")
viz.bar(vocabulary, map(function(i) {return expectation(results, function(v) {return v[0][i]})}, _.range(vocabulary.length)))
print("Topic 2:")
viz.bar(vocabulary, map(function(i) {return expectation(results, function(v) {return v[1][i]})}, _.range(vocabulary.length)))
~~~~

You should find that one topic loads primarily on "DNA" and "evolution":

![](Figures/inference-process-8.PNG)

Whereas he other loads primarily on "parsing" and "phonology":

![](Figures/inference-process-7.PNG)

Which is which will vary across runs.

### b)

*Run your code from (a) several times. You should see that sometimes Topic 1 favors the words 'DNA' and 'evolution' and Topic 2 favors 'parsing' and 'phonology'. Other times, this is reversed, with Topic 1 favoring 'parsing' and 'phonology' and Topic 2 favoring 'DNA' and 'evolution'. Why is this?*

There is nothing special about the labels "Topic 1" and "Topic 2". It is no more likely for "Topic 1" to be the "biology" topic than for it to be the "linguistics" topic. Sometimes, inference finds one solution. Sometimes, it finds the other.

### c)

*If we ran MCMC on the model in (a) for an infinite amount of time, we would no longer see a distinction between Topic 1 and Topic 2. Why?*

Although any given high-probability sapmle should result in the two topics splitting the vocabulary ("DNA" and "Evolution" in one topic, "parsing" and "phonology" in the other), it is no more likely that Topic 1 should be the "biology" topic than be the "linguistics" topic. So in expectation, everything should wash out. This is called **label degeneracy**.

*Given the answer to that question, why does our model in (a) seem to work*

The probability distribution for this model has two modes (high-probability regions of parameter space): One in which Topic 1 is the "biology" topic and Topic 2 is in the "linguistics" topic, and one in which these are reversed.

Getting from one mode to the other requires a very large change in the parameters. If Metropolis-Hastings is implemented correctly, it is *possible* for the chain to move from one mode to the other, but it is pretty unlikely. Our chain was probably not run long enough to have a reasonable chance of exploring both modes. Instead, it finds one and stays there for the duration. *Which* one it finds is random, which explains (b) above. a -->