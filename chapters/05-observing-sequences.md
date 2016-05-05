---
layout: chapter
title: Particle Filtering
description: Models with continuous variables, importance sampling, and sequential Monte Carlo.
---


## Models with large state spaces

For many models with large state spaces, enumeration is infeasible, even if we use smart prioritization. This is particularly clear for models with continuous random variables, where the state space is infinite.

Let's look at a few examples.


### Vision

In this example, we are trying to compute the posterior distribution on lines based on a factor that encourages lines which approximately match the target image:

~~~~
var targetImage = Draw(50, 50, true);
loadImage(targetImage, "/assets/img/box.png")
~~~~

Let's look at the samples that enumeration explores first:

~~~~
///fold:
var targetImage = Draw(50, 50, false);
loadImage(targetImage, "/assets/img/box.png")
///

var drawLines = function(drawObj, lines){
  var line = lines[0];
  drawObj.line(line[0], line[1], line[2], line[3]);
  if (lines.length > 1) {
    drawLines(drawObj, lines.slice(1));
  }
}

var makeLines = function(n, lines, prevScore){
  // Add a random line to the set of lines
  var x1 = randomInteger(50);
  var y1 = randomInteger(50);
  var x2 = randomInteger(50);
  var y2 = randomInteger(50);
  var newLines = lines.concat([[x1, y1, x2, y2]]);
  // Compute image from set of lines
  var generatedImage = Draw(50, 50, false);
  drawLines(generatedImage, newLines);
  // Factor prefers images that are close to target image
  var newScore = -targetImage.distance(generatedImage)/1000; // Increase to 10000 to see more diverse samples
  factor(newScore - prevScore);
  generatedImage.destroy();
  // Generate remaining lines (unless done)
  return (n==1) ? newLines : makeLines(n-1, newLines, newScore);
}

var lineDist = EnumerateDepthFirst(
  function(){
    var lines = makeLines(4, [], 0);
    var finalGeneratedImage = Draw(50, 50, true);
	drawLines(finalGeneratedImage, lines);
    return lines;
   }, 10)

print(lineDist)
~~~~

We first explore all images where *all* lines start at the bottom-rightmost pixel, and one of these lines ends a few pixels further up. Looking at the histogram, we see that all of these images are equally bad -- none of the lines overlap with the lines in the target image. This is probably not the ideal exploration strategy for a state space that contains more than a trillion possible program executions.


### Gaussian random walk

Gaussian random walk models are used, for example, to model financial time series data. Here we show a two-dimensional random walk:

~~~~
///fold:
var drawLines = function(canvas, start, positions){
  if (positions.length == 0) { return []; }
  var next = positions[0];
  canvas.line(start[0], start[1], next[0], next[1], 4, 0.2);
  drawLines(canvas, next, positions.slice(1));
}

var last = function(xs){
  return xs[xs.length - 1];
}
///

var init = function(dim){
  return repeat(dim, function(){ return gaussian(200, 1) });
}

var transition = function(pos){
  return map(
    function(x){ return gaussian(x, 10); },
    pos
  );
};

var gaussianRandomWalk = function(n, dim) {
  var prevStates = (n==1) ? [init(dim)] : gaussianRandomWalk(n-1, dim);
  var newState = transition(last(prevStates));
  return prevStates.concat([newState]);
};

var positions = gaussianRandomWalk(100, 2);


// Draw model output

var canvas = Draw(400, 400, true)
drawLines(canvas, positions[0], positions.slice(1))
~~~~

### Semi-Markov random walk

For many systems, the Markov assumption -- each point only depends on the previous point -- does not quite hold. In such cases, we can introduce dependence on multiple previous time steps. For example, the model below uses a momentum term that depends on the last two time steps:

~~~~
///fold:
var drawLines = function(canvas, start, positions){
  if (positions.length == 0) { return []; }
  var next = positions[0];
  canvas.line(start[0], start[1], next[0], next[1], 4, 0.2);
  drawLines(canvas, next, positions.slice(1));
}
///

var init = function(dim){
  return repeat(dim, function(){ return gaussian(200, 1) });
}

var transition = function(lastPos, secondLastPos){
  return map2(
    function(lastX, secondLastX){
      var momentum = (lastX - secondLastX) * .7;
      return gaussian(lastX + momentum, 3);
    },
	lastPos,
    secondLastPos
  );
};

