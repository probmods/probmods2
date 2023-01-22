---
layout: exercise
title: Hierarchical models
description: The power of abstraction.
---

## Exercise 1: Pseudocounts

The main text states that you can think of the Dirichlet parameter $$\alpha = [\alpha_1, \alpha_2, ..., \alpha_n]$$ "as a kind of prior" over categories $$[A_1, A_2, ..., A_n]$$. α is not a prior in the usual sense, since it is not a probability distribution. What α represents instead is a virtual observation. Thus if $$\alpha = [2, 2, 1]$$, that is the equivalent of having already observed  the first category and second category twice each, and the third category one time only.

Complete the code below to prove that setting $$\alpha = [2, 3, 1, 1, 1]$$ is equivalent to setting $$\alpha = [1, 1, 1, 1, 1]$$ and then observing the first category once and the second category twice:

~~~~js
var colors = ['black', 'blue', 'green', 'orange', 'red'];

var observedData = [
{bag: 'bag1', draw: 'blue'},
{bag: 'bag1', draw: 'blue'},
{bag: 'bag1', draw: 'black'}]

var observed = Infer({method: 'MCMC', samples: 20000}, function(){
  var makeBag = mem(function(bag){
    var colorProbs = T.toScalars(dirichlet(ones([colors.length, 1])))
    return Categorical({vs: colors, ps: colorProbs})
  })

  var obsFn = function(datum){
    observe(makeBag(datum.bag), datum.draw)
  }

  mapData({data: observedData}, obsFn)

  return {bag1: sample(makeBag('bag1'))}
})

viz.marginals(observed)

var usealpha = Infer({method: 'forward', samples: 20000}, function(){
  var makeBag = mem(function(bag){
    var colorProbs = T.toScalars(dirichlet(Vector([2,3,1,1,1])))
    return Categorical({vs: colors, ps: colorProbs})
  })

  return {bag1: sample(makeBag('bag1'))}
})

viz.marginals(usealpha)
~~~~

## Exercise 2: Rotten apples

On any given day, a given grocery store has some number of apples for sale. Some of these apples may be mushy or even rotten. The probability that each apple is rotten is not independent: a ripening fruit emits chemicals that encourages other fruit to ripen as well. As they say, [one rotten apple spoils the whole barrel](https://idiomation.wordpress.com/2013/03/27/one-bad-apple-spoils-the-whole-barrel/). 

For each apple in a barrel, assume the probability that the apple is rotten is `flip(p)` where `p` is drawn from some prior. An appropriate prior distribution is Beta. Recall that the Beta distribution is just a Dirichlet that returns a vector of length one. So it, too, is defined based on pseudocounts `[a, b]`. Thus `Beta({a: 10, b: 2})` returns the equivalent of a Beta distribution conditioned on having previously seen 10 heads and 2 tails. 

To get a sense of the Beta distribution, run the following code:

~~~~js
viz(Beta({a: 1, b: 1})
viz(Beta({a: 10, b: 1})
viz(Beta({a: 1, b: 10})
viz(Beta({a: .1, b: .2})
~~~~

Note that the final example gives a very nice prior for our apples: most of the time, the probability of a rotten apple is quite low. The rest of the time, the probability is very high. Middling probabilities are rare. 

#### a)

Write a function `makeBarrel` that returns a function (a 'barrel') that takes a single argument *N* and returns a vector representing the rottenness of *N* apples from that barrel (where `true` is rotten and `false` is not rotten). That is, the following code:

```norun
var abarrel = makeBarrel('b')
abarrel(5)
```

should return something like `[true, true, true, false, true]`.

Complete the following codebox:

~~~~js
var makeBarrel = mem(function(barrel){
	var p = beta({a: .1, b: .2})
	
	return function(N){
      return repeat(N, function() {flip(p)})
    }
})

var post = Infer({method: 'forward'}, function(){
	var abarrel = makeBarrel('b')
	return Math.sum(abarrel(10))
})
viz(post)
~~~~

#### b)

Some grocery stores have fresher produce than others. So let's create a function `makeStore` that returns a makeBarrel function, which works as it did in (a). Importantly, each store has its own Beta parameters `[a, b]` drawn from some prior. 

HINT: In order to maintain the likelihood that in a given barrel, either most of the apples are rotten or few are, you need to ensure that `a < 1` and `b < 1`. However, if `a` is much larger than `b` (or vice versa), you will get extreme results with *every* apple being rotten or *every* apple being good. 

~~~~js
var makeStore = mem(function(store){
    var prior = flip() ? [.1, .3] : [.3, .1]
    
	var makeBarrel = mem(function(barrel){
		var p = beta({a: prior[0], b: prior[1]})
	
		return function(N){
  		    return repeat(N, function() {flip(p)})
   		 }
	})
	
	return makeBarrel
})

viz(Infer({method: 'forward', samples:10000}, function(){
  var S = makeStore('S')
  var B1 = S('B1')
  var B2 = S('B2')
  return Math.abs(Math.sum(B1(10))-Math.sum(B2(10)))
}))

viz(Infer({method: 'forward', samples:10000}, function(){
  var S1 = makeStore('S1')
  var S2 = makeStore('S2')
  var B1 = S1('B1')
  var B2 = S2('B2')
  return Math.abs(Math.sum(B1(10))-Math.sum(B2(10)))
}))
~~~~

#### c)

We can keep going. Some cities are located in apple country and thus have more access to fresh apples. Most stores in those cities are going to mostly have good barrels with good apples. Other cities have less access to fresh apples, and so more of their stores will have bad barrels with rotten apples. 

In the code block below, create a `makeCity` function, which returns a `makeStore` function, which works as in (b). In (b), each store had a prior on `[a, b]`. Let's put a prior on *that* prior, such that cities either tend to have good stores or tend to have bad stores.

NOTE: Again, it is not necessary to be overly fancy with these priors. 

~~~~js
var makeCity = mem(function(city){
	var hprior = beta({a: .25, b: .25})

	var makeStore = mem(function(store){
	    var prior = flip(hprior) ? [.1, .3] : [.3, .1]
	    
		var makeBarrel = mem(function(barrel){
			var p = beta({a: prior[0], b: prior[1]})
		
			return function(N){
	  		    return repeat(N, function() {flip(p)})
	   		 }
		})
		
		return makeBarrel
	})

	return makeStore
})

var C1 = makeCity("C1")
var S1 = C1("S1")
var B1 = S1("B1")

viz(Infer({method: 'forward'}, function(){
	return Math.sum(B1(10))
})) 
//repeat to see different kinds of cities
~~~~

#### d)

Suppose you go to a store in a city. The store has a barrel of 10 apples, 7 of which are rotten. You leave and go to another store in the same city. It also has has a barrel with 10 apples. Using your code above, how many of these apples are likely to be rotten?

~~~~js
var makeCity = mem(function(city){
	var hprior = beta({a: .25, b: .25})

	var makeStore = mem(function(store){
	    var prior = flip(hprior) ? [.1, .3] : [.3, .1]
	    
		var makeBarrel = mem(function(barrel){
			var p = beta({a: prior[0], b: prior[1]})
		
			return function(N){
	  		    return repeat(N, function() {flip(p)})
	   		 }
		})
		
		return makeBarrel
	})

	return makeStore
})

var amod = Infer({method: 'MCMC', samples:5000, lag: 100}, function(){
  var C = makeCity("C")
  var S1 = C("S1")
  var B1 = S1("B1")
  
  condition(Math.sum(B1(10)) == 7)

  var S2 = C("S2")
  var B2 = S2("B2")
  
  return Math.sum(B2(10))
})

viz(amod)
~~~~