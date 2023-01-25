---
layout: exercise
title: Theory of Emotion
custom_js:
- assets/js/draw.js
- assets/js/paper-full.js
---

When humans think about other people, we consider their feelings as well as their beliefs, desires, and other cognitive states.
How can we integrate emotions into a theory of mind?
We will need to say what kind of values "emotion" should take, as well as how these states are causally related to other (observable and unobservable) states.
Here is a figure from [Ong, Soh, Zaki, Goodman (2019)](https://arxiv.org/abs/1903.06445), illustrating the potential causal relations in an intuitive theory of emotions:
![theory of emotion graphical model](../assets/img/ToE-fig.png)

# Appraisal

In the above diagram we see that emotion is the result of an *appraisal* process. 
We want to explore various `appraisal` functions to see what they will imply about judgments an observer makes about what someone is likely to feel in different situations.
First we have to decide what this function should return -- what is a (representation of another person's) emotion?
Intuitively, an emotional state is positive or negative, and can vary in degree -- that is it can be captured with a single real number.
Affective scientists have argued that emotion is experienced in a two dimensional space of valence and arousal. However these two dimensions are tightly related (in a roughly quadratic shape), so we will simplify to one dimension for now. 

Let's return to our friend Sally and her vending machine. Rather than just thinking about Sally's goal, we'll also think about how *much* she wants different outcomes, by using a utility function:

~~~~.norun
//Sally's belief (about the vending machine):
var vendingMachine = function(action) {
  return (action == 'a' ? categorical({vs: ['bagel', 'cookie'], ps: [.9, .1]}) :
          action == 'b' ? categorical({vs: ['bagel', 'cookie'], ps: [.1, .9]}) :
          'nothing')
}

//Sally's desire, represented now as a utility function:
var sallyDesire = function(state){ return state=='cookie' ? 10 : 1}
~~~~

Imagine that Sally presses button 'b' and gets a cookie. How happy is she?
As we see in the diagram above, emotion comes from an `appraisal` function, which depends on the outcome (what actually happened -- her actions and what she got).
One possibility is that appraisal simply returns how good or bad the outcome was for Sally.
Code a version of this simple appraisal model:

~~~~
//Sally's belief (about the vending machine):
var vendingMachine = function(action) {
  return (action == 'a' ? categorical({vs: ['bagel', 'cookie'], ps: [.9, .1]}) :
          action == 'b' ? categorical({vs: ['bagel', 'cookie'], ps: [.1, .9]}) :
          'nothing')
}

//Sally's desire, represented now as a utility function:
var sallyDesire = function(state){ return state=='cookie' ? 10 : 1}

var appraisal = function(outcomeState,action) {...}

//Let's see how Sally feels about different outcomes:
print(appraisal('cookie', 'a'))
print(appraisal('cookie', 'b'))
print(appraisal('bagel', 'a'))
print(appraisal('bagel', 'b'))
~~~~

You may have the intuition (as participants in experiments do) that how happy or sad Sally will be depends on not only what happened, but what she *expected* to happen. This is often captured by comparing the true reward (or utility) to the reward expected ahead of the outcome.
Code a version of this appraisal model (Hint: WebPPL's `expectation` operator may be useful):

~~~~
//Sally's belief (about the vending machine):
var vendingMachine = function(action) {
  return (action == 'a' ? categorical({vs: ['bagel', 'cookie'], ps: [.9, .1]}) :
          action == 'b' ? categorical({vs: ['bagel', 'cookie'], ps: [.1, .9]}) :
          'nothing')
}

//Sally's desire, represented now as a utility function:
var sallyDesire = function(state){ return state=='cookie' ? 10 : 1}

var expectedReward = function(action) {...}

var appraisal = function(outcomeState,action) {...}

//Let's see how Sally feels about different outcomes:
print(appraisal('cookie', 'a'))
print(appraisal('cookie', 'b'))
print(appraisal('bagel', 'a'))
print(appraisal('bagel', 'b'))
~~~~

Try changing the probabilities of different outcomes. Does Sally's emotion change in the ways you'd expect?

There are, in fact, several elements of outcome expectations that we can separate out. Some outcomes are unexpected but don't yield unexpected reward, other outcomes are only a bit unexpected but lead to very different reward. Appraisal could depend on these pieces (surprise, etc) to different extents. 
Code a version of the appraisal model where you can change the reliance of emotion on actual reward, expected reward, surprise (and any other factors you'd like): 

~~~~
//Sally's belief (about the vending machine):
var vendingMachine = function(action) {
  return (action == 'a' ? categorical({vs: ['bagel', 'cookie'], ps: [.9, .1]}) :
          action == 'b' ? categorical({vs: ['bagel', 'cookie'], ps: [.1, .9]}) :
          'nothing')
}

//Sally's desire, represented now as a utility function:
var sallyDesire = function(state){ return state=='cookie' ? 10 : 1}

var expectedReward = function(action) {...}

var surprise = function(outcomeState,action) {...}

var appraisal = function(outcomeState,action) {...}

//Let's see how Sally feels about different outcomes:
print(appraisal('cookie', 'a'))
print(appraisal('cookie', 'b'))
print(appraisal('bagel', 'a'))
print(appraisal('bagel', 'b'))
~~~~

Now play with different scenarios (e.g. change the outcomes from the vending machine, the probabilities, or Sally's utilities). You may want to extend the vending machine (and utility function) with additional outcomes, in order to explore differences between these quantities. Can you find cases where your intuitions of what Sally will feel constrain the `appraisal` model? That is, what experiment would you run in order to distinguish among your hypotheses about how people predict other people's emotions from the situation they are in?


## Other things to consider

- Emotions at one moment of time are influenced by emotions at past moments. How would you incorporate this temporal dynamics into the theory of emotion?
- Above we have assumed that Sally's emotion will depend on what she expected given her actual action, but not on other actions she *could have taken*. Intuitively the negative emotion of *regret* depends on counter-factual actions: what would have happened had I acted differently. How would you incorporate this into your model? Should it matter how "reasonable" the initial action was compared to alternatives? 
- Appraisal in the moment likely depends not on reward (or reward prediction error) for the current moment, but on expected future reward. This means that inferences about the current state, which affect expectations about future rewards, can affect emotion. So, for instance if Sally gets a package with a picture of a bagel on the front, she may think she will have to eat a bagel and be sad; if she then reads the fine print "Delicious cookie by San Fran Bagel Co" she may change her belief about what's in the bag and become happy. This is an example of *reappraisal*, where new information or interpretations can change emotional experience. Reappraisal in an important part of cognitive behavioral therapy... is it also a part of your intuitive theory of emotions?



# Emotion displays

Some things that people do are a (somewhat) direct result of their emotional experience. This includes facial expressions, body language, and perhaps some verbal ejaculations (e.g. grunts, cursing). This type of action is called an *emotion display*. Because emotion displays depend only on the emotion, they require a simple causal model, `emoDisplay(emotion)`, but they can be perceptually quite complex.

Let's think about facial expressions. For simplicity, let's imagine a facial expression is determined by four numbers: mouth angle (`ma`), mouth openness (`mo`), eyebrow height (`eh`), eyebrow angle (`ea`). Here we have provided a helper function to draw Sally!

~~~~
var showSally = function(faceParams) {
  var canvas = Draw(200, 200, true);
  canvas.circle(100,100,100, 5, '#ffa64d')
  //eyes:
  canvas.circle(50,75,10,'white','white')
  canvas.circle(52,75,5)
  canvas.circle(150,75,10,'white','white')
  canvas.circle(152,75,5)
  //eyebrows:
  canvas.squiggle(40,60-faceParams.eh, 0,0, 60,60-faceParams.eh-faceParams.ea, 0,0)
  canvas.squiggle(140,60-faceParams.eh-faceParams.ea, 0,0, 160,60-faceParams.eh, 0,0)
  //mouth:
  canvas.squiggle(25,125, 0,faceParams.ma, 175,125, 0,faceParams.ma)
  canvas.squiggle(25,125, 0,faceParams.ma+faceParams.mo, 175,125, 0,faceParams.ma+faceParams.mo)
}

showSally({ma: 0, mo: 5, eh: 0, ea: 0})
showSally({ma: 25, mo: 5, eh: 0, ea: 0})
showSally({ma: 30, mo: 20, eh: 5, ea: 5})
showSally({ma: -15, mo: 5, eh: 10, ea: -5})
~~~~

For fun, play around with the four parameters: can you make Sally look really happy? Mad? Sad? Worried? Surprised? Friendly? What else?

Ok, now to connect back to your intuitive theory of emotions. Fill in the function `emoDisplay` to connect an emotion to how it will be displayed.

~~~~
///fold:
var showSally = function(faceParams) {
  var canvas = Draw(200, 200, true);
  canvas.circle(100,100,100, 5, '#ffa64d')
  //eyes:
  canvas.circle(50,75,10,'white','white')
  canvas.circle(52,75,5)
  canvas.circle(150,75,10,'white','white')
  canvas.circle(152,75,5)
  //eyebrows:
  canvas.squiggle(40,60-faceParams.eh, 0,0, 60,60-faceParams.eh-faceParams.ea, 0,0)
  canvas.squiggle(140,60-faceParams.eh-faceParams.ea, 0,0, 160,60-faceParams.eh, 0,0)
  //mouth:
  canvas.squiggle(25,125, 0,faceParams.ma, 175,125, 0,faceParams.ma)
  canvas.squiggle(25,125, 0,faceParams.ma+faceParams.mo, 175,125, 0,faceParams.ma+faceParams.mo)
}
///

var emoDisplay = function(emotion) {
	...
	return {ma: ..., mo: ..., eh: ..., ea: ...}}

showSally(emoDisplay(10))
~~~~

Sometimes extreme positive and negative emotions lead to similar facial expressions. Does your model capture this?

How does emotion attribution from emotional displays work? When the observer sees Sally's face, he will attempt to infer her (unobservable) emotion state. Extend your model to capture this inference (Hint: to capture an observation that, for example, `ma=30` you may want to use a slightly noise observe, `observe(Gaussian({mu: ma, sigma:0.1}), 30)`):

~~~~
///fold:
var showSally = function(faceParams) {
  var canvas = Draw(200, 200, true);
  canvas.circle(100,100,100, 5, '#ffa64d')
  //eyes:
  canvas.circle(50,75,10,'white','white')
  canvas.circle(52,75,5)
  canvas.circle(150,75,10,'white','white')
  canvas.circle(152,75,5)
  //eyebrows:
  canvas.squiggle(40,60-faceParams.eh, 0,0, 60,60-faceParams.eh-faceParams.ea, 0,0)
  canvas.squiggle(140,60-faceParams.eh-faceParams.ea, 0,0, 160,60-faceParams.eh, 0,0)
  //mouth:
  canvas.squiggle(25,125, 0,faceParams.ma, 175,125, 0,faceParams.ma)
  canvas.squiggle(25,125, 0,faceParams.ma+faceParams.mo, 175,125, 0,faceParams.ma+faceParams.mo)
}
///

var emoDisplay = function(emotion) {
	...
	return {ma: ..., mo: ..., eh: ..., ea: ...}}

var observedFace = {ma: 30, mo: 15, eh: 5, ea: 5}

//what emotion will an observer infer from this face?

~~~~

Combine your model of facial expressions with your model above of appraisal: 

~~~~
~~~~

Explore the emotion attributions this model predicts. How do the outcome and the observed facial expressions trade off? A model like this can be used to capture the inferences people make in several "directions": from outcome and expression to emotion, from expression to outcome (via emotion), etc. Try a few of these inferences. 

Some people express emotions to different degrees, or just differently, in their facial expressions. (Everyone has that one really stoic friend who barely moves his mouth when he laughs, right?) How can you incorporate these individual differences into your model?

~~~~
~~~~

Notice that it now takes more observations from a person to make a confident attribution of their emotion from their facial expression! Why?


## Other things to consider

- When considering the range of expressions of even the simple cartoon Sally above, you may get the feeling that more than a single dimension is required. For instance, what unobserved emotion value would give rise to a "neutral surprised face"? How many dimensions do you think are required?
- There is debate among affective scientists how the complex emotional concepts we describe in natural language (happy, elated, pleased, loving; sad, depressed, anguished, angry, hangry) relate to the underlying dimensions of emotion experience. The intuitive theory of emotion can reflect these opinions, but it is also possible for the theory people have of others' emotions to diverge from how emotions "really work". This is an empirical question!


# Other actions

Some actions, unlike emotion displays, might be influenced by emotions, but not fully determined by them. (Well... largely determined by them.) In these cases the observer may have a difficult inference problem: should an action be explained by emotion, by desires or beliefs, or by some interaction of these factors?

Come up with a class of actions that you think arises from some combination of emotion and rational deliberation. Make a model that describes this causal process and explore the inferences an observer would make when seeing these actions.