var semiMarkovWalk = function(n, dim) {
  var prevStates = (n==2) ? [init(dim), init(dim)] : semiMarkovWalk(n-1, dim);
  var newState = transition(last(prevStates), secondLast(prevStates));
  return prevStates.concat([newState]);
};

var positions = semiMarkovWalk(80, 2);


// Draw model output

var canvas = Draw(400, 400, true)
drawLines(canvas, positions[0], positions.slice(1))
~~~~

### Hidden Semi-Markov model

We have already encountered Hidden Markov models in [Chapter 4](/chapters/04-factorseq.html). There, the latent state was unobserved and we only got to observe a stochastic function of the latent state at each time step. We can apply the same principle to semi-Markov models. The model below could be used (for example) to model radar observations of the flight path of a plane.

~~~~
///fold:
var drawLines = function(canvas, start, positions){
  if (positions.length == 0) { return []; }
  var next = positions[0];
  canvas.line(start[0], start[1], next[0], next[1], 4, 0.2);
  drawLines(canvas, next, positions.slice(1));
}

var canvas = Draw(400, 400, true)
///

var init = function(dim){
  return repeat(dim, function(){ return gaussian(200, 1) });
}

var observe = function(pos){
  return map(
    function(x){ return gaussian(x, 5); },
	pos
  );
};

var transition = function(lastPos, secondLastPos){
  return map2(
    function(lastX, secondLastX){
      var momentum = (lastX - secondLastX) * .7;
      return gaussian(lastX + momentum, 3);
    },
	lastPos,
    secondLastPos
  );
};

var semiMarkovWalk = function(n, dim) {
  var prevStates = (n==2) ? [init(dim), init(dim)] : semiMarkovWalk(n-1, dim);
  var newState = transition(last(prevStates), secondLast(prevStates));
  var newObservation = observe(newState);
  canvas.circle(newObservation[0], newObservation[1], 2, "red", "white");
  return prevStates.concat([newState]);
};

semiMarkovWalk(80, 2);

print("done")
~~~~

### Gaussian mixture

How else could we model points observed in a two-dimensional space? We could posit that there are two clusters around which the points tend to center:

~~~~
///fold:
var drawPoints = function(canvas, points){
  if (points.length > 0) {
    var next = points[0];
    canvas.circle(next[0], next[1], 2, "black", "white");
    drawPoints(canvas, points.slice(1));
  }
}
///

var makeGaussian = function(dim){
  var means = repeat(dim, function(){uniform(20, 380)});
  var stds = repeat(dim, function(){uniform(5, 50)});
  return function(){
    return map2(gaussian, means, stds);
  }
}

var mixtureWeight = uniform(0, 1);
var gaussian1 = makeGaussian(2);
var gaussian2 = makeGaussian(2);

var gaussianMixture = function(){
  if (flip(mixtureWeight)) {
    return gaussian1();
  } else {
    return gaussian2();
  }
}

var points = repeat(100, gaussianMixture);


// Draw model output

var canvas = Draw(400, 400, true);
drawPoints(canvas, points)
~~~~


## Likelihood weighting

How can we estimate marginal distributions for models such as the ones above?

If there is a large number of execution paths, clearly, we cannot explore all paths individually. This leaves two possibilities: either we reason about paths more abstractly, or we explore only a subset of paths. In these notes, we focus on the second possibility[^1].

[^1]: Dynamic Programming (caching) can be viewed as an instance of reasoning about many concrete paths at once.

Previously, we have enumerated paths using depth-first search, breadth-first search, and a probability-based priority queue. However, this approach can result in an unrepresentative set of paths for models with large state spaces, and for uncountably infinite state spaces it isn't even clear what exactly we are enumerating.

Random sampling is a promising alternative: if we could sample paths in proportion to their posterior probability -- i.e. taking into account factor weights -- we could easily get a representative picture of the marginal distribution.

Let's go back to the HMM and think about how we could make this work.

Here is a simple HMM with binary states and observations:

~~~~
var hmm = function(states, observations){
  var prevState = states[states.length - 1];
  var state = sample(bernoulliERP, [prevState ? .9 : .1]);
  factor((state == observations[0]) ? 0 : -2);
  if (observations.length == 0) {
    return states;
  } else {
    return hmm(states.concat([state]), observations.slice(1));
  }
}

var observations = [true, true, true, true];
var startState = false;

print(Enumerate(
  function(){
    return hmm([startState], observations)
  }
))
~~~~

