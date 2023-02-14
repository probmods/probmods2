---
layout: exercise
title: Inference about inference - exercises
---

## Exercise 1: Tricky Agents

What would happen if Sally knew you were watching her and wanted to deceive you? 

### Exercise 1.1

Complete the code below so that `chooseAction` chooses a misdirection if Sally is deceptive.
Then describe and show what happens if you knew Sally was deceptive and chose action "b".

~~~~
var actionPrior = Categorical({vs: ['a', 'b', 'c'], ps: [1/3, 1/3, 1/3]});
var foodPrior = Categorical({vs: ['bagel', 'cookie', 'doughnut'], ps: [1/3, 1/3, 1/3]});

var vendingMachine = function(state, action) {
  return (action == 'a' ? categorical({vs: ['bagel', 'cookie', 'doughnut'], ps: [.8, .1, .1]}) :
          action == 'b' ? categorical({vs: ['bagel', 'cookie', 'doughnut'], ps: [.1, .8, .1]}) :
	  action == 'c' ? categorical({vs: ['bagel', 'cookie', 'doughnut'], ps: [.1, .1, .8]}) :
	  'nothing');
}

var chooseAction = function(goal, transition, state, deceive) {
  return Infer({method: 'enumerate'}, function() {
    var action = sample(actionPrior);
    condition(...)
    return action;
  })
};

var goalPosterior = Infer({method: 'enumerate'}, function() {
  var deceive = flip();
  var goalFood = sample(foodPrior);
  var goal = function(outcome) {return outcome == goalFood};
  var sallyActionDist = chooseAction(goal, vendingMachine, 'state', deceive);
  condition(...)
  return goalFood;
});

viz.auto(goalPosterior);
~~~~

### Exercise 1.2

You observe that Sally chooses `a`, and then `b`.
How likely is it that she is deceptive?
What if you instead observed that she chose `b` and then `b` again?
Explain how deceptiveness and preferences interact to produce her actions.
*Hint: Try conditioning on (not) deceive and visualize the possible action-pairs Sally might take.

~~~~
~~~~

## Exercise 2: Factors

The `factor` function can be very helpful. The WebPPL manual has this to say about `factor`:

> `factor(score)` adds `score` to the log probability of the current distribution.

Let's try an example:

~~~~
var dist1 = Infer({method: 'enumerate'},
  function () {
    var A = flip()
    return A
});

var dist2 = Infer({method: 'enumerate'},
  function () {
    var A = flip()
    A ? factor(1) : factor(0)
    return A
});

viz(dist1)
viz(dist2)
~~~~

Consider that the probability of heads and tails in `dist1` are both .5. Adding 1 to the log probability of heads means

$$log(P(H)) + 1 = log(.5) + 1 \approx .307$$

Adding 0 to the log probability of tails means

$$log(P(T)) + 0 = log(.5) \approx -.693$$

Of course, these two probabilities no longer sum to 1, so we need to normalize:

$$P(H) = \frac{P(H)}{P(H) + P(T)} \approx \frac{e^.307}{e^.307 + e^{-.693}} \approx .731$$

If you run the code above, you should see that our numbers match.


### a)

Try to use factor to get approximately 95\% probability of heads (this does not need to be exact; just get close):

~~~~
var dist = Infer({method: 'enumerate'},
  function () {
    var A = flip()
    factor(A) //edit this line
    return A
});
viz(dist)
~~~~

### b)

In this model, we flip 3 coins. Use `factor` to favor an outcome of 2 heads and 1 tails:

~~~~
var softHeads = Infer({ 
  model() {
    var a = flip(0.5);
    var b = flip(0.5);
    var c = flip(0.5);
    factor( \\your code here );
    return a;
  }
});

viz(softHeads);
~~~~

## Exercise 3: The Ultimatum Game

### a)

