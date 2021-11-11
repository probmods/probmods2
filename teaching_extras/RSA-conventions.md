---
layout: exercise
title: convention formation
---

You have just played an [iterated reference game](http://cogtoolslab.org:8888/tangrams_sequential/index.html) with objects that are initially hard to describe. Let's try to model this.

To start, here is a model of a single trial, in which the speaker has lexical uncertainty about the (real-valed) meanings of the words, with a [Beta](https://en.wikipedia.org/wiki/Beta_distribution) prior. There are two objects (bluecircle and redsquare) and there are four ambiguous words. 
Utterances consist of saying one or two words.  
First read through the code to make sure you understand this model. 
Try changing the priorCounts for the lexicon distirbution and the costWeight -- explain to yourselves how the utterance choices shift.

~~~
var words = ['word1', 'word2', 'word3', 'word4']
var utterances = ['word1', 'word2', 'word3', 'word4', 'word1_word2', 'word3_word4']
var objects = ['bluecircle', 'redsquare']

var params = {
  speakerAlpha : 2,
  listenerAlpha: 2,
  costWeight: 0.2,
  context: objects,
  utterances: utterances,
  objects: objects,
}

var sampleLexicon = function(counts) {
  //for each word, sample meaning from a beta distribution, given count params for that word
  _.zipObject(words, map(function(utt) {
    var blueProb = beta(counts[utt]['bluecircle'], counts[utt]['redsquare'])
    return {'bluecircle' : blueProb, 'redsquare' : 1 - blueProb}
  }, words))
}

var meaning = function(utt, target, params) {
  //get soft truth value for each word:
  var wordValues = map(function(word){params.lexicon[word][target]}, utt.split('_'))
  // use soft conjunction (ie product) for whole utterance meaning:
  return product(wordValues)
}

var getUttCost = function(utt) {
  return utt.split('_').length
}

var L0 = function(utt, params) {
  return Infer({method: "enumerate"}, function() {
        var obj = uniformDraw(params.context);
        factor(Math.log(meaning(utt, obj, params)));
        return obj;
      })
}

var S1 = function(obj, params) {
  return Infer({method: "enumerate"}, function() {
        var utt = uniformDraw(params.utterances);
        var utility = ((1-params.costWeight) * L0(utt, params).score(obj)
                       - params.costWeight * getUttCost(utt));
        factor(params.speakerAlpha * utility);
        return utt;
      })
}

var L1 = function(utt, params) {
  return Infer({method: "enumerate"}, function() {
        var obj = uniformDraw(params.context);
        factor(params.listenerAlpha * S1(obj, params).score(utt));
        return obj;
      })
}

var S_uncertain = function(object, counts) {
  return Infer(function() {
    var utt = uniformDraw(params.utterances);
    var lexicon = sampleLexicon(counts)
    var utility = ((1-params.costWeight) * L1(utt, extend(params, {lexicon})).score(object)
                   - params.costWeight * getUttCost(utt));

    factor(params.speakerAlpha * utility);
    return utt;
  });
}

var priorCounts = {word1: {bluecircle: 1, redsquare: 0.5},
                   word2: {bluecircle: 1, redsquare: 0.5},
                   word3: {bluecircle: 0.5, redsquare: 1},
                   word4: {bluecircle: 0.5, redsquare: 1}}

S_uncertain('bluecircle', priorCounts)
~~~

Now let's think about learning: If the speaker (or listener) use an utterance and see that it is correctly interpretted, this can be taken as evidence about the "true lexicon". Since we have chosen a beta prior, we can form a posterior by simply updating the counts with our new observation. (Thus if we observe "word1" being used for bluecircle, we would add one to the priorCounts entry, which is 1.) Simulate an iterated reference game "by hand" where on each trial you use the `S_uncertain` speaker to make utterance choices, then update the counts by hand to model learning. Do this several times. What happens to utterance choices over time?

(This posterior lexicon update is perhaps not quite right -- updating the counts directly implies treating the data as coming by the process of randomly choosing an utterance, then choosing an object according to the lexicon probability for this utterance. In fact the data would have come from the social process of a speaker choosing an utterance to convey a (randomly chosen) target. Dicuss with your group whether this is a reasonable idealization or not.)

This model is a somewhat simplified version of [this one](http://forestdb.org/models/conventions.html), where the ugly mechanics of updating counts and iterating has been done automatically. Now go play with this model. Under which assumptions to you see reduction in number of words over the course of the iterated game? Do the models always arrive at the same conventions?

In an earlier week we saw that a distibruion over lexicons which was symmetric (each of two words could equally mean each of two object, in expectation) could give rise to an M-implicature: an interpretation in which the cheaper word corresponds to the more a priori likely object. Interestingly, repeated exposure to such an M-implicature can lead this association to be lexicalized (meaning there is now an assymetry in the lexicon distribution). This is an interesting model of how pragmatic interpretation phenomena could find their way into the literal meanings over time. Try to capture this effect in the above model: first set up a situation in which you get an M-implicature on the first trial, then explore the lexicon learned after iterating this game.

