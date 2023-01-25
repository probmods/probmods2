---
layout: exercise
title: Resource rational analysis of processing
---

Here we explore the resource trade-offs of sampling as a psychological process model. If computation is costly, what algorithm choices provide the best balance between accuracy (or other value of decisions) and cost (in time, energy etc)? What behavioral predictions does this balance make?

## A few perfect samples

Discuss the below code carefully, making sure you understand what assumptions are made about the world, what process the 'person' goes through to make a decision, and how the average reward is computed.

~~~~
var trueWeight = 0.8
var numObs=20

var reward = function(opt){

  //sample observed data: number k of heads
  var k = binomial(trueWeight,numObs)
  
  //simulate person's decision making"
  var start = _.now()
  var posterior = Infer(opt,function(){
	var weight =  uniform(0,1)
    observe(Binomial({p:weight, n:numObs}), k)
    //return predicted next observation
	return flip(weight)
	})
  //choice is most likely outcome
  var choice = posterior.MAP().val
  var end = _.now()
  
  //reward combines accuracy and decision time.
  var rt = end-start
  var trueNext = flip(trueWeight)
  var correct = (choice == trueNext)
  var reward = correct //-0.5*rt
  
  return reward
}

//evaluate reward for varying number of samples. (use "forward" for guessing from prior.)
var rewards = [listMean(repeat(1000, function(){reward({method: "forward", samples:1})})),
               listMean(repeat(1000, function(){reward({method: "rejection", samples:1})})),
               listMean(repeat(1000, function(){reward({method: "rejection", samples:5})})),
               listMean(repeat(1000, function(){reward({method: "rejection", samples:10})})),
               listMean(repeat(1000, function(){reward({method: "rejection", samples:20})}))]

viz.line([0,1,5,10,20],rewards)
~~~~

Try changing the true weight. Try changing the number of observations. How do these affect accuracy?

Now explore different reward functions: only response time, combining response time with accuracy.

To eulogize this simulation: If the world is predictable, high correctness can be achieved; but then few samples are needed to get a good estimate of what will happen. If the world isn't predictable, extra sampling doesn't help. Can you think of situations where extra sampling *would* help make better predictions?

## Biased samples

Now we've changed the processing model from rejection sampling to MCMC. (Note we also specified a uniform drift kernel on the weight variable. This means the proposal distribution only changes the weight value a little bit each time. As a result the chain takes a while to burn in from its initial state, so early samples will be biased.) 

We know that MCMC can result in imperfect samples early on, but does so quickly, how does this affect rational parameter choices? Explore the accuracy and the response times of this process model.

~~~~

var trueWeight = 0.9
var numObs = 20

var reward = function(opt){
  //sample observed data: number k of heads
  var k = binomial(trueWeight,numObs)
  
  //simulate person's decision making"
  var start = _.now()
  var posterior = Infer(opt,function(){
	var weight =  uniformDrift({a:0,b:1, width:0.1})
    observe(Binomial({p:weight, n:numObs}), k)
    //return predicted next observation
	return flip(weight)
	})
  //choice is most likely outcome
  var choice = posterior.MAP().val
  var end = _.now()
  
  //reward is a combination of accuracy and response time.
  var rt = end-start
  var trueNext = flip(trueWeight)
  var correct = (choice == trueNext)
  var reward = correct -0.1*rt
  
  return reward
}

var rewards = [listMean(repeat(1000, function(){reward({method: "MCMC", samples:1})})),
               listMean(repeat(1000, function(){reward({method: "MCMC", samples:10})})),
               listMean(repeat(1000, function(){reward({method: "MCMC", samples:100})})),
               listMean(repeat(1000, function(){reward({method: "MCMC", samples:1000})}))]

//plot ave reward on log scale
viz.line([0,1,2,3],rewards,{xLabel:"log-samples",yLabel:"ave reward"})
~~~~

Having explored theoretically how the algorithm knobs *should* be set for MCMC (assuming some exchange rate between accuracy and time) we can look for behavioral predictions.

Below we extract the model of a single person, imagining an experiment with 100 people where we ask each to both predict the next coin flip and report their guess about the coin weight.

We've set this up with 10 samples. Explore other algorithm settings. How do the behavioral predictions differ from the "fully rational" Bayesian agent model? From other algorithmic heuristics, like "simple coin counting"?

~~~~
var trueWeight = 0.9
var numObs = 20
var opt = {method: "MCMC", samples:10}
var person = function(){
  var k = binomial(trueWeight,numObs)
  var posterior = Infer(opt,function(){
    var weight =  uniformDrift({a:0,b:1, width:0.1})
    observe(Binomial({p:weight, n:numObs}), k)
    //return predicted next observation
    return {pp:flip(weight), pw: weight}
  })
  return {choice: marginalize(posterior,'pp').MAP().val, 
          estimate: marginalize(posterior,'pw').MAP().val}
}

viz.marginals(Infer({method:"forward",samples:100},person))
~~~~
