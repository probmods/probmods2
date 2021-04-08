---
layout: exercise
title: Bayesian Data Analysis - solutions
custom_js:
- assets/js/towData.js
- assets/js/towConfigurations.js
---

## Exercise 1: Experimenting with priors and predictives

In [our simple binomial model]({{site.baseurl}}/chapters/bayesian-data-analysis.html#a-simple-illustration),
we compared the parameter priors and posteriors to the corresponding **predictives**
which tell us what data we should expect given our prior and posterior beliefs.
For convenience, we've reproduced that model here.

### Exercise 1.1

> Notice that we used a uniform distribution over the interval [0, 1] as our prior, reflecting our assumption that a probability must lie between 0 and 1 but otherwise remaining agnostic to which values are most likely to be the case.
While this is convenient, we may want to represent other assumptions.
> 
> The [Beta distribution](https://en.wikipedia.org/wiki/Beta_distribution), expressed in WebPPL as `Beta({a:..., b:...})`' is a more general way of expressing beliefs over the interval [0,1].
> The beta distribution is what's called the conjugate prior probability distribution for the binomial distribution due
> to its relationship between the prior and the posterior, and it also has a really neat interpretation that we will
> explore in this problem.
> 
> You may want to visualize the beta distribution a few times with different parameters to get a sense of its shape.
> 1. Beta(1, 1)
> 2. Beta(3, 3)
> 3. Beta(50, 50)
> 4. Beta(1, 10)
> 5. Beta(10, 1)
> 6. Beta(.2, .2)

~~~~
viz(repeat(10000, function() { sample(Beta({a:1, b: 1})) }));
~~~~

> Here, we have the binomial distribution example from the chapter.

~~~~
// observed data
var k = 1; // number of successes
var n = 20;  // number of attempts
var priorDist = Uniform({a: 0, b: 1});

var model = function() {
   var p = sample(priorDist);

   // Observed k number of successes, assuming a binomial
   observe(Binomial({p : p, n: n}), k);

   // sample from binomial with updated p
   var posteriorPredictive = binomial(p, n);

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

viz.marginals(posterior);
~~~~

> Using the code above, answer the following questions.
> 1. Run the code as is. How does the posterior compare to beta(2, 20)?

They look similar.

> 2. Set the prior to beta(1, 1). What do you notice about the posterior distribution?

The posterior looks similar to before.

> 3. Set n = 10 and the prior to beta(1, 11). What do you notice about the posterior distribution?

The posterior looks similar to before.

> 4. Set k = 5, n = 15, and the prior to beta(1, 1). Compare the posterior to beta(6, 11).

The posterior looks similar to beta(6, 11). 

> 5. Set k = 4, n = 10, and the prior to beta(1, 1). 
     What values of `a` and `b` would of beta(a, b) would the posterior look like?

beta(5, 11)

> 6. Set k = 10 and n = 20.
     What values of `a` and `b` would a prior of beta(a, b) make the posterior look like beta(12, 10)?

beta(3, 1)

> 7. Based on these observations (and any others you may have tried),
     what is the relationship between the beta distribution and the binomial distribution?

`a` can intuitively be thought of as the number of successes/trues/heads/etc. we've seen before,
and `b` as the number of failures/falses/tails, etc. we've seen before.
Note that if `a` and `b` are less than `1`, we have strong intuitions against values towards the center.

### Exercise 1.2

> Predictive distributions are not restricted to exactly the same experiment as the observed data,
and can be used in the context of any experiment where the inferred model parameters make predictions.
> In the current simple binomial setting, for example, predictive distributions could be found by an experiment
that is different because it has `n' != n` observations.
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

## Exercise 2: Parameter fitting vs. parameter integration

> One of the strongest motivations for using Bayesian techniques for model-data evaluation is in how "nuisance" parameters are treated.
"Nuisance" parameters are parameters of no theoretical interest; their only purpose is to fill in a necessary slot in the model.
Classically, the most prominant technique (from the frequentist tradition) for dealing with these parameters is to
fit them to the data, i.e., to set their value equal to whatever value maximizes the model-data fit
(or, equivalently, minimizes some cost function).

> The Bayesian approach is different.
Since we have *a priori* uncertainty about the value of our parameter, we will also have *a posteriori*
uncertainty about the value (though hopefully the uncertainty will be reduced).
What the Bayesian does is *integrate over* her posterior distribution of parameter values to make predictions.
Intuitively, rather than taking the value corresponding to the peak of the distribution (i.e., the maximum),
she's considering all values with their respective probabilites.

> Why might this be important for model assessment?
Imagine the following situation.
You are piloting a task and want to use Bayesian Data Analysis because you hear it is useful when you have few data points.
You think that the task you've designed is a little too difficult for subjects.
(Let's imagine that you're a psychophysicist, and your task pertains to contrast discriminiation in the peripheral visual field.)
You think the current task design is too difficult, but you're not sure.
It may well be that it's fine for subjects.

> Here is your prior.

~~~~
// Prior on task difficulty is uniform on [0, ..., 0.9], with a spike on 0.9
// i.e., you think it's likely that the task is too difficult
var sampleTaskDifficulty = function() {
  return flip() ? .9 : randomInteger(10) / 10;
}
                                                                                 
var model = function() {
  return sampleTaskDifficulty();
}
                                                                                 
viz.hist(Infer({method: 'enumerate'}, model), {numBins: 9});
~~~~

> You have a model of how subjects perform on your task.
You could have a structured, probabilistic model here.
For simplicity, let's assume you have the simplest model of task performance.
It is a direct function of task-difficulty: subjects perform well if the task isn't too difficult.

~~~~norun
var subjectPerformWell = !flip(taskDifficulty);
~~~~

> There's a lot of training involved in your task and that it's very time consuming for you to collect data.
You run one subject through your training regime and have them do the task.
The subject performs well!
Soon after, your adviser drops by and wants you to make a decision to collect more data or tweak your experimental paradigm.
You thought beforehand that your task was too difficult.

> Since you wrote down your prior beliefs, we can examine how much the data update those beliefs about the `taskDifficulty` parameter.
How does your degree of belief in task difficult change as a result of your one pilot subject performing well?

~~~~
// Prior on task difficulty is uniform on [0, ..., 0.9], with a spike on 0.9
var sampleTaskDifficulty = function() {
  return flip() ? .9 : randomInteger(10) / 10;
};

// Compute posterior after seeing one subject perform well on the task 
var taskDifficultyPosterior = Infer({method: 'enumerate'}, function(){
  var taskDifficulty = sampleTaskDifficulty();

  // subject will perform well if the task is not too difficult
  var subjectPerformsWell = !flip(taskDifficulty);

  // observe that they perform well (i.e. this value is true)
  condition(subjectPerformsWell);
  return taskDifficulty;
});

// Most likely task-difficulty is still .9
print("MAP: " + taskDifficultyPosterior.MAP().val);

// But a lot of probability mass is on lower values
viz.hist(taskDifficultyPosterior, {numBins: 9});

// Indeed, the expected subject ability is around .4
print("Expectation: " + expectation(taskDifficultyPosterior));
~~~~

### Exercise 2.1

> Would you proceed with more data collection or would you change your experimental paradigm?
In other words, do you still think your task is too hard?

The posterior distribution shows that the task may not be as difficult as originally thought.
If this participant did well, other participants may also do well, so the paradigm may not need to be changed.


### Exercise 2.2

> In Exercise 2.1, you probably used either one value of the task-difficulty or the full distribution of values to decide about whether to continue data collection or tweak the paradigm.
We find ourselves in a similar situation when we have models of psychological phenomena and want to decide whether the model fits the data (or, equivalently, whether our psychological theory is capturing the phenomenon).
The traditional approach is the value (or "point-wise estimate") approach: take the value that corresponds to the best fit
(e.g., by using least-squares or maximum-likelihood estimation; here,
you would have taken the Maximum A Posteriori (or, MAP) estimate, which would be 0.9).
Why might this not be a good idea? Comment on the reliability of the MAP estimate and how MAP estimate compares to other values of the posterior distribution.

The MAP is only 0.9 because of our strong prior beliefs.
The second most likely posterior value is the complete opposite (p = 0).


## Exercise 3

> Let's continue to explore the inferences you (as a scientist) can draw from the posterior over parameter values.
This posterior can give you an idea of whether your model is well-behaved.
In other words, do the predictions of your model depend heavily on the exact parameter value?

> To help us understand how to examine posteriors over parameter settings, we're going to revisit the example of the blicket detector from the chapter on `Conditional Dependence`.

> Here is the model, with slightly different names than the original example, and written in a parameter-friendly way.
It is set up to display the "backwards blocking" phenomenon.


~~~~
var blicketBaseRate = 0.4;
var blicketPower = 0.9;
var nonBlicketPower = 0.05;
var machineSpontaneouslyGoesOff = 0.05;

var blicketPosterior = function(evidence) {
  return Infer({method: 'enumerate'}, function() {
    var blicket = mem(function(block) { flip(blicketBaseRate) });
    var power = function(block) { blicket(block) ? blicketPower : nonBlicketPower };
    var machine = function(blocks) {
      return (blocks.length == 0 ?
              flip(machineSpontaneouslyGoesOff) :
              flip(power(first(blocks))) || machine(rest(blocks)));
    };
    // Condition on each of the pieces of evidence making the machine go off
    map(function(blocks) { condition(machine(blocks)) }, evidence);
    return blicket('A');
  });
};

// A & B make the blicket-detector go off
viz(blicketPosterior([['A', 'B']]));

// A & B make the blicket-detector go off, and then B makes the blicket detector go off
viz(blicketPosterior([['A', 'B'], ['B']]));
~~~~

### Exercise 3.1

> What are the parameters of the above model?
> Explain what they represent in plain English.

`blicketBaseRate`             | 0.4  | The probability that a block is a blicket.
`blicketPower`                | 0.9  | The probability that a blicket will set off the detector and power the machine.
`nonBlicketPower`             | 0.05 | The probability that a non-blicket will set off the detector and power the machine.
`machineSpontaneouslyGoesOff` | 0.05 | The probability that the machine goes off on its own.


### Exercise 3.2

> Let's analyze this model with respect to some data.
> First, we'll put priors on these parameters, and then we'll do inference,
> conditioning on some data we might have collected in an experiment on 4 year olds, a la Sobel, Tenenbaum, & Gopnik (2004).
> [The data used in this exercise is schematic data].

> Before running the program below, answer the following question:
> 1. What does the `Infer` statement in `dataAnalysis` return?
> 2. What does the `Infer` statement in `detectingBlickets` return?

1. The posterior probabilities of params and predictions, fitted to the data.
2. An inference of what people will say given the evidence they see.

~~~~
///fold:

// alternative proposal distribution for metropolis-hastings algorithm
var uniformKernel = function(prevVal) {
  return Uniform({a: prevVal - 0.2, b: prevVal + 0.2});
}

var toProbs = function(predictions) {
  var labels = map(function(i) { "predictive: cond" + i + " P(true)" },
                   _.range(1, predictions.length + 1))
  var probs = map(function(model) {return Math.exp(model.score(true))}, predictions);
  return _.zipObject(labels, probs);
}

var dataSummary = function(data) { _.map(data, _.mean) };

var predictiveSummary = function(model) {
  var labels = map(function(i) {return "predictive: cond" + i + " P(true)"},
                   _.range(1, 6));
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
// note: the question is always "is A a blicket?"
var data = [
  repeat(10, function() { true }).concat(false),
  repeat(6 , function() { true }).concat(repeat(5, function() { false })),
  repeat(4, function() { true }).concat(repeat(7, function() { false })),
  repeat(8, function() { true }).concat(repeat(3, function() { false })),
  repeat(2, function() { true }).concat(repeat(9, function() { false }))
];

// Same model as above, but parameterized
var detectingBlickets = mem(function(evidence, params) {
  return Infer({method: 'enumerate'}, function() {
    var blicket = mem(function(block) { flip(params.blicketBaseRate) });
    var power = function(block) { blicket(block) ? params.blicketPower : params.nonBlicketPower };
    var machine = function(blocks) {
      return (blocks.length == 0 ?
              flip(params.machineSpontaneouslyGoesOff) :
              flip(power(first(blocks))) || machine(rest(blocks)));
    };
    map(function(blocks){condition(machine(blocks))}, evidence);
    return blicket('A');
  })
})

var dataAnalysis = Infer({method: 'MCMC',
                          samples: 5000,
                          callbacks: [editor.MCMCProgress()]},
                         function() {
  var params = {
    blicketBaseRate: sample(Uniform({a: 0, b: 1}), {driftKernel: uniformKernel}),
    blicketPower: sample(Uniform({a: 0, b: 1}), {driftKernel: uniformKernel}),
    nonBlicketPower: sample(Uniform({a: 0, b: 1}), {driftKernel: uniformKernel}),
    machineSpontaneouslyGoesOff: sample(Uniform({a: 0, b: 1}), {driftKernel: uniformKernel})
  }

  var cognitiveModelPredictions = map(function(evidence) {
    return detectingBlickets(evidence, params)
  }, possibleEvidenceStream);

  // observe each data point under the model's predictions
  map2(function(dataForStim, modelPosterior) {
    map(function(dataPoint) {
      observe(modelPosterior, dataPoint);
    }, dataForStim)
  }, data, cognitiveModelPredictions);
  
  var predictives = toProbs(cognitiveModelPredictions);
  return _.extend(params, predictives);
})

viz.marginals(dataAnalysis);
viz.scatter(predictiveSummary(dataAnalysis), dataSummary(data),
            {xLabel: 'model', yLabel: 'data'});
~~~~

### Exercise 3.3

> Now, run the program.
> [Note: This will take between 15-30 seconds to run.]
> Interpret each of the resulting plots.

`blicketBaseRate` | blickets are common, but not *that* common
`blicketPower`    | blickets rarely fail to set off the detector
`nonBlicketPower` | non-blickets might *rarely* set off the detector
`machineSpontaneouslyGoesOff` | the detector might *rarely* just go off for no reason
`predictive: cond1 P(true)` | `A` is probably a blicket...
`predictive: cond2 P(true)` | `A` is slightly more likely to be a blicket
`predictive: cond3 P(true)` | no idea if `A` is a blicket
`predictive: cond4 P(true)` | `A` is slightly more likely to be a blicket
`predictive: cond5 P(true)` | `A` is probably not a blicket
model (`x`) vs. data (`y`) | We can accurately guess people's response from model, but they're not exactly 1-1

### Exercise 3.4

> How do the posterior parameter values relate to the parameter values that were set in the original program?

The original program's parameter values were approximately the expected value of the posterior parameter values.

### Exercise 3.5

> Look carefully at the priors (in the code) and the posteriors (in the plots) over `blicketPower` and `nonBlicketPower`. 
> Were there any a priori assumptions about the relationship between these parameters in the experimental setup?  
> Do you think we would be justified in imposing any assumptions to the model? 
> Consider the posterior distributions. 
> How was the data analysis model able to find the relationship between these parameters?

The experiment assumes that blickets make the machine go off (it's what the kids were told), but the model makes
no such a priori assumptions, i.e. `blicketPower` > `nonBlicketPower`, etc.
However, since kids show they know this from the responses they gave
(when `A` makes the machine go off most of the time, they call it a blicket, not a non-blicket),
the inference model can learn this asymmetry from the data.
We can test this by switching the `true` and `false` responses that kids give.

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

Leaving this relationship for the model to infer is a nice sanity check.
It's cool that we can learn the appropriate relationship (`blicketPower > nonBlicketPower`) from the data,
but it would be OK to code it in.
It wasn't a key part of our theory, and we're pretty confident that kids understood how blickets worked.

### Exercise 3.6

> Do you notice anything about the scatter plot?
> How would you interpret this?
> Is there something we could add to the data analysis model to account for this? 

There seems to be a linear relationship between the model predictions and the data, but the values are not always equal.
If we add some scaling factor, we could translate the model outputs to get to accurate predictions of people's responses.

### Exercise 3.7

> Now, we're going to examine the predictions of the model if we had done a more traditional analysis of point-estimates of parameters (i.e. fitting parameters).
> Examine your histograms and determine the "maximum a posteriori" (MAP) value for each parameter.
> Plug those into the code below and run it.

~~~~
///fold:

var toProbs = function(predictions) {
  var labels = map(function(i) { "predictive: cond" + i + " P(true)" },
                   _.range(1, predictions.length + 1))
  var probs = map(function(model) {return Math.exp(model.score(true))}, predictions);
  return _.zipObject(labels, probs);
}

var dataSummary = function(data) { _.map(data, _.mean) };

// 5 experiment conditions / stimuli
var possibleEvidenceStream = [
  [['A']],
  [['A', 'B']],
  [['A', 'B'], ['B']],
  [['A', 'B'], ['A', 'B']],
  [[]]
];

// for each condition.
// note: the question is always "is A a blicket?"
var data = [
  repeat(10, function() { true }).concat(false),
  repeat(6 , function() { true }).concat(repeat(5, function() { false })),
  repeat(4, function() { true }).concat(repeat(7, function() { false })),
  repeat(8, function() { true }).concat(repeat(3, function() { false })),
  repeat(2, function() { true }).concat(repeat(9, function() { false }))
];

var detectingBlickets = mem(function(evidence, params) {
  return Infer({method: 'enumerate'}, function() {
    var blicket = mem(function(block) { flip(params.blicketBaseRate) });
    var power = function(block) { blicket(block) ? params.blicketPower : params.nonBlicketPower };
    var machine = function(blocks) {
      return (blocks.length == 0 ?
              flip(params.machineSpontaneouslyGoesOff) :
              flip(power(first(blocks))) || machine(rest(blocks)));
    };
    map(function(blocks){condition(machine(blocks))}, evidence);
    return blicket('A');
  })
})
///

var params = { // some possible MAP values
  blicketBaseRate : 0.43, 
  blicketPower: .97,
  nonBlicketPower: .04,
  machineSpontaneouslyGoesOff: .05
};

var bestFitModelPredictions = map(function(evidence) {
  return Math.exp(detectingBlickets(evidence, params).score(true));
}, possibleEvidenceStream);

viz.scatter(bestFitModelPredictions, dataSummary(data));
~~~~

### Exercise 3.8

> What can you conclude about the two ways of looking at parameters in this model's case?

The model predictions fits the data better using the full posterior distributions than just the MAP point estimates.