The ultimatum game requires two players: A proposer and a responder. The proposer has to decide how to allocate \$10 between the two players in \$1 increments. Once this proposal is made, the responder decides whether to accept the proposal. If the responder accepts, both players are awarded the money according to the proposal. If the responder rejects, neither player gets anything.

If the responder was a strict utilitarian, s/he would accept any offer of \$1 or more. Assume the proposer is a soft maximizer who wants to keep as much of the \$10 as possible. Complete the code below to find out how much the proposer will offer:

~~~~

var responder = function(offer) {    
    
    // your code here
    
}

var proposer = Infer({method: "enumerate"}, function(){
	
	// your code here
	
	factor(reward)
	return(offer)	
	})

viz(proposer);
~~~~

### b)

People, it turns out, act very differently than the model above suggests. Responders will often reject low offers as "unfair", even though this means they get nothing. Assume that the responder decides whether to accept in proportion to the percentage of the \$10 allocated to her, raised to some power `alpha` (you can think of `alpha` as "spitefulness"). Complete the code below to determine how much the proposer should offer:

~~~~

var responder = function(offer, alpha) {    
  var p = Math.pow(offer/10,alpha)
	return(flip(p));
}

var proposer = Infer({method: "enumerate"}, function(){
	
	// your code here
	
	factor(reward)
	return(offer)	
	})

viz(proposer);
~~~~

### c)

You can think of the variable `alpha` in the code above as encoding spitefulness: the degree to which the responder is willing to forego a reward in order to prevent the proposer from having a reward. See how setting `alpha` to 4, 6, 10, 25, and 50 affects what the proposer does. Explain the results. 

### d)


The models above assume the proposer knows the responder's decision function. Let's soften that assumption: the proposer knows that the responder's value of `alpha` is somewhere on the range [0.5, 5]. Suppose the proposer offer \$2 and the responder rejects it. What is the most likely level of `alpha`? How does that change if the first offer was \$8?

(Hint: you may find it helpful to find a different place for `alpha` than within the definition of `responder`.)

~~~~
var responder = function(offer, alpha) {    

	// your code here

}

var proposer = Infer({method: "MCMC", samples:50000}, function(){

	// your code here

]})

viz(proposer)
~~~~

### e)

Extend the model in (d) as follows: Suppose the proposer and responder are going to play twice. Does it ever make sense for the responder to reject the first proposal in order to increase the total expected payoff across the two games? (If you cannot figure out how to write the model, a verbal description is OK.) 

## Exercise 4: The Prisoner's Dilemma

### a

In the prisoner's dilemma, two thieves work together on a bank heist. Afterwards, they are apprehended by the police. The police interrogate the thieves separately. They tell each thief that if they confess they'll get a lenient sentence. If one confesses and the other doesn't, though, the one who doesn't confess will get the maximum sentences of 10 years. If neither confesses, the prosecutors will charge them with some other crime (probably resisting arrest) and they'll each get 5 years. 

What's the longest the lenient sentence can be (in round years) such that it makes sense for the thief to confess (that is, where she has a greater than 50% chance of confessing)? Use `factor(percentYearsFreedom)` where `percentYearsFreedom` is the percentage of the next 10 years the thief will not be in jail. (Assume that this incident has scared her straight and she will not commit any other crimes.)

~~~~
var thiefRats = function(){
  return (flip()? true: false)
}

var thief = Infer({}, function(){

	// your code here

})

viz(thief)
~~~~

### b

Try using `factor` to make the theives more maximizing (they are even more likely to make the choice that maximizes their years of freedom). How does this affect the answer to part (a)?

## Exercise 5: Exploring RSA

In this exercise, we'll look at the final model of scalar implicature from th emain text a bit more. Modify it as necessary. 

### a) 

How does increasing the optimality of the speaker affect the pragmatic listener's inferences? Try a couple values and report the results.

### b) 

Increase the depth to 2. How does that compare to a model with depth of 1? 

### c)

Is there any way to get ``some'' to refer to 0? Why or why not?