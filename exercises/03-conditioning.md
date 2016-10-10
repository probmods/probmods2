---
layout: exercise
title: Conditioning - exercises
custom_js:
- assets/js/box2d.js
- assets/js/phys.js
---

## Exercise 1: Conditioning and prior manipulation

In the earlier [Medical Diagnosis]({{site.baseurl}}/chapters/02-generative-models.html#example-causal-models-in-medical-diagnosis) section we suggested understanding the patterns of symptoms for a particular disease by changing the prior probability of the disease such that it is always true (also called the *do* operator).

a) For this example, does intervening on the program in this way have the same effect as *conditioning* on the disease being true? What about the casual dependency makes this case?

b) Why would intervening have a different effect than conditioning for more general hypotheticals? Construct an example where they differ. Then translate this into a WebPPL model and show that manipulating the prior gives different answers than manipulating the observation. (Hint: think about the effect of intervening vs. conditioning on a variable that has a **causal parent** on that parent.)

## Exercise 2: Computing marginals

Use the rules for computing probabilities to compute the marginal distribution on return values from these WebPPL programs by hand (use `viz()` to check your answers):

~~~~
Infer({method: "enumerate"}, function() {
  var a = flip();
  var b = flip();
  condition(a || b);
  return a;
})
~~~~

~~~~
Infer({method: "enumerate"}, function() {
  var nice = mem(function(person) {return flip(.7)});
  var smiles = function(person) {return nice(person) ? flip(.8) : flip(.5);}
  condition(smiles('alice') && smiles('bob') && smiles('alice'));
  return nice('alice');
})
~~~~

## Exercise 3: Extending the smiles model

a) Describe (using ordinary English) what the second WebPPL program above means.

~~~~
~~~~

b) Write a version of the model that captures these two intuitions: (1) people are more likely to smile if they want something and (2) *nice* people are less likely to want something.

~~~~

~~~~

c) Use this extended model to compute the posterior belief that someone wants something from you, given that they are smiling and have rarely smiled before? In your answer, show the WebPPL inference and a histogram of the answers -- in what ways do these answers make intuitive sense or fail to?

~~~~

~~~~


## Exercise 4: Casino game

Consider the following game. A machine randomly gives Bob a letter of the alphabet; it gives a, e, i, o, u, y (the vowels) with probability 0.01 each and the remaining letters (i.e., the consonants) with probability 0.047 each. The probability that Bob wins depends on which letter he got. Letting $$h$$ denote the letter and letting $$Q(h)$$ denote the numeric position of that letter (e.g., $$Q(\text{a}) = 1, Q(\text{b}) = 2$$, and so on), the probability of winning is $$1/Q(h)^2$$. Suppose that we observe Bob winning but we don't know what letter he got. How can we use the observation that he won to update our beliefs about which letter he got? Let's express this formally. Before we begin, a bit of terminology: the set of letters that Bob could have gotten, $$\{a, b, c, d, ..., y, z\}$$, is called the *hypothesis space* -- it's our set of hypotheses about the letter.

a) In English, what does the posterior probability $$p(h \mid \text{win})$$ represent?

b) Manually compute $$p(h \mid \text{win})$$ for each hypothesis (Excel or something like it is helpful here). Remember to normalize - make sure that summing all your $$p(h \mid \text{win})$$ values gives you 1.

Now, we're going to write this model in WebPPL using `Infer`. Here is some starter code for you:

~~~~
// define some variables and utility functions
var checkVowel = function(letter) {return _.contains(['a', 'e', 'i', 'o', 'u'], letter);}
var letterVals = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
                  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
var letterProbs = map(function(letter) {return checkVowel(letter) ? 0.01 : 0.047;}, letterVals);
var letters = Categorical({vs: letterVals, ps: letterProbs})

// Compute p(h | win)
var distribution = Infer({method: 'enumerate'}, function() {
  var letter = sample(letters);
  var position = letterVals.indexOf(letter) + 1; 
  var winProb = 1 / Math.pow(position, 2);
  condition(...)
  return ...
});
viz.auto(distribution);
~~~~

c) What does the `Categorical` function do (hint: check the [docs](http://webppl.readthedocs.io/en/master/distributions.html))? Use `Categorical` to express this distribution:

|x    | P(x)|
|---- | -----|
|red  | 0.5|
|blue | 0.05|
|green| 0.4|
|black| 0.05|	

~~~~ 
var distribution = Categorical(...)
~~~~

d) Fill in the `...`'s in the code to compute $$p(h \mid \text{win})$$. Include a screenshot of the resulting graph. What letter has the highest posterior probability? In English, what does it mean that this letter has the highest posterior? Make sure that your WebPPL answers and hand-computed answers agree -- note that this demonstrates the equivalence between the program view of conditional probability and the distributional view.

e) Which is higher, $$p(\text{vowel} \mid \text{win})$$ or $$p(\text{consonant} \mid \text{win})$$? Answer this using the WebPPL code you wrote (hint: use the `checkVowel` function)

f) What difference do you see between your code and the mathematical notation? What are the advantages and disadvantages of each? Which do you prefer?