This HMM prefers subsequent states to be similar, and it prefers observations to be similar to the latent state. By far the most likely explanation for the observations `[true, true, true, true]` is that most of the latent states are `true` as well.

As in [lecture 3](/chapters/03-enumeration.html), we are going to think about exploring the computation paths of this model. For this purpose, it will be helpful to have the HMM available in continuation-passing style:

~~~~
// language: javascript

var cpsHmm = function(k, states, observations){
  var prevState = states[states.length - 1];
  _sample(
    function(state){
      _factor(
        function(){
          if (observations.length == 0) {
            return k(states);
          } else {
            return cpsHmm(k, states.concat([state]), observations.slice(1));
          }
        },
        (state == observations[0]) ? 0 : -1);
    },
    bernoulliERP,
    [prevState ? .9 : .1]);
}

var runCpsHmm = function(k){
  var observations = [true, true, true, true];
  var startState = false;
  return cpsHmm(k, [startState], observations);
}
~~~~

We use `_sample` and `_factor` so that we can redefine these functions without overwriting the WebPPL `sample` and `factor` functions. For now, we define sample to simply sample according to the random primitive's distribution, and factor to do nothing:

~~~~
// language: javascript

var _factor = function(k, score){
  k(undefined);
}

var _sample = function(k, erp, params){
  return sample({}, k, "addr", erp, params);
}
~~~~

If we run the HMM with these sample and factor functions, we see that we sample latent states that reflect the prior distribution of the HMM, but not the posterior distribution that takes into account observations using factors:

~~~~
// language: javascript

///fold:
var cpsHmm = function(k, states, observations){
  var prevState = states[states.length - 1];
  _sample(
    function(state){
      _factor(
        function(){
          if (observations.length == 0) {
            return k(states);
          } else {
            return cpsHmm(k, states.concat([state]), observations.slice(1));
          }
        },
        (state == observations[0]) ? 0 : -1);
    },
    bernoulliERP,
    [prevState ? .9 : .1]);
}

var runCpsHmm = function(k){
  var observations = [true, true, true, true];
  var startState = false;
  return cpsHmm(k, [startState], observations);
}

var _factor = function(k, score){
  k(undefined);
}

var _sample = function(k, erp, params){
  return sample({}, function(s, v){k(v)}, "addr", erp, params);
}
///

runCpsHmm(jsPrint);
~~~~

Let's write some scaffolding so that we can more easily take multiple samples from the prior, that is, without taking into account factors:

~~~~
// language: javascript

///fold:
var cpsHmm = function(k, states, observations){
  var prevState = states[states.length - 1];
  _sample(
    function(state){
      _factor(
        function(){
          if (observations.length == 0) {
            return k(states);
          } else {
            return cpsHmm(k, states.concat([state]), observations.slice(1));
          }
        },
        (state == observations[0]) ? 0 : -1);
    },
    bernoulliERP,
    [prevState ? .9 : .1]);
}

var runCpsHmm = function(k){
  var observations = [true, true, true, true];
  var startState = false;
  return cpsHmm(k, [startState], observations);
}

var _factor = function(k, score){
  k(undefined);
}

var _sample = function(k, erp, params){
  return sample({}, function(s, v){k(v)}, "addr", erp, params);
}
///

var startCpsComp;
var samples = [];
var sampleIndex = 0;


var priorExit = function(value){

  // Store sampled value
  samples[sampleIndex].value = value;

  if (sampleIndex < samples.length-1){
    // If samples left, restart computation for next sample
    sampleIndex += 1;
    return startCpsComp(priorExit);
  } else {
    // Print all samples
    samples.forEach(jsPrint);
  }
};


var PriorSampler = function(cpsComp, numSamples){

  // Create placeholders for samples
  for (var i=0; i<numSamples; i++) {
    var sample = {
      index: i,
      value: undefined
    };
    samples.push(sample);
  }

  // Run computation from beginning
  startCpsComp = cpsComp;
  startCpsComp(priorExit);
}


PriorSampler(runCpsHmm, 10);
~~~~

The factors tell us that we should be sampling some paths more often, and some paths less often. If we knew the total factor weight for each path, we could determine from the weights which paths we "oversampled" and which paths we "undersampled".

Let's accumulate the factor weights with each sample:

~~~~
// language: javascript

