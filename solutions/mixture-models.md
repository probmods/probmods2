---
layout: exercise
title: Mixture models - exercises
---

## Exercise 1. Social group reasoning

Our knowledge about the social world is *structured*: we do not just know a collection of facts about particular people but believe that there are *kinds* of people with shared properties. Even infants make strong assumptions about people based on what language they speak, what foods they eat, and what actions they take (check out Katherine Kinzler's work!) How do we learn this structure at the same time as we are learning about individual people? In this exercise you will explore mixture models as a formal model of how we reason about social groups.

### a)

Imagine you go to an alien planet and see 10 aliens: you notice three clear properties, some have antennae, some are green, and some make a distinctive 'blargh' noise.
Implement a simple model assuming that there are two kinds of aliens with different distributions over these properties, but you have a priori uncertainty over what the distributions are, and whether any particular alien belongs to group A or group B.

HINT: each data point we observed in the chapter only had one property (from k different values). Here each alien has three properties. This means we need a way of observing all three properties under their respective prototype priors.

~~~~
///fold:
var expectationOver = function(results, group) {
  return function(property) {
    return expectation(results, function(v) {return v[group][property]})
  }
}
///
var properties = ['antennae', 'green', 'blarghNoise']
var data = [
  {antennae : false, green: false, blarghNoise: false},
  {antennae : true,  green: true,  blarghNoise: true},
  {antennae : true,  green: true,  blarghNoise: true},
  {antennae : true,  green: true,  blarghNoise: true},
  {antennae : false, green: false, blarghNoise: false},
  {antennae : true,  green: true,  blarghNoise: true},
  {antennae : false, green: false, blarghNoise: false},
  {antennae : true,  green: true,  blarghNoise: true},
  {antennae : false, green: false, blarghNoise: false},
  {antennae : false, green: false, blarghNoise: false}
]

var sampleGroupPrototype = mem(function(groupName) {
  var probs = repeat(3, function(){ beta(.5, .5)})
  return _.zipObject(properties, probs)
})

var results = Infer({method: 'MCMC', kernel: {HMC: {steps: 10, stepSize: .01}}, 
                     samples: 3000}, function(){
  mapData({data: data}, function(datum) {
    var group = flip() ? 'group1' : 'group2';
    var prototype = sampleGroupPrototype(group)
    mapData({data: properties}, function(property) {
      observe(Bernoulli({p: prototype[property]}), datum[property])
    })
  })
  return {group1: sampleGroupPrototype('group1'), 
          group2: sampleGroupPrototype('group2')}
})
viz.bar(properties, map(expectationOver(results, 'group1'), properties))
viz.bar(properties, map(expectationOver(results, 'group2'), properties))
~~~~

### b)

Now imagine you hear a noise from inside a crater but you cannot see the alien that emitted it; this is a noisy observation. How can you use the model you learned above to make an educated guess about their other features?

~~~~
var results = Infer({method: 'MCMC', kernel: {HMC: {steps: 10, stepSize: .01}}, 
                     samples: 3000}, function(){
  mapData({data: data}, function(datum) {
    var group = flip() ? 'group1' : 'group2';
    var prototype = sampleGroupPrototype(group)
    mapData({data: properties}, function(property) {
      observe(Bernoulli({p: prototype[property]}), datum[property])
    })
  })
  var mysteryGroup = flip() ? 'group1' : 'group2'
  var mysteryPrototype = sampleGroupPrototype(mysteryGroup)
  observe(Bernoulli({p: mysteryPrototype['blarghNoise']}), true)
  
  return {group1: sampleGroupPrototype('group1'), 
          group2: sampleGroupPrototype('group2'),
          mysteryGroup: mysteryGroup }
})
viz.bar(properties, map(expectationOver(results, 'group1'), properties))
viz.bar(properties, map(expectationOver(results, 'group2'), properties))
marginalize(results, function(x) {
  x.mysteryGroup
})
~~~~


## Exercise 2: Detecting cheating

This problem is adapted from Section 6.5 of Lee \& Wagenmakers (2013).

Consider the practical challenge of detecting if people cheat on a test. For example, people who have been in a car accident may seek financial compensation from insurance companies by feigning cognitive impairment such as pronounced memory loss. When these people are confronted with a memory test that is intended to measure the extent of their impairment, they may deliberately under-perform. This behavior is called malingering, and it may be accompanied by performance much worse than that displayed by real amnesiacs. Sometimes, for example, malingerers may perform substantially below chance.

Malingering is not always easy to detect, but is naturally addressed by a mixture model. Using this approach, it is possible to infer which of two categories -- those who malinger, and those who are truthful or bona fide -- each person belongs to, and quantify the confidence in each of these classifications.
We consider an experimental study on malingering, in which each of p = 22 participants completed a memory test (Ortega, Wagenmakers, Lee, Markowitsch, & Piefke, 2012). One group of participants was told to do their best. These are the bona fide participants. The other group of participants was told to under-perform by deliberately simulating amnesia. These are the malingerers. Out of a total of n = 45 test items, the participants get 45, 45, 44, 45, 44, 45, 45, 45, 45, 45, 30, 20, 6, 44, 44, 27, 25, 17, 14, 27, 35, and 30 correct. Because this was an experimental study, we know that the first 10 participants were bona fide and the next 12 were instructed to malinger.

### a)

Implement a simple mixture model inferring which group each participant belongs to. Examine the posteriors over group-level parameters.

HINT: the group-level variables you are trying to infer are the error rates; it probably makes sense to assume that the malingerers are worse than bonafide participants, but have uncertainty over the values of each.

~~~~
var scores = [45, 45, 44, 45, 44, 45, 45, 45, 45, 45, 30, 20, 6, 44, 44, 27, 25, 17, 14, 27, 35, 30]
var subjIDs = _.range(scores.length)
var data = map(function(datum) {return _.zipObject(['subjID', 'score'], datum)}, _.zip(subjIDs, scores));

var inferOpts = {method: 'MCMC', //kernel: {HMC: {steps: 10, stepSize: .01}},
                 samples: 10000}
var results = Infer(inferOpts, function() {
  var group_1_p = uniform(0.5, 1)
  var group_2_p = uniform(0, group_1_p)
  var participant2Group = mem(function(participantID) {
    return flip() ? 'group1' : 'group2'
  })
  var group2Prob = mem(function(group) {
    return group == 'group1' ? group_1_p : group_2_p
  })
  
  var obsFn = function(datum){
    var p = group2Prob(participant2Group(datum.subjID))
    observe(Binomial({p: p, n: 45}), datum.score)
  }
  mapData({data: data}, obsFn)
  
  // Get participant group membership posteriors
  var participantResults_ = map(function(datum) {return participant2Group(datum.subjID)}, data)
  var participantResults = _.zipObject(_.range(participantResults_.length), participantResults_)
  // Merge overall group success probs
  return _.merge(participantResults, {group_1_p: group_1_p, group_2_p: group_2_p})
})

viz.marginals(results)
~~~~


### b)

Examine the posteriors over group membership for each participant. Did all of the participants follow the instructions? (i.e. are the first 10 inferred to be in one group and the next 12 in the other?)

*According to our run we infer that all the bonafides (10/10) followed the instructions, however 3/12 malingerers we're included with the bonafides! (Take a look at participants scores for 13 , 14, 21.)*

