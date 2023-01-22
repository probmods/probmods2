---
layout: exercise
title: Bayesian Data Analysis - solutions
custom_js:
- assets/js/towData.js
- assets/js/towConfigurations.js
---

## Exercise 1: Experimenting with priors and predictives

### a)

> Try different beta priors on `p`, by changing `priorDist = Uniform(...)` to `p = Beta({a: 10,b: 10})`, `Beta({a: 1, b: 5})` and `Beta({a: 0.1, b: 0.1})`.
> (Note that `beta(1,1)` is mathematically the same as `uniform(0,1)`.)
> Use the figures produced to describe the assumptions these priors capture, and how they interact with the same data to produce posterior inferences and predictions. 

`a` can intuitively be thought of as the number of tails flips we've seen before, and `b` as the number of heads flips. If `a` is greater than `b`, the distribution will be skewed to the left. If those numbers are less than `1`, we have strong intuitions against 50-50.

### b)

> In the current simple binomial setting, for example, predictive distributions could be found by an experiment that is different because it has `n' != n` observations.
> Change the model to implement an example of this.

~~~~
// observed data
var k = 1 // number of successes
var n = 20  // number of attempts
var new_n = 5 // number of attempts in the followup experiment
var priorDist = Beta({a: 1, b: 1});

var model = function() {
   var p = sample(priorDist);

   // Observed k number of successes, assuming a binomial
   observe(Binomial({p : p, n: n}), k);

   // sample from binomial with updated p
   var posteriorPredictive = binomial(p, new_n);

   // sample fresh p (for visualization)
   var prior_p = sample(priorDist);
   // sample from binomial with fresh p (for visualization)
   var priorPredictive = binomial(prior_p, n);

   return {
       prior: prior_p, priorPredictive : priorPredictive,
       posterior : p, posteriorPredictive : posteriorPredictive
    };
}

var opts = {method: "MCMC", samples: 2500, lag: 50};
var posterior = Infer(opts, model);

viz.marginals(posterior)
~~~~

## Exercise 2: Parameter fitting vs. Parameter integration

~~~~
// Prior on task difficulty is uniform on [0, ..., 0.9], with a spike on 0.9
var sampleTaskDifficulty = function() {
  return flip() ? .9 : randomInteger(10) / 10;
};

// Compute posterior after seeing one subject perform well on the task 
var taskDifficultyPosterior = Infer({method: 'enumerate'}, function(){
  var taskDifficulty = sampleTaskDifficulty();

  // subject will perform well if the task is not too difficult
  var subjectPerformsWell = !flip(taskDifficulty)

  // observe that they perform well (i.e. this value is true)
  condition(subjectPerformsWell)
  return taskDifficulty;
})

// Most likely task-difficulty is still .9
taskDifficultyPosterior.MAP().val

// But a lot of probability mass is on lower values
viz.hist(taskDifficultyPosterior, {numBins: 9})

// Indeed, the expected subject ability is around .4
expectation(taskDifficultyPosterior)
~~~~

### a)

> Would you proceed with more data collection or would you change your paradigm?
How did you come to this conclusion?

*Note:* This is subjective. Justify your answer.

Personally, I'm leaning towards going for it.
If this participant did well, probably other participants won't do too badly.
Depends on the relative costs of tweaking the experiment, having a task that's too difficult or too easy, and doing data collection.

### b)

> The traditional approach is the value (or "point-wise estimate") approach: take the value that corresponds to the best fit (e.g., by using least-squares or maximum-likelihood estimation; here, you would have taken the Maximum A Posteriori (or, MAP) estimate, which would be 0.9).
> Why might this not be a good idea?
> Provide two answers.
> One that applies to the data collection situation above, and one that applies to the metaphor of model or theory evaluation.

* The MAP is only 0.9 because of our strong prior beliefs.
* The second most likely value is the complete opposite.


## Exercise 3: BDA of Bayesian Cognitive Models

> We saw in this chapter how to analyze our models of cognition by using Bayesian statistical techniques.
> Compare and contrast the results of our cognitive model of tug-of-war with our regression models.
> Some questions to ponder:
> 
> * What phenomena in the data was it better able to capture?

Explaining away Alice's strength if Bob and Alice win on a team together, but then Bob also wins on his own.

> * What, if anything, did it fail to capture?

