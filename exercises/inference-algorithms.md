---
layout: exercise
title: Algorithms for Inference - exercises
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

Try using MCMC with the MH recipe instead of rejection sampling. You'll notice that it does not fare as well as rejection sampling. Why not?

### b)

How can you change the model to make MH successfully trace the curves? Your solution should result in a graph that clearly traces a heart-shaped figure -- though it need not do quite as well as rejection sampling.

### c)

How can you instead change the the inference algorithm (instead of the model) to successfully trace the curves? Explore different algorithms!


## Exercise 2. Metropolis-Hastings Part 1

Recall our code from the chapter that implements an Metropolis-Hastings markov chain:

~~~~
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
~~~~

Notice that `chain` is a list of samples, *not* a WebPPL probability distribution object. `viz.table` helpfully compiles a probability distribution for us. However, other functions such as `viz.marginals` will not work, because they require a WebPPL probability distribution object. 

To see the difference, try running `print(chain)` and compare that to the output of running `print(post)` at the end of the code block for Exercise 1.

Edit the code below to derive a WebPPL probability distribution object from `chain`. HINT: The WebPPL function `Infer()` returns a probability distribution object. Can you find a way to use `Infer()` to sample from `chain`, thus returning a probability distribution object?

~~~~
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
~~~~

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

Try re-writing the model to use rejection sampling. Note that you will need to find a way to turn the `factor` statement into a `condition` statement (Hint: See Exercise #1). Is using rejection sampling here a good idea? Why or why not?

### b)

Describe a proposal distribution that you could use for Metropolis-Hastings inference for this model. Show that it satisfies the necessary conditions. 

### c)

Edit the code below to implement your Metropolis-Hastings recipe. Use `viz.marginals` to show that it reliably chooses values of `y` and `w` that satisfy the condition.

Hint 1: Check out possible [WebPPL distributions](https://webppl.readthedocs.io/en/master/distributions.html) you might use. 

Hint 2: Many WebPPL distributions require vectors as input. Turn an array into a vector with the function `Vector()` (e.g., `Vector([x, y])`).

Hint 3: Remember that `dist.score(x)` returns the log probability (density) of `x` given distribution `dist`. To turn that into a a probability, use `Math.exp()`. 

~~~~
var x = -10 // Fix this variable.

// target distribution
var target_dist = function(state){
  var y = state[0]
  var w = state[1]
  return // your code here.
         // remember if y or w are outside their bounds, probability = 0
}

// the proposal function and distribution,
var proposal_fn = function(state){
  var y = state[0]
  var w = state[1]
  var aprop = // your code here
  return [aprop.data[0], aprop.data[1]]
}
var proposal_dist = function (state1, state2){
  return // your code here
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


var chain = mcmc([0,.5], 5000) // go ahead and use this starting value

var post = // your code here (use answer from Exercise #2)
viz.marginals(post)
~~~~


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
