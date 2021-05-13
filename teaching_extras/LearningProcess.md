---
layout: exercise
title: Algorithms for learning
---

In the [chapter on learning](../chapters/learning-as-conditional-inference) we formulated learning problems as inference of a hypothesis given a (conditionally independent) sequence of observations. This exposes a fundemental equivalence between reasoning and learning, at the computational level of analysis. The story is more complex at the process level. Let us begin by revisiting the simplest possible learning problem:

~~~~
var prior = Bernoulli({p:0.5})

var batchInf = function(data){
  Infer({method:'enumerate'},function(){
    var h = sample(prior)
    var obsFn = function(d){ observe(Bernoulli({p: h?0.8:0.2}),d) }
    mapData({data: data}, obsFn)
    return h
  })
}

//we make learning trajectories by *separately* Infering 
//the posterior given each prefix of data.
var data = [true,true,false,true]
var dataRange = _.range(data.length+1)
var beliefs = map(function(n){expectation(batchInf(_.take(data,n)))}, dataRange)

viz.line(dataRange,beliefs)
~~~~

We can think of this model as a process-level theory of learning that assumes perfect memory for examples, and forms beliefs by inference from scratch at every new observation. This is not the most efficient approach, in terms of either memory or compute!

We reformulate the inference by decomposing into a step-by-step process. Recall the mantra that today's posterior is tomorrow's prior. This reflects the mathematical relationship:

$$ p(h|d_1,d_2) \propto p(d_1,d_2|h)p(h) = p(d_2|h)p(d_1|h)p(h) \propto p(d_2|h)p(h|d_1).$$

(Where we have used Bayes' rule twice and the assumption that $$d_1$$ is independent of $$d_2$$ conditioned on $$h$$.)
Reformulating the probabilistic program in this way leads to a sequential belief updating model:

~~~~
var prior = Bernoulli({p:0.5})

var oneStepInf = function(prior,d){
  Infer({method:'enumerate'},function(){
    var h = sample(prior)
    var obsFn = function(d){ observe(Bernoulli({p: h?0.8:0.2}),d) }
    obsFn(d)
    return h
  })
}

var beliefs = function(prior, data) {
  var curBelief = expectation(prior)
  if (data.length==0) {return [curBelief]}
  var posterior = oneStepInf(prior,data[0])
  return [curBelief].concat(beliefs(posterior,_.drop(data,1)))
}

//we explore the learning trajectories while updating beliefs for each data point.
var data = [true,true,false,true]
var dataRange = _.range(data.length+1)
viz.line(dataRange,beliefs(prior,data))
~~~~

Read through this model and try different datasets. Convince yourself that the results are the same as the batch-inference formulation earlier. How does the run time of the two formulations compare? When might sequential-inference be preferred?

The sequential belief updating model is certainly more memory efficient in terms of data: it need not remember data points after it has seen them. However it instead must maintain the belief distribution (the `prior`) in memory in between observations. As we said in studying process models, the choice of representation for uncertainty is key to understanding how humans might implement probabilistic reasoning. Above we have assumed a complete, explicit representation of uncertainty: the `prior` at each step corresponds to the full belief distribution (constructed by the 'enumerate' method). 

What happens if we approximate the evolving belief distribution? Change the model to use 'rejection' instead of 'enumerate':

~~~~
var prior = Bernoulli({p:0.5})

var oneStepInf = function(prior,d){
  Infer({method:'enumerate'},function(){
    var h = sample(prior)
    var obsFn = function(d){ observe(Bernoulli({p: h?0.8:0.2}),d) }
    obsFn(d)
    return h
  })
}

var beliefs = function(prior, data) {
  var curBelief = expectation(prior)
  if (data.length==0) {return [curBelief]}
  var posterior = oneStepInf(prior,data[0])
  return [curBelief].concat(beliefs(posterior,_.drop(data,1)))
}

//we explore the learning trajectories while updating beliefs for each data point.
var data = [true,true,false,true]
var dataRange = _.range(data.length+1)
viz.line(dataRange,beliefs(prior,data))
~~~~

How does the behavior depend on number of samples? What happens when just one or two samples are used (and why)? Why does the model return a different trajectory each time it is run? How could you tell experimentally if humans are using a process like this for learning?

## Resource-rational learning

What algorithmic choices would be optimal for different learning problems? For learning, as opposed to reasoning, we need to carefully consider the cost of memory. We would need assumptions about the relative costs of memory for data, memory for beliefs (about hypotheses), and computation. In addition, the value of accurate responses is subtle for learning problems. The key property of the hypothesis we are learning is that it impacts all the observations; it therefore also impacts all future predictions. How should we weight the accuracy of future predictions? If we don't yet know what predictions we'll need to make?

Try to formulate the objective (or utility function) for a resource-rational analysis of learning. What conclusions can you draw about differences beteween resource-optimal processes for learning and reasoning?


## More exploration

Now, if you have time, do some of the following: 

- Try different inference methods in the sequential belief updating model (MCMC, optimize). What behavioral signatures might they have? <!-- {method:'optimize', samples:100, optMethod: {adam: {stepSize: .01}}, steps: 10000,} -->
- Explore learning for a more complex model, such as models with several continuous random variables. How does the complexity of the hypothesis space affect the usefulness of different algorithmic approaches?
- Explore the resource tradeoffs of different algorithmic approaches to learning. You can explore computation time, bias, and variance as we did previously (using the `metrics` helper below). Also consider memory needs.

~~~~
var metrics = function(foo, trials, trueExp) {
  var start = _.now()
  var ret = repeat(trials, foo)
  var end = _.now()  
  var means = map(expectation, ret)
  var variance = listVar(means)
  var bias = listMean(map(function(x){trueExp-x}, means))
  return {rt: (end-start)/trials, variance: variance, bias: bias}
}
~~~~