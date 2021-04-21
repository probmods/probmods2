---
layout: exercise
title: Theory of Emotion
---

When humans think about other people, we consider their feelings as well as their beliefs, desires, and such cognitive states.
How can we integrate emotions into a theory of mind?
We will need to say what kind of values "emotion" should take, as well as how these states are causally related to other (observable and unobservable) states.
Here is a figure from Ong, Soh, Zaki, Goodman (2019), illustrating the potential causal relations:
![theory of emotion graphical model](../assets/img/ToE-fig.png)

# Appraisal

In the above diagram we see that emotion is the result of an appraisal process. 
We want to explore various `appraisal` functions to see what they will imply.
First we have to decide what this function should return -- what is a (representation of another person's) emotion?
Intuitively, emotional state is positive or negative, and can vary in degree -- that is it can be captured with a single real number.
Affective scientists have argued that emotion is experienced in a two dimensional space of valence and arousal. However these two dimensions are tightly related (in a roughly quadratic shape), so we will simplify to one dimension for now.

Let's return to our friend Sally and her vending machine. We have adjusted the model of action choice slightly to depend on a real-valued utility function, instead of a Boolean goal.

~~~~
var actionPrior = Categorical({vs: ['a', 'b'], ps: [.5, .5]})

var chooseAction = function(utilityFn, transition, state, alpha) {
  var state = (state==undefined)?'start':state
  var alpha = (alpha==undefined)?1:alpha
  return Infer(function() {
    var action = sample(actionPrior)
    factor(alpha * utilityFn(transition(state, action)))
    return action
  })
}

var vendingMachine = function(state, action) {
  return (action == 'a' ? categorical({vs: ['bagel', 'cookie'], ps: [.9, .1]}) :
          action == 'b' ? categorical({vs: ['bagel', 'cookie'], ps: [.1, .9]}) :
          'nothing')
}

var sallyDesire = function(state){ return state=='cookie' ? 10 : 1}

~~~~

One simple possibility is thus that appraisal simply returns how good or bad the outcome has for Sally.
Code a version of this simple appraisal model.

~~~~
var actionPrior = Categorical({vs: ['a', 'b'], ps: [.5, .5]})

var chooseAction = function(utilityFn, transition, state, alpha) {
  var state = (state==undefined)?'start':state
  var alpha = (alpha==undefined)?1:alpha
  return Infer(function() {
    var action = sample(actionPrior)
    factor(alpha * utilityFn(transition(state, action)))
    return action
  })
}

var vendingMachine = function(state, action) {
  return (action == 'a' ? categorical({vs: ['bagel', 'cookie'], ps: [.9, .1]}) :
          action == 'b' ? categorical({vs: ['bagel', 'cookie'], ps: [.1, .9]}) :
          'nothing')
}

var sallyDesire = function(state){ return state=='cookie' ? 10 : 1}

var appraisal = function(...) {...}

~~~~

However you may have the intuition (as participants in experiments do) that how happy or sad Sally will be depends on not only what happened, but what she *expected* to happen. This is often captured by comparing the true reward (or utility) to an expected reward.
Code a version of this appraisal model.

~~~~
var actionPrior = Categorical({vs: ['a', 'b'], ps: [.5, .5]})

var chooseAction = function(utilityFn, transition, state, alpha) {
  var state = (state==undefined)?'start':state
  var alpha = (alpha==undefined)?1:alpha
  return Infer(function() {
    var action = sample(actionPrior)
    factor(alpha * utilityFn(transition(state, action)))
    return action
  })
}

var vendingMachine = function(state, action) {
  return (action == 'a' ? categorical({vs: ['bagel', 'cookie'], ps: [.9, .1]}) :
          action == 'b' ? categorical({vs: ['bagel', 'cookie'], ps: [.1, .9]}) :
          'nothing')
}

var sallyDesire = function(state){ return state=='cookie' ? 10 : 1}

var expectedReward = function(...) {...}

var appraisal = function(...) {...}

~~~~

There are in fact several elements within outcome expectations that we can separate out. Some outcomes are unexpected but don't yield unexpected reward, other outcomes are only a bit unexpected but lead to very different reward. Appraisal could depend on these pieces (surprise, etc) to different extents. 
Code a version of the appraisal model where you can change the reliance of emotion on reward, expected reward, surprise (and any other factors you'd like).
Then play with different scenarios (change the outcomes from the vending machine, the probabilities, and Sally's utilities). Can you find cases where your intuitions of what Sally will feel constrain the `appraisal` model?

~~~~
var actionPrior = Categorical({vs: ['a', 'b'], ps: [.5, .5]})

var chooseAction = function(utilityFn, transition, state, alpha) {
  var state = (state==undefined)?'start':state
  var alpha = (alpha==undefined)?1:alpha
  return Infer(function() {
    var action = sample(actionPrior)
    factor(alpha * utilityFn(transition(state, action)))
    return action
  })
}

var vendingMachine = function(state, action) {
  return (action == 'a' ? categorical({vs: ['bagel', 'cookie'], ps: [.9, .1]}) :
          action == 'b' ? categorical({vs: ['bagel', 'cookie'], ps: [.1, .9]}) :
          'nothing')
}

var sallyDesire = function(state){ return state=='cookie' ? 10 : 1}

var expectedReward = function(...) {...}

var surprise = function(...) {...}

var appraisal = function(...) {...}

~~~~


# Emotion displays

Some things that people do are a (somewhat) direct result of their emotional experience. This includes facial expressions, body language, and perhaps some verbal ejaculations. This type of action is called an *emotion display*. Because emotion displays depend only on the emotion, they require a simple causal model, `emoDisplay(emotion)`, but they can be perceptually quite complex.

Let's think about facial expressions.
(Sometimes extreme positive and negative emotions lead to similar facial expressions. Does your model capture this?)

~~~~
~~~~

Some people express emotions more, or to different degrees. (Everyone has that one really stoic friend who barely moves his mouth when he laughs, right?) How can you incorporate these individual differences into your model?

~~~~
~~~~

Notice that it now takes more observations from a person to make a confident attribution of their emotion from their facial expression! Why?

Finally, combine your model of facial expressions with your model above of appraisal. 

~~~~
~~~~

Now explore the emotion attributions this model predicts. How do the outcome and the observed facial display trade off? 


# Other actions

Some actions, unlike emotion displays, might be influenced by emotions, but not fully determined by them. In these cases the observer may have a difficult inference problem: should an action be explained by emotion, by desires or beliefs, or by some interaction of them?

Come up with a class of actions that you think is comes about by some combination of emotion and rational deliberation. Make a model that describes this causal process and explore the inferences an observer would make when seeing these actions.
