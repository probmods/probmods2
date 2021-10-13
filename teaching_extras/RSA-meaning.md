---
layout: exercise
title: On meaning in RSA
---

At it's core the RSA frameowork describes langauge use in a way that is fairly agnostic to the details of the language semantics. Indeed, RSA only assumes that there is a `meaning` function describing the relationship between utterances and situations (or worlds). 

Traditional compositional semantics builds up a meaning function by composing partial meanings along the way. Using composition allows fairly complex meaning functions to be specified compactly. For instance, if we want to allow utterances in which some number of adjectives modify a noun, we don't want to specify meaning separately for ever combination. 
For simplicity assume that these are *intersective* adjectives that combine by conjunction. 
Look through the meaning function below. How are the meanings of individual words composed? Try adding some additional adjectives!

~~~
// set of states (here: objects of reference)
// we represent objects as JavaScript objects to demarcate them from utterances.
// we will assume that if an object doesn't have a key then this property is false.
// we give each object a string name to make it eaiser to manipulate them.
var objects = [{blue: true, square: true, thing: true, name: "blue square"},
               {blue: true, circle: true, thing: true, name: "blue circle"},
               {green: true, square: true, thing: true, name: "green square"}]

// prior over world states
var objectPrior = function() {
  var obj = uniformDraw(objects)
  return obj
}

// set of utterances
var utterances = ["square", "circle", "thing",
"blue thing", "green thing", 
"blue square", "green square", 
"blue circle"]

// utterance cost function
var cost = function(utterance) {
  return 0;
};

// meaning function to interpret the utterances:
var hasProperty = function(obj, word){return _.has(obj, word) ? obj[word] : false}

var meaning = function(utterance, obj){
	var utterance = _.isArray(utterance) ? utterance : utterance.split(" ")
	var firstWordMeaning = hasProperty(obj, utterance[0])
	return utterance.length==1 ? firstWordMeaning : firstWordMeaning && meaning(_.drop(utterance),obj)
}

// literal listener
var literalListener = function(utterance){
  Infer(function(){
    var obj = objectPrior();
    condition(meaning(utterance, obj))
    return obj
  })
}

// set speaker optimality
var alpha = 1

// pragmatic speaker
var speaker = function(obj){
  Infer(function(){
    var utterance = uniformDraw(utterances)
    factor(alpha * (literalListener(utterance).score(obj) - cost(utterance)))
    return utterance
  })
}

// pragmatic listener
var pragmaticListener = function(utterance){
  Infer(function(){
    var obj = objectPrior()
    observe(speaker(obj),utterance)
    return obj.name
  })
}

viz.table(speaker(objects[0]))
viz.table(pragmaticListener("blue thing"))
~~~


## Better dogs

Psychological studies of categorization have suggested that category membership can be graded -- that is people do not always say either "yes" or "no" when asked if a given object belongs to a category.
Another way of saying this is that some objects are *better* members of the category than others.
How can we incorporate into our semantics the idea that some dogs are better, or more typical, dogs than others? 
What does the pragmatics do with this flexibility? Revise the above to have a graded degree for each property (rather than true or false), and revise the meaning function so that it uses this degree to randomly decide if the word is true or false each time. (A single word utterance should be true with probability equal to the graded degree associated with that property for the object in question.)

~~~
~~~

How will the choice of referring expression by the speaker depend on how good the target is as a member of each category? Play around with varying the typicality of the different objects for the different proprties!


### Dog dogs

If you are at the dog park and your friend refers to the "*dog* dog" you look for the very most typical dog. Under a deterministic semantics duplicating a noun will have no effects. (Why?) What happens in the stochastic semantics when a noun is duplicated? Set up a situation in which one object is a better square than another, while a third is not a square at all. How do the literal and pragmatic listeners interpret "square" vs "square square"?

~~~
~~~

### Expected meaning

Consider the following change to the literal listener:

~~~
// literal listener
var literalListener = function(utterance){
  Infer(function(){
    var obj = objectPrior();
//     condition(meaning(utterance, obj))
    var expectedMeaning = expectation(Infer(function(){meaning(utterance, obj)}))
    factor(Math.log(expectedMeaning))
    return obj
  })
}
~~~ 

We have replaced the (potentially stochastic) meaning function with the expected value of the meaning function. Convince yourself that this is an equivalent formulation. You might want to write down the probabilities involved explcitly; alternatively, you might want to reason about what a rejection sampler would do.

Once we have switched to expected meaning, it is reasonable to ask when we can push the expectation further into the meaning function. Can we replace the stochastic meaning of each word with a (deterministic, but real-valued) expected meaning? If we do so are composition laws preserved? Sometimes this is certainly the case: modify the conjunctive semantics above to use the expected truth value of each word. What operation replaces conjunction?

Assuming you have a meaning function that computes a stochastic Boolean result by composing together stochastic functions, can the expected meaning always be computed by first computing the expected meaning of the words and then composing in the same way? Why or why not?


## Just "dog"

A complete sentence, one that can intuitively be true or false, requires a verb. For instance "There is a vicious dog on my lawn." 
But in the right context we can convey an equivalent meaning with a fragmentary utterance, for instance just "dog". What do we need from semantics for communication with fragments to work?

Under a traditional, compositional semantics only complete sentences can be evaluated in a world to get a Boolean value. 
That is, the `meaning` function can only interpret complete sentences. (This is true whether the semantics is deterministic or stochastic.) In this case the only feasible way to interpret a fragment is if the listener *fills in* what must have been missing. On coherent way for a listener to do this is to assume a *noisy communication channel* that has deleted some words, and to jointly infer the true utterance and the world state. Fill in the missing condition in the model below to express the generative model that the `noise` function may have deleted words before they got to the listener:

~~~
///fold:
// set of states (here: objects of reference)
// we represent objects as JavaScript objects to demarcate them from utterances.
// we will assume that if an object doesn't have a key then this property is false.
// we give each object a string name to make it easier to manipulate them.
var objects = [{blue: true, square: true, thing: true, name: "blue square"},
               {blue: true, circle: true, thing: true, name: "blue circle"},
               {green: true, square: true, thing: true, name: "green square"}]

// prior over world states
var objectPrior = function() {
  var obj = uniformDraw(objects)
  return obj
}

// set of utterances
var utterances = ["square", "circle", "thing",
"blue thing", "green thing", 
"blue square", "green square", 
"blue circle"]

// utterance cost function
var cost = function(utterance) {
  return 0;
};

// meaning function to interpret the utterances:
var hasProperty = function(obj, word){return _.has(obj, word) ? obj[word] : false}

var meaning = function(utterance, obj){
	var utterance = _.isArray(utterance) ? utterance : utterance.split(" ")
	var firstWordMeaning = hasProperty(obj, utterance[0])
	return utterance.length==1 ? firstWordMeaning : firstWordMeaning && meaning(_.drop(utterance),obj)
}

// literal listener
var literalListener = function(utterance){
  Infer(function(){
    var obj = objectPrior();
    condition(meaning(utterance, obj))
    return obj
  })
}

// set speaker optimality
var alpha = 1

// pragmatic speaker
var speaker = function(obj){
  Infer(function(){
    var utterance = uniformDraw(utterances)
    factor(alpha * (literalListener(utterance).score(obj) - cost(utterance)))
    return utterance
  })
}
///

//channel noise model: drop each word with a fixed probability
var noise = function(utterance){
	filter(function(word){flip(0.2)}, utterance.split(" ")).join(" ")
}

// pragmatic listener
var pragmaticListener = function(utterance){
  Infer(function(){
    var obj = objectPrior()
    var trueUtterance = uniformDraw(utterances)
    condition( ... )//fill in
    observe(speaker(obj),trueUtterance)
    return obj.name
  })
}
~~~

In the earlier version (above) the utterance "blue" couldn't be interpreted because it wasn't in the set of possible utterances. (And it wasn't in the set of possible utterances because we wished to respect English grammar, which requires a noun for an adjective to modify.) Verify that this utterance can now be understood by the pragmatic listener. You can also examine how the listener completes the fragment into a full utterance. How is this affected by the context? 

(Bergen and Goodman (2015) further refine this noisy channel model by assuming speakers can take an action, roughly adding emphasis, that can reduce the probability that a listener will mishear a word. The pragmatic listener can make strong inferences from the fact that a speaker took pains to get a specific word across. This gives rise to certain *focus effects*, such as the interpretation difference between "the *big* dog" and "the big *dog*".)

A very different approach to interpreting fragments is to ask that the semantics always assigns some meaning even to fragments. This makes most sense when the semantics is already real valued, as in the expected meaning formulation above. Indeed, modern deep learning models of utterance interpretation generally have the property that any sequence of words can be assigned a (real-valued) meaning. Sentence fragments are thus automatically understood. This approach differs from the above noisy channel approach in that fragments are handled already in the literal listener, whereas the noisy channel models them as part of pragmatic inference. Discuss the benefits and drawbacks of the two approaches.


