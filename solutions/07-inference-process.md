---
layout: exercise
title: Algorithms for Inference - exercises
description: MCMC, etc.
---

## Exercise 1. Sampling Implicit Curves

In the code box below, the `curve` function defines a vaguely heart-shaped curve. Below, we use rejection sampling to sample points along the boundary of the curve.

~~~~
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

var post = Infer({method: 'rejection', samples: 1000}, model);
viz.auto(post);
~~~~

### a) 

*Try using MCMC with the m-h recipe instead of rejection sampling. You'll notice that it does not fare as well as rejection sampling. Why not?*

Once M-H finds a state with reasonable probability, its proposals are generally going to be states with much lower probability (since almost every state it very low probability in this model). Thus, it is going to tend to get stuck in place and rarely sample new states. In contrast, every accepted sample in rejection sampling is likely to be unique. This can be demonstrated with the following code

~~~~
///fold:
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
///

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

*How can you change the model (or the inference algorithm) to make MCMC successfully trace the curves? Note that there are multiple ways to approach this problem. Your solution should result in a graph that clearly traces a heart-shaped figure -- though it need not do quite as well as rejection sampling.*

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

![](Figures/inference-process-3.PNG)

Notice that this still requires many, many more samples than does rejection sampling, and provides less accurate results.

#### Solution #2: Use Hamiltonian MCMC

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

Notice that this still requires many, many more samples than does rejection sampling, and provides less accurate results.


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

Getting from one mode to the other requires a very large change in the parameters. If Metropolis-Hastings is implemented correctly, it is *possible* for the chain to move from one mode to the other, but it is pretty unlikely. Our chain was probably not run long enough to have a reasonable chance of exploring both modes. Instead, it finds one and stays there for the duration. *Which* one it finds is random, which explains (b) above. a