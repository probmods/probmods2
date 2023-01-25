---
layout: exercise
title: Manner implicature and friends
---

There is regular singing and there is.. not so good singing. There are two was to say the same thing: "Miss X sang the anthem" and "Miss X produced a series of sounds that corresponded closely with the
score of the anthem." Which utterance refers to which singing event? As another example, "He killed the sheriff" conveys murder while "He caused the sheriff to die" conveys some less direct causal process. What about "pink" compared to "light red"?

These examples illustrate a general phenomenon: a *marked* (long, unusual, awkward) utterance is interpreted as conveying a *marked* (unusual, etc) situation. Grice described these instances as arising from violation of his maxim of Manner, hence "manner implicature" or M-implicature. (See Rett, 2020 for a nice exposition.)

How does this play out in formal pragmatics models? We would hope, since the RSA utility formalizes Grice's maxims, that these inferences would arise naturally.
Suppose we have two utterance that mean the same thing, but one is less costly. 
Suppose also that we have to objects that could be referred to, but one is more likely (or more salient). Does the cheaper phrase go with the more likely target? We implement this in standard RSA:

~~~
//two objects, one is an priori more likely referent, the other is marked because it's unusual.
var objectPrior = function() {
  return categorical({vs: ["plain thing", "marked thing"], ps: [0.7, 0.3]})
}

// two words, one is longer. "thing" and "tthhiing" both apply to both objects.
var lexicon = {thing: ["plain thing", "marked thing"], tthhiing: ["plain thing", "marked thing"]}

var utterances = _.keys(lexicon)

var cost = function(utterance) {
  return utterance.length
}

//meaning function, check if object is in word extension, with a little noise
var meaning = function(utterance, obj){
  return _.includes(lexicon[utterance], obj)?flip(0.9):flip(0.1)
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
    return obj
  })
}

viz.table(pragmaticListener("thing"))
viz.table(pragmaticListener("tthhiing"))
~~~

Standard RSA predicts that objects interpretations match prior probabilities for both words. How can we break the symmetry in interpretation, without building it in *a priori* in the meanings? One method, *lexical uncertainty* (Bergen, Levy, Goodman, 2016), posits that each word might have a more specific meaning -- applying to only one object -- but the listener doesn't know which. When a pragmatic listener isn't sure how a speaker uses words they have to infer this jointly with the intended object. Implement this lexical uncertainty idea:

~~~

~~~

Does the M-implicature now arise? How much does this depend on the possible meanings your listener entertains? Does the M-implicature still arise if the literal listener infers the meanings (instead of the pragmatic listener)?

## Direct or indirect causation

When you hear "John caused the vase to break" you probably imagine an atypical or more complex situation than when you hear "John broke the vase". This could indicate that the lexical semantics of "break" is subtly different than "cause to break". An alternative hypothesis is that these are the same, but an M-implicature arises due to their different lengths.

Let's formalize this with a world model in which there is an immediate causal chain that leads from John to the broken vase and also a chain that has an intermediate event. Either: John bumped the vase, it fell over and broke; or, John bumped a lamp, which bumped into the vase, so it fell over and broke. Because there is a longer causal path, the latter will be less likely.

~~~
var JBV = flip(0.2)
var JBL = flip(0.2)
var LBV = JBL ? flip(0.8) : false
var VB = (JBV || LBV) ? flip(0.8) : false
~~~

For simplicity, assume that both utterances could refer to either *john bumped the vase and the vase broke* (`JBV && VB`) or *john bumped the lamp and the vase broke* (`JBL && VB`). (Note that this is probably not exactly what *cause* means. Lewis, Gerstenberg, and many others suggest that the meaning involves a counterfactual: that the vase broke but if john hadn't been there it wouldn't have.) Implement these meanings in an RSA model, add lexical uncertainty about whether `JBV` or `JBL` is the intended meaning of "John ...", and verify that the pragmatic listener draws the correct interpretations.

~~~
~~~


## Other M-implicatures

Notice that in the above causation example the lexical uncertainty arose out of ambiguity: it was ambiguous whether "John" in the sentence "John broke the vase" referred to the event of John bumping the vase (`JBV`) or John bumping the lamp (`JBL`). By resolving this ambiguity at the pragmatic listener level we introduced the opportunity for M-implicature.

This analysis suggests that any ambiguity in meaning could in principle give rise to M-implicature. Come up with several sources of ambiguity in language and see whether you think they can lead to M-implicature! 

So far we've talked about ambiguity in terms of uncertainty about the whole lexicon. An alternative, and equivalent, formulation is to introduce *free variables* into the meaning function. These free variables represent under-specification in the semantics that can be filled in by context. Lifting these variables from the literal listener to the pragmatic listener yields a variety of interesting effects, such as vagueness (See Lassiter and Goodman, 2015).


