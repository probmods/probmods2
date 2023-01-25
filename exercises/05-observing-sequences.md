---
layout: exercise
title: Syntax models - exercises
---

<!-- TODO: these are good excercises for MM, HMM, PCFG applied to language. use them later in the book, on a section on langauge? or wherever these sequence moodels move to? -->

## Exercise 1: What word comes next?

a) In human languages, certain words are more likely to follow others. "The" is more likely to be followed by "dog" than "rhino", and even less likely to be followed by "sings". 

Let's consider a fragment of English consisting of only the words "dogs", "cats", "chase", and "sleep". This fragment does not contain punctuation or capital letters. Now, suppose that somebody says, "dogs chase cats". Determine how likely "chase" is to be followed by each word in the vocabulary.

HINT: In the partial code below, I set the 'onlyMAP' parameter for inference to 'true'. As a result, Infer() only returns the most likely (maximum a posteriori) result. You may find that this simplifies deriving the required distribution. To see what the consequences of 'onlyMAP' are, try setting it to 'false'. 

~~~~
//Helper function to compare arrays
var comparray = function(arr1,arr2){
  return (JSON.stringify(arr1) === JSON.stringify(arr2))
} 

var mm = Infer({method:'MCMC', burn:10000, samples: 50000, onlyMAP:true}, function() {
  
  var wordToDistribution = mem(function(word) {
    return dirichletDrift({alpha:ones([vocab.length,1]), concentration:10})
  })

  var transition = function(word) {
    return categorical({ps: wordToDistribution(word), vs: vocab})
  }

  //TODO ...
                
})

print(mm)
~~~~

b) Assume now that in addition to saying "dogs chase cats", your interlocutor said a second sentence. However, you only heard the first word, which again was "dogs". What is the distribution across likely second words in this sentence? NOTE: If you are not careful, you will end up assigning some probability to "undefined". Be careful.

~~~~
//Helper function to compare arrays
var comparray = function(arr1,arr2){
  return (JSON.stringify(arr1) === JSON.stringify(arr2))
} 

var mm = Infer({method:'MCMC', burn:10000, samples: 50000}, function() {
  
  var wordToDistribution = mem(function(word) {
    return dirichletDrift({alpha:ones([vocab.length,1]), concentration:10})
  })

  var transition = function(word) {
    return categorical({ps: wordToDistribution(word), vs: vocab})
  }

  //TODO ...
                
})

print(mm)
~~~~

c) Suppose again that somebody said "dogs chase cats". Now suppose they spoke another sentence, where again the second word was "chase". Show that the most likely first word was "dogs". 

~~~~
//Helper function to compare arrays
var comparray = function(arr1,arr2){
  return (JSON.stringify(arr1) === JSON.stringify(arr2))
} 

var mm = Infer({method:'MCMC', burn:10000, samples: 50000}, function() {
  
  var wordToDistribution = mem(function(word) {
    return dirichletDrift({alpha:ones([vocab.length,1]), concentration:10})
  })

  var transition = function(word) {
    return categorical({ps: wordToDistribution(word), vs: vocab})
  }

  //TODO ...
                
})

viz(mm)
~~~~

## Exercise 2: Hidden Markov Model

a) Return to the model from Exercise 1b. Suppose that the second sentence, instead of beginning with "dogs", began with "cats". Provide the marginal distribution on the second word of that sentence. 

~~~~
//Helper function to compare arrays
var comparray = function(arr1,arr2){
  return (JSON.stringify(arr1) === JSON.stringify(arr2))
} 

var mm = Infer({method:'MCMC', burn:10000, samples: 50000}, function() {
  
  var wordToDistribution = mem(function(word) {
    return dirichletDrift({alpha:ones([vocab.length,1]), concentration:10})
  })

  var transition = function(word) {
    return categorical({ps: wordToDistribution(word), vs: vocab})
  }

  //TODO ...
                
})

viz(mm)
~~~~

b) In Exercise 2a, you should have found that an ungrammatical sequence like "cats cats" is as likely as a grammatical sequence like "cats sleep". Why is this?

c) Let's try a hidden Markov model instead. Note that two of the words in our fragment of English are nouns ("dogs", "cats") and two are verbs ("chase", "sleep").

Model sentence generation as involving Markov transitions between parts of speech, rather than between the words themselves. 

~~~~

//Helper function to compare arrays
var comparray = function(arr1,arr2){
  return (JSON.stringify(arr1) === JSON.stringify(arr2))
} 

var POS = ["N","V","STOP"]
var N = function() {return uniformDraw(['dogs','cats'])}
var V = function() {return uniformDraw(["chase","sleep"])}

//TODO -- generative model goes here.

var sentence = //TODO
  
print(sentence)

~~~~

d) Try Exercise 2a, but using our new hidden Markov model. Show that we are now more likely to get the grammatical phrases "cats chase" or "cats sleep" than "cats cats" or "cats dogs". 

~~~~
//Helper function to compare arrays
var comparray = function(arr1,arr2){
  return (JSON.stringify(arr1) === JSON.stringify(arr2))
} 

var POS = ["N","V","STOP"]
var N = function() {return uniformDraw(['dogs','cats'])}
var V = function() {return uniformDraw(["chase","sleep"])}

var hmm = Infer({method:'MCMC', burn:10000, samples: 50000, lag:10, onlyMAP:true}, function() {

	//TODO

})
  
viz(hmm)

~~~~

## Exercise 3: Phrase structure grammars

a) Extend your hidden Markov model from Exercise 2 so that our fragment of English additionally includes the determiners "the" and "a" as well as the adverb "diligently". Condition on "The dog chases a cat" being a sentence in the language and generate some additional sentences. 

~~~~
var uniformDraw = function (xs) {return xs[randomInteger(xs.length)]};

var D  = function() {return uniformDraw(['the', 'a'])};
var N  = function() {return uniformDraw(['cat', 'dog'])};
var V  = function() {return uniformDraw(['chases', 'sleeps'])}
var A  = function() {return uniformDraw(['diligently'])}

//TODO
~~~~

b) Let us consider a phrase structure grammar for our English fragment instead, modeled on the one in Chapter 5. Again, condition on "The dog chases a cat" being a sentence in the language and generate some additional sentences. 

~~~~
var uniformDraw = function (xs) {return xs[randomInteger(xs.length)]};

var D  = function() {return uniformDraw(['the', 'a'])};
var N  = function() {return uniformDraw(['cat', 'dog'])};
var V  = function() {return uniformDraw(['chases', 'sleeps'])}
var A  = function() {return uniformDraw(['diligently'])}
var AP = function() {return uniformDraw([A()])}
var NP = function() {return [D(), N()]}
var VP = function() {return uniformDraw([[V(), AP()],
                                         [V(), NP()]])}
var S  = function() {return [NP(), VP()]}

//TODO
~~~~

c) Which model produced better English sentences, the hidden Markov model in Exercise 3a or the phrase structure grammar model in Exercise 3b? Why do you suppose that is?

