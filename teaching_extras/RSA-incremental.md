---
layout: exercise
title: Incremental RSA
---

To warm up, let's make a standard RSA model that generates the utterances by iteratively extending the string.
The function `extend` provides a (very simple) generative grammar for adding one word to a partial utterance; the function`sampleUtt` iteratively applies this until a `"."` is reached.

~~~~
// we represent objects as strings of properties.
var objects = ["big blue circle",
               "big green circle",
               "small blue square"]

//a (soft) meaning function that combines word meanings by *:
var meaning = function(utterance, obj){
	var firstWordMeaning = _.includes(obj, utterance[0])?1:0.01
	return utterance.length==1 ? firstWordMeaning : firstWordMeaning * meaning(_.drop(utterance),obj)
}

//   a "grammar" to define the utterances 
var adjs = ["green", "blue", "big", "small"]
var nouns = ["circle", "square"]
var extend = function(prefix){
  if(prefix.length==2 || flip(0.5)){
    return prefix.concat([uniformDraw(nouns), "."])
  } else {
    return prefix.concat([uniformDraw(adjs)])
  }
}
var sampleUtt = function(prefix){
  var prefix = prefix==undefined ? [] : prefix
  return _.last(prefix) == "."?prefix:sampleUtt(extend(prefix))
}

var L0 = cache(function(utterance) {
  return Infer(function(){
    var obj = uniformDraw(objects)
    factor(Math.log(meaning(utterance,obj)))
    return obj
  })
})

var alpha=4
var S1 = function(target) {
  return Infer(function(){
    var utt = sampleUtt()
    //   evaluated as usual in terms of listener goodness
    factor(alpha*L0(utt).score(target))
    return utt.join(" ")
  })
}

S1("big blue circle")
~~~~

Notice that the meaning function defined above will return a value from a partial utterance.
How can we use this incremental meaning to select informative utterances a little bit at a time? We repeatedly use an RSA speaker where the "action" is to extend the prefix with an additional word. Before running the below model examine the structure of the computation -- notice how the recursive extension of the utterance has been "lifted" outside the speaker inference.

~~~~
// we represent objects as strings of properties.
var objects = ["big blue circle",
               "big green circle",
               "small blue square"]

//a meaning function that can return a value for incomplete meanings:
var meaning = function(utterance, obj){
	var firstWordMeaning = _.includes(obj, utterance[0])?1:0.01
	return utterance.length==1 ? firstWordMeaning : firstWordMeaning * meaning(_.drop(utterance),obj)
}

//   a "grammar" to define the utterances 
var adjs = ["green", "blue", "big", "small"]
var nouns = ["circle", "square"]
var extend = function(prefix){
  if(prefix.length==2 || flip(0.5)){
    return prefix.concat([uniformDraw(nouns), "."])
  } else {
    return prefix.concat([uniformDraw(adjs)])
  }
}

var L0 = cache(function(utterance) {
  return Infer(function(){
    var obj = uniformDraw(objects)
    factor(Math.log(meaning(utterance,obj)))
    return obj
  })
})

var alpha=4
var S1_extend = cache(function(prefix, target) {
  return Infer(function(){
    //   consider the ways to extend the prefix by one token
    var utt = extend(prefix)
    //   evaluated as usual in terms of listener goodness
    factor(alpha*L0(utt).score(target))
    return utt
  })
})

var sampleUttS1 = function(target, prefix) {
  var prefix = prefix==undefined ? [] : prefix
  return _.last(prefix) == "."?prefix:sampleUttS1(target,sample(S1_extend(prefix, target)))
}

Infer(function(){sampleUttS1("big blue circle").join(" ")})
~~~~

Compare the results from this incremental model to the full RSA model above. There is a lot to understand in this result! (Compare: "blue circle" vs "circle"; "big blue circle" vs "blue big circle";...) Explore what happens when you change the set of objects in the context. 

## Word order across languages