///fold:
var cpsHmm = function(k, states, observations){
  var prevState = states[states.length - 1];
  _sample(
    function(state){
      _factor(
        function(){
          if (observations.length == 0) {
            return k(states);
          } else {
            return cpsHmm(k, states.concat([state]), observations.slice(1));
          }
        },
        (state == observations[0]) ? 0 : -1);
    },
    bernoulliERP,
    [prevState ? .9 : .1]);
}

var runCpsHmm = function(k){
  var observations = [true, true, true, true];
  var startState = false;
  return cpsHmm(k, [startState], observations);
}

var _sample = function(k, erp, params){
  return sample({}, function(s, v){k(v)}, "addr", erp, params);
}
///

var startCpsComp;
var samples = [];
var sampleIndex = 0;

var _factor = function(k, score){
  samples[sampleIndex].score += score; // NEW
  k(undefined);
}

var lwExit = function(value){

  // Store sampled value
  samples[sampleIndex].value = value;

  if (sampleIndex < samples.length-1){
    // If samples left, restart computation for next sample
    sampleIndex += 1;
    return startCpsComp(lwExit);
  } else {
    // Print all samples
    samples.forEach(jsPrint);
  }
};

var LikelihoodWeighting = function(cpsComp, numSamples){

  // Create placeholders for samples
  for (var i=0; i<numSamples; i++) {
    var sample = {
      index: i,
      value: undefined,
      score: 0 // NEW
    };
    samples.push(sample);
  }

  // Run computation from beginning
  startCpsComp = cpsComp;
  startCpsComp(lwExit);
}

LikelihoodWeighting(runCpsHmm, 10);
~~~~

Looking at the results, the paths that we oversampled the most -- the paths with the lowest weights -- are paths that result in value `[false,false,false,false,false]`. This makes sense: this execution is very likely under the prior, but for our observations `[true, true, true, true]`, it is not a good explanation.