Teamwork, excitement or nervousness due to a winning streak, intimidation or loafing (e.g. being lazy because you think it wouldn't make a difference anyway)

> * Are there other aspects of the model you could 'lift' into the Bayesian Data Analysis (i.e. fixed parameters that you could put a prior on and include in your joint inference)?

Lazy pulling isn't obviously a factor of 1/2. We could put a prior on that and fit to people's responses about strengths.

> * How does WebPPL expose commonalities between these two models?

Both are models, both infer parameters of the model, both set priors on the model parameters and update the parameters based on the observations.

## Exercise 4


~~~~
///fold:

// alternative proposal distribution for metropolis-hastings algorithm
var uniformKernel = function(prevVal) {
  return Uniform({a: prevVal - 0.2, b: prevVal + 0.2});
};

var toProbs = function(predictions) {
  return _.object(map(function(i) {return "predictive: cond" + i + " P(true)";}, _.range(1, predictions.length + 1)),
                  map(function(model) {return Math.exp(model.score(true))}, predictions))
}

var dataSummary = function(data) {
  return map(function(condData) {
    return filter(function(d) {return d}, condData).length/11
  }, data)
};

var predictiveSummary = function(model) {
  var labels = map(function(i) {return "predictive: cond" + i + " P(true)"}, _.range(1, 6));
  return map(function(label) {
    return expectation(model, function(s) {
      return s[label]
    });
  }, labels);
};
///

// 5 experiment conditions / stimuli
var possibleEvidenceStream = [
  [['A']],
  [['A', 'B']],
  [['A', 'B'], ['B']],
  [['A', 'B'], ['A', 'B']],
  [[]]
];

// for each condition.
// note: always the question "is A a blicket?"
var data = [
  repeat(10, function(){return true}).concat(false),
  repeat(6 , function(){return true}).concat(repeat(5, function(){return false})),
  repeat(4, function(){return true}).concat(repeat(7, function(){return false})),
  repeat(8, function(){return true}).concat(repeat(3, function(){return false})),
  repeat(2, function(){return true}).concat(repeat(9, function(){return false}))
];

// Same model as above, but parameterized
var detectingBlickets = mem(function(evidence, params) {
  return Infer({method: 'enumerate'}, function() {
    var blicket = mem(function(block) {return flip(params.blicketBaseRate)})
    var power = function(block) {return blicket(block) ? params.blicketPower : params.nonBlicketPower}
    var machine = function(blocks) {
      return (blocks.length == 0 ?
              flip(params.machineSpontaneouslyGoesOff) :
              flip(power(first(blocks))) || machine(rest(blocks)))
    }
    map(function(blocks){condition(machine(blocks))}, evidence)
    return blicket('A')
  })
})

var dataAnalysis = Infer({method: 'MCMC', samples: 5000, callbacks: [editor.MCMCProgress()]}, function() {
  var params = {
    blicketBaseRate: sample(Uniform({a: 0, b: 1}), {driftKernel: uniformKernel}),
    blicketPower: sample(Uniform({a: 0, b: 1}), {driftKernel: uniformKernel}),
    nonBlicketPower: sample(Uniform({a: 0, b: 1}), {driftKernel: uniformKernel}),
    machineSpontaneouslyGoesOff: sample(Uniform({a: 0, b: 1}), {driftKernel: uniformKernel})
  }

  var cognitiveModelPredictions = map(function(evidence) {
    return detectingBlickets(evidence,params);
  }, possibleEvidenceStream);

  // observe each data point under the model's predictions
  map2(function(dataForStim, modelPosterior) {
    map(function(dataPoint) {
      observe(modelPosterior, dataPoint);
    }, dataForStim)
  }, data, cognitiveModelPredictions)
  
  var predictives = toProbs(cognitiveModelPredictions)
  return _.extend(params, predictives)
})

viz.marginals(dataAnalysis);
viz.scatter(predictiveSummary(dataAnalysis), dataSummary(data),
            {xLabel: 'model', yLabel: 'data'})
~~~~


### a)

> What are the parameters of this model? In the plainest English you can muster, interpret the current values of the parameters. What do they mean?

`blicketBaseRate`             | 0.4  | blickets are common, but not *that* common
`blicketPower`                | 0.9  | blickets rarely fail to be detected
`nonBlicketPower`             | 0.05 | very occasionally, we get false blicket detections
`machineSpontaneouslyGoesOff` | 0.05 | very oaccasionally, the detector just goes offf


### b)

> What does the `Infer` statement in `dataAnalysis` return?

Fitting to the data, what are the likely params and predictions?

> What does the `Infer` statement in `detectingBlickets` return? Why are there two queries in this program?

The cognitive model involves an inference of what people will say given the evidence they see.

### c)

`blicketBaseRate` | blickets are common, but not *that* common
`blicketPower`    | blickets rarely fail to set off the detector
`nonBlicketPower` | non-blickets *occasionally* might set off the detector
`machineSpontaneouslyGoesOff` | *occasionally* the detector might just go off for no reason
`predictive: cond1 P(true)` | `A` is probably a blicket...
`predictive: cond2 P(true)` | `A` is slightly more likely to be a blicket
`predictive: cond3 P(true)` | no idea if `A` is a blicket
`predictive: cond4 P(true)` | `A` is more likely than not a blicket...
`predictive: cond5 P(true)` | `A` is probably not a blicket...?
model (`x`) vs. data (`y`) | We can accurately guess people's response from model, but they're not exactly 1-1

### d)

> How do your interpretations relate to the parameter values that were set in the original program?

Basically the expectation.

### e)

> Look carefully at the priors (in the code) and the posteriors (in the plots) over blicketPower and nonBlicketPower. Did we impose any a priori assumptions about the relationship between these parameters? Think about the experimental setup. Do you think we would be justified in imposing any assumptions? Why or why not? What do the posteriors tell you? How was the data analysis model able to arrive at this conclusion?

The priors over `blicketPower` and `nonBlicketPower` don't actually encode the information that `blicketPower` should be higher than `nonBlicketPower`.
But this was basically told to kids in the experiment ("Blickets make the machine go off"), and kids show they know this from the responses they gave (when `A` makes the machine go off most of the time, they call it a blicket, not a non-blicket).

The data analysis actually learns this asymmetric from the kids' responses.
To see this, we can switch the `true` and `false` responses that kids give.

~~~~
var data = [
  repeat(10, function(){return false}).concat(true),
  repeat(6 , function(){return false}).concat(repeat(5, function(){return true})),
  repeat(4, function(){return false}).concat(repeat(7, function(){return true})),
  repeat(8, function(){return false}).concat(repeat(3, function(){return true})),
  repeat(2, function(){return false}).concat(repeat(9, function(){return true}))
];
~~~~

When we do that, we see that `nonBlicketPower` is greater than `blicketPower` in the posteriors.

Leaving this relationship for the model to infer is a nice sanity check. It's cool that we can learn the appropriate relationship (`blicketPower > nonBlicketPower`) from the data, but it would be OK to bake it in. It wasn't a key part of our theory, and we're pretty confident that kids understand.

### f)

> Do you notice anything about the scatter plot? How would you interpret this? Is there something we could add to the data analysis model to account for this? 

There seems to be a linear relationship betweeen model and data, but the values are not always equal. If we add some scaling factor, we could get from model to accurate predictions of people's responses.

### g)

> Now, we're going to examine the predictions of the model if we had done a more traditional analysis of point-estimates of parameters (i.e. fitting parameters). Examine your histograms and determine the "maximum a posteriori" (MAP) value for each parameter. Plug those into the code below and run it.

~~~~
///fold:
var toProbs = function(predictions) {
  return _.object(map(function(i) {return "predictive: cond" + i + " P(true)";}, _.range(1, predictions.length + 1)),
                  map(function(model) {return Math.exp(model.score(true))}, predictions))
}

var dataSummary = function(data) {
  return map(function(condData) {
    return filter(function(d) {return d}, condData).length/11
  }, data)
};

// 5 experiment conditions / stimuli
var possibleEvidenceStream = [
  [['A']],
  [['A', 'B']],
  [['A', 'B'], ['B']],
  [['A', 'B'], ['A', 'B']],
  [[]]
];

var data = [
  repeat(10, function(){return true}).concat(false),
  repeat(6 , function(){return true}).concat(repeat(5, function(){return false})),
  repeat(4, function(){return true}).concat(repeat(7, function(){return false})),
  repeat(8, function(){return true}).concat(repeat(3, function(){return false})),
  repeat(2, function(){return true}).concat(repeat(9, function(){return false}))
];

// for each condition.
// note: always the question "is A a blicket?"
var data = [
  repeat(10, function(){return true}).concat(false),
  repeat(6 , function(){return true}).concat(repeat(5, function(){return false})),
  repeat(4, function(){return true}).concat(repeat(7, function(){return false})),
  repeat(8, function(){return true}).concat(repeat(3, function(){return false})),
  repeat(2, function(){return true}).concat(repeat(9, function(){return false}))
];

// Same model as above, but parameterized
var detectingBlickets = mem(function(evidence, params) {
  return Infer({method: 'enumerate'}, function() {
    var blicket = mem(function(block) {return flip(params.blicketBaseRate)})
    var power = function(block) {return blicket(block) ? params.blicketPower : params.nonBlicketPower}
    var machine = function(blocks) {
      return (blocks.length == 0 ?
              flip(params.machineSpontaneouslyGoesOff) :
              flip(power(first(blocks))) || machine(rest(blocks)))
    }
    map(function(blocks){condition(machine(blocks))}, evidence)
    return blicket('A')
  })
})
///

var params = { 
  blicketBaseRate : ...,
  blicketPower: ...,
  nonBlicketPower: ...,
  machineSpontaneouslyGoesOff: ...
};

var bestFitModelPredictions = map(function(evidence) {
  return Math.exp(detectingBlickets(evidence, params).score(true));
}, possibleEvidenceStream)

viz.scatter(bestFitModelPredictions, dataSummary(data))
~~~~

### h)

> What can you conclude about the two ways of looking at parameters in this model's case? Do you think the model is relatively robust to different parameter settings?

Setting the parameters to just the modes changes the model fit. The fit is a lot better when we fit all the paramters at once. Some of the relationships between those parameters matter, in a way that we haven't really captured in the strucutre of our model. 