Spanish puts the adjectives after the noun (as do many other languages). Model this by modifying the "grammar" above. How does this change utterance preferences? Does it also change utterance preferences for full (non-incremental) RSA?

Cf. experimental data showing differences in adjective production across langauges: [Rubio-Fernandez, P., Mollica, F., & Jara-Ettinger, J. (2021). Speakers and listeners exploit word order for communicative efficiency: A cross-linguistic investigation. Journal of Experimental Psychology: General](https://psycnet-apa-org.stanford.idm.oclc.org/record/2020-69516-001)


## Incremental listeners

Evidence from eye-tracking in the "visual world" paradigm has shown that listeners pragmatically disambiguate utterances before they are complete. Let's explore what a listener can infer from a sentence prefix, if they assume the speaker generates utterances incrementally:

~~~
// we represent objects as strings of properties.
var objects = ["big blue circle",
               "big green circle",
               "small blue square"]

//a meaning function that can return a value for incomplete meanings:
var meaning = function(utterance, obj){
	var firstWordMeaning = _.includes(obj, utterance[0])?1:0.01
	return utterance.length==1 ? firstWordMeaning : firstWordMeaning * meaning(_.drop(utterance),obj)
}

//   a "grammar" to define the utterances 
var adjs = ["green", "blue", "big", "small"]
var nouns = ["circle", "square"]
var extend = function(prefix){
  if(prefix.length==2 || flip(0.5)){
    return prefix.concat([uniformDraw(nouns), "."])
  } else {
    return prefix.concat([uniformDraw(adjs)])
  }
}

var L0 = cache(function(utterance) {
  return Infer(function(){
    var obj = uniformDraw(objects)
    factor(Math.log(meaning(utterance,obj)))
    return obj
  })
})

var alpha=4
var S1_extend = cache(function(prefix, target) {
  return Infer(function(){
    //   consider the ways to extend the prefix by one token
    var utt = extend(prefix)
    //   evaluated as usual in terms of listener goodness
    factor(alpha*L0(utt).score(target))
    return utt
  })
})

//helper to iterate over prefixes, observing that speaker chose next word
var observePrefixes = function(obj,prefix) {
  if(prefix.length>0){
    observe(S1_extend(_.dropRight(prefix),obj), prefix)
    observePrefixes(obj,_.dropRight(prefix))
  }
}

var L1 = function(prefix){
  return Infer(function(){
    var obj = uniformDraw(objects)
    observePrefixes(obj,prefix)
    return obj
  })
}

L1(["big"])
~~~

An alternative model of incremental listening would be to assume the speaker chooses a complete utterance, but has said only the first few words. That is, this listener would use a full (standard) S1 speaker, and imagine complete utterances from the prefix they heard. Implement this incremental listener and compare to the incremental listener reasoning about an incremental speaker, above.

Finally, think about the algorithmic complexity of enumeration for these three models (standard full L1 / full S1, incremental L1 / full S1, incremental L1 / incremental S1). How big are the search spaces in each case?


## Revisiting incremental meanings

The incremental models so far required an incremental meaning function that returns a value for any object and utterance prefix.
What if the meaning of the sentence doesn't make sense for a prefix? For instance consider "light" and "dark" -- "light red" can be evaluated, but "light" alone? This is even more true for more complex sentences. For instance, it is entirely unclear how "some of the ..." should be interpretted!
Because we care what the prefix will ultimately contribute to the sentence we can define an incremental meaning as the expectation over completions:

~~~~
// incrementalizing a meaning function by marginalizing over completions
var incrMeaning = function(prefix, obj) {
  return _.last(prefix) == "." ? meaning(prefix,obj) : 
  expectation(Infer(function(){incrMeaning(extend(prefix),obj)}))
}
~~~~

Compare this meaning to the original incremental meaning for the semantics used in the above examples; in what ways do they change the speaker or listener predictions?

The expected-complete-meaning method can be used to incrementalize any truth functional semantics, but notice that it is very expensive, requiring an expectation over completions for every candidate intrepretation. Discuss this tradeoff and how you think human language processing may work.