At this point, we can already use our weighted samples to estimate properties of the marginal distribution. This is called [importance sampling](http://en.wikipedia.org/wiki/Importance_sampling) in general, and likelihood weighting in the case where the importance distribution is the prior.


## Resampling

What if we simply want samples, not weighted samples? We can always turn a set of weighted samples into a set of unweighted samples by resampling (with replacement) from the set in proportion to the weights:

~~~~
// language: javascript

var resample = function(samples){
  var weights = samples.map(
    function(sample){return Math.exp(sample.score);});
  var newSamples = [];
  for (var i=0; i<samples.length; i++){
    var j = multinomialSample(weights);
    newSamples.push(samples[j]);
  }
  return newSamples;
}
~~~~

The only change to the algorithm is a resampling step at the end:

~~~~
// language: javascript

///fold:
var cpsHmm = function(k, states, observations){
  var prevState = states[states.length - 1];
  _sample(
    function(state){
      _factor(
        function(){
          if (observations.length == 0) {
            return k(states);
          } else {
            return cpsHmm(k, states.concat([state]), observations.slice(1));
          }
        },
        (state == observations[0]) ? 0 : -1);
    },
    bernoulliERP,
    [prevState ? .9 : .1]);
}

var runCpsHmm = function(k){
  var observations = [true, true, true, true];
  var startState = false;
  return cpsHmm(k, [startState], observations);
}

var _sample = function(k, erp, params){
  return sample({}, function(s, v){k(v)}, "addr", erp, params);
}

var _factor = function(k, score){
  samples[sampleIndex].score += score; // NEW
  k(undefined);
}

var resample = function(samples){
  var weights = samples.map(
    function(sample){return Math.exp(sample.score);});
  var newSamples = [];
  for (var i=0; i<samples.length; i++){
    var j = multinomialSample(weights);
    newSamples.push(samples[j]);
  }
  return newSamples;
}
///

var startCpsComp = undefined;
var samples = [];
var sampleIndex = 0;

var lwrExit = function(value){

  // Store sampled value
  samples[sampleIndex].value = value;

  if (sampleIndex < samples.length-1){
    // If samples left, restart computation for next sample
    sampleIndex += 1;
    return startCpsComp(lwrExit);
  } else {
    samples = resample(samples); // NEW
    // Print all samples
    samples.forEach(jsPrint);
  }
};

var LikelihoodWeightingResampled = function(cpsComp, numSamples){

  // Create placeholders for samples
  for (var i=0; i<numSamples; i++) {
    var sample = {
      index: i,
      value: undefined,
      score: 0
    };
    samples.push(sample);
  }

  // Run computation from beginning
  startCpsComp = cpsComp;
  startCpsComp(lwrExit);
}


LikelihoodWeightingResampled(runCpsHmm, 10);
~~~~

As we increase the number of samples, the samples get closer to true posterior samples. In particular, the most common sampled latent state is `[false,true,true,true,true]`, which is the best explanation for starting state `false` and subsequent observations `[true,true,true,true]`.


## Particle filters

How can we improve upon likelihood weighting? Let's apply the idea from the lecture on [Early, incremental evidence](/chapters/04-factorseq.html): instead of waiting until the end to resample, we could resample earlier. In particular, we can resample at each factor.

This requires a slight change in our approach. Previously, we ran each sample until the end before we started the next one. Now, we want to run each sample until we hit the first factor statement; resample; run each sample up to the next factor statement; resample; and so on.

To enable this, we store the continuation for each sample so that we can resume computation at the correct point. We are also going to refer to (potentially incomplete) samples as "particles".

~~~~
// language: javascript

///fold:
var _sample = function(k, erp, params){
  return sample({}, function(s, v){k(v)}, "addr", erp, params);
}

var copySample = function(s){
  return {
    value: s.value,
    score: 0,
    continuation: s.continuation
  }
}

var resample = function(samples){
  var weights = samples.map(
    function(sample){return Math.exp(sample.score);});
  var newSamples = [];
  for (var i=0; i<samples.length; i++){
    var j = multinomialSample(weights);
    newSamples.push(copySample(samples[j]));
  }
  return newSamples;
}

var cpsHmm = function(k, states, observations){
  var prevState = states[states.length - 1];
  _sample(
    function(state){
      _factor(
        function(){
          if (observations.length == 0) {
            return k(states);
          } else {
            return cpsHmm(k, states.concat([state]), observations.slice(1));
          }
        },
        (state == observations[0]) ? 0 : -1);
    },
    bernoulliERP,
    [prevState ? .9 : .1]);
}

var runCpsHmm = function(k){
  var observations = [true, true, true, true];
  var startState = false;
  return cpsHmm(k, [startState], observations);
}
///


var samples = [];
var sampleIndex = 0;


var _factor = function(k, score){
  samples[sampleIndex].score += score;
  samples[sampleIndex].continuation = k; // NEW

  if (sampleIndex < samples.length-1){
    sampleIndex += 1;
  } else {
    samples = resample(samples);
    sampleIndex = 0;
  }

  samples[sampleIndex].continuation();
}


var pfExit = function(value){

  // Store sampled value
  samples[sampleIndex].value = value;

  if (sampleIndex < samples.length-1){
    // If samples unfinished, resume computation for next sample
    sampleIndex += 1;
    samples[sampleIndex].continuation(); // NEW
  } else {
    samples.forEach(jsPrint);
  }
};


var SimpleParticleFilter = function(cpsComp, numSamples){

  // Create placeholders for samples
  for (var i=0; i<numSamples; i++) {
    var sample = {
      value: undefined,
      score: 0,
      continuation: function(){cpsComp(pfExit)} // NEW
    };
    samples.push(sample);
  }

  // Run computation from beginning
  samples[sampleIndex].continuation();
};


SimpleParticleFilter(runCpsHmm, 20);
~~~~


## A particle filter for the semi-Markov random walk

As before, we are going to generate observations by running a Hidden semi-Markov model:

~~~~
///fold:
var drawLines = function(canvas, start, positions){
  if (positions.length == 0) { return []; }
  var next = positions[0];
  canvas.line(start[0], start[1], next[0], next[1], 4, 0.2);
  drawLines(canvas, next, positions.slice(1));
}

var drawPoints = function(canvas, positions){
  if (positions.length == 0) { return []; }
  var next = positions[0];
  canvas.circle(next[0], next[1], 2, "red", "white");
  drawPoints(canvas, positions.slice(1));
}

var observe = function(pos){
  return map(
    function(x){ return gaussian(x, 5); },
	pos
  );
};

var init = function(dim){
  var state1 = repeat(dim, function(){ return gaussian(200, 1) });
  var state2 = repeat(dim, function(){ return gaussian(200, 1) });
  var states = [state1, state2];
  var observations = map(observe, states);
  return {
    states: states,
    observations: observations
  }
}

var transition = function(lastPos, secondLastPos){
  return map2(
    function(lastX, secondLastX){
      var momentum = (lastX - secondLastX) * .7;
      return gaussian(lastX + momentum, 3);
    },
	lastPos,
    secondLastPos
  );
};

var semiMarkovWalk = function(n, dim) {
  var prevData = (n == 2) ? init(dim) : semiMarkovWalk(n-1, dim);
  var prevStates = prevData.states;
  var prevObservations = prevData.observations;
  var newState = transition(last(prevStates), secondLast(prevStates));
  var newObservation = observe(newState);
  return {
    states: prevStates.concat([newState]),
    observations: prevObservations.concat([newObservation])
  }
};
///

var trueData = semiMarkovWalk(70, 2);
var canvas = Draw(400, 400, true)
drawPoints(canvas, trueData.observations)
~~~~

Now let's infer the latent walk underneath:

~~~~
///fold:
var drawLines = function(canvas, start, positions){
  if (positions.length == 0) { return []; }
  var next = positions[0];
  canvas.line(start[0], start[1], next[0], next[1], 4, 0.2);
  drawLines(canvas, next, positions.slice(1));
}

var drawPoints = function(canvas, positions){
  if (positions.length == 0) { return []; }
  var next = positions[0];
  canvas.circle(next[0], next[1], 2, "red", "white");
  drawPoints(canvas, positions.slice(1));
}

var observe = function(pos){
  return map(
    function(x){ return gaussian(x, 5); },
	pos
  );
};

var init = function(dim){
  var state1 = repeat(dim, function(){ return gaussian(200, 1) });
  var state2 = repeat(dim, function(){ return gaussian(200, 1) });
  var states = [state1, state2];
  var observations = map(observe, states);
  return {
    states: states,
    observations: observations
  }
}

var semiMarkovWalk = function(n, dim) {
  var prevData = (n == 2) ? init(dim) : semiMarkovWalk(n-1, dim);
  var prevStates = prevData.states;
  var prevObservations = prevData.observations;
  var newState = transition(last(prevStates), secondLast(prevStates));
  var newObservation = observe(newState);
  return {
    states: prevStates.concat([newState]),
    observations: prevObservations.concat([newObservation])
  }
};
///

var transition = function(lastPos, secondLastPos){
  return map2(
    function(lastX, secondLastX){
      var momentum = (lastX - secondLastX) * .7;
      return gaussian(lastX + momentum, 3);
    },
	lastPos,
    secondLastPos
  );
};


var observeConstrained = function(pos, trueObs){
  return map2(
    function(x, obs){ return factor(gaussianERP.score([x, 5], obs)); },    
	pos,
    trueObs
  );
};

var initConstrained = function(dim, trueObs){
  var state1 = repeat(dim, function(){ return gaussian(200, 1) });
  var obs1 = observeConstrained(state1, trueObs[0]);
  var state2 = repeat(dim, function(){ return gaussian(200, 1) });
  var obs2 = observeConstrained(state2, trueObs[1]);
  return {
    states: [state1, state2],
    observations: [obs1, obs2]
  }
}

var semiMarkovWalkConstrained = function(n, dim, trueObs) {
  var prevData = (
    (n == 2) ?
    initConstrained(dim, trueObs.slice(0, 2)) :
    semiMarkovWalkConstrained(n-1, dim, trueObs.slice(0, trueObs.length-1)));
  var prevStates = prevData.states;
  var prevObservations = prevData.observations;
  var newState = transition(last(prevStates), secondLast(prevStates));
  var newObservation = observeConstrained(newState, trueObs[trueObs.length-1]);
  return {
    states: prevStates.concat([newState]),
    observations: prevObservations.concat([newObservation])
  }
};


// Run model using particle filter

var numSteps = 80;
var trueObservations = semiMarkovWalk(numSteps, 2).observations;

var posteriorSampler = ParticleFilter(
  function(){
    return semiMarkovWalkConstrained(numSteps, 2, trueObservations);
  },
  10) // Try reducing the number of samples to 1!

var inferredStates = sample(posteriorSampler).states;


// Draw model output

var canvas = Draw(400, 400, true)
drawPoints(canvas, trueObservations)
drawLines(canvas, inferredStates[0], inferredStates.slice(1))
~~~~

### Particle filter for vision

See the [vision page](/examples/vision.html). Note the "incremental heuristic factors" pattern that we saw in the previous chapter.

Next chapter: [Markov Chain Monte Carlo](/chapters/06-mcmc.html)

<!-- ## Extension: Residual resampling -->
