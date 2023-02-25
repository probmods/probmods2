---
layout: exercise
title: Theory of Emotion
custom_js:
- assets/js/draw.js
- assets/js/paper-full.js
---

# Suchow creativity algorithm

Here is a fairly straightforward implementation of the example given by Suchow and colleagues of word search. Here, there are 3 cue words and 6 potential targets. The goal is to find a word from the target list that is closely related to all three cues. Similarity here is strictly ordinal: each word in each vector is successfully less related to the start word. 



~~~~
var words = function(cue){
  return(cue == "falling" ? ["air", "asleep", "star", "curtain", "dirt", "actress"] :
         cue == "actor" ? ["actress", "star", "curtain", "asleep", "dirt"] :
         cue == "dust" ? ["dirt", "air", "star", "curtain", "asleep", "actress"] :
         cue == "asleep" ? ["star", "curtain", "air", "dirt", "actress"] :
         cue == "air" ? ["star", "curtain", "dirt", "asleep", "actress"] :
         cue == "star" ? ["air", "actress", "asleep", "curtain", "dirt"] :
         cue == "curtain" ? ["air", "asleep", "actress", "star", "dirt"] :
         cue == "actress" ? ["star", "curtain", "asleep", "dirt", "air"] :
         cue == "dirt" ? ["curtain", "air", "asleep", "actress", "star"] :
         6)
}
    
var propose = function(current){
    var dist = Math.min(sample(Poisson({mu: .6})), 4)
    return words(current)[dist]
}

var prob = function(w) {
    var meandist = Math.round(1/3*(words("falling").indexOf(w) + words("actor").indexOf(w) + words("dust").indexOf(w)))
    return Poisson({mu:.6}).score(meandist)
      
}

var accept_prob = function(word1, word2){
    return(Math.min(1, 
                    (Math.exp(prob(word2))*Math.exp(Poisson({mu: 1}).score(words(word2).indexOf(word1)+1)))/
                    (Math.exp(prob(word1))*Math.exp(Poisson({mu: 1}).score(words(word1).indexOf(word2)+1)))
                   ))
}

var transition = function(word1){
  var proposal = propose(word1)
  return flip(accept_prob(word1, proposal)) ? 
    proposal : 
    word1
}

var mcmc = function(state, iterations){
  return ((iterations == 1) ? [state] : mcmc(transition(state), iterations-1).concat(state))
}

var findword = function(iterations){
  var startword = sample(Categorical({vs: ["falling","actor","dust"], ps: [1/3, 1/3, 1/3]}))
  return mcmc(startword, iterations)
}

viz(findword(10000))
findword(40)
~~~~

As can be seen, the chain will hop around a bit until it lands on 'air' and then generally stick there. (Making this happen took some playing with the Poisson distributions. You might choose different mus and see how it affects the probability of transitioning.)