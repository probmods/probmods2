---
layout: exercise
title: Conditioning - solutions
custom_js:
- assets/js/box2d.js
- assets/js/physics.js
---

## Exercise 1: Fair coins and biased coins

### a)

> I flip a fair coin. What is the probability that it lands heads?

0.5

~~~~
var model = function() {
  flip() ? "H" : "T";
}
var log_prob = Infer({method:'enumerate'}, model).score('H')
Math.exp(log_prob)
~~~~

### b)

> I also have a biased coin, with $$P(\text{heads})=0.9$$.
> I hand you one of the coins (either biased or fair) without telling you which.
> You flip it three times.
>
> Given that first two coin flips landed on heads, what is the posterior distribution for the next flip?

P(Heads) = 0.8056603773584906

~~~~
var flip_coin = function(coin_type) {
  return coin_type=="fair" ? flip() : flip(0.9);
}

var model = function() {
  var coin_type = flip() ? "fair" : "biased";
  
  var flip1 = flip_coin(coin_type);
  var flip2 = flip_coin(coin_type);
  var flip3 = flip_coin(coin_type);

  // first 2 flips are `true`
  condition(flip1 && flip2);

  // what is the next flip going to be?
  return flip3;
}

viz.table(Infer({method:'enumerate'}, model))
~~~~

### c)

> Given that all three flips landed on heads, what is the probability that the coin was biased?

P(biased) = 0.8536299765807963

~~~~
var flip_coin = function(coin_type) {
  return coin_type=="fair" ? flip() : flip(0.9);
}

var model = function() {
  var coin_type = flip() ? "fair" : "biased";
  
  var flip1 = flip_coin(coin_type);
  var flip2 = flip_coin(coin_type);
  var flip3 = flip_coin(coin_type);

  // first 2 flips are `true`
  condition(flip1 && flip2 && flip3);

  // what is the next flip going to be?
  return coin_type;
}

viz.table(Infer({method:'enumerate'}, model))
~~~~

### d)

> Given that the first two flips were different, what is the probability that the third flip will be heads?

P(Heads) = 0.6058823529411763

~~~~
var flip_coin = function(coin_type) {
  return coin_type=="fair" ? flip() : flip(0.9);
}

var model = function() {
  var coin_type = flip() ? "fair" : "biased";
  
  var flip1 = flip_coin(coin_type);
  var flip2 = flip_coin(coin_type);
  var flip3 = flip_coin(coin_type);

  // first 2 flips are `true`
  condition(flip1 != flip2);

  // what is the next flip going to be?
  return flip3;
}

viz.table(Infer({method:'enumerate'}, model))
~~~~

## Exercise 2: Conditioning and Intervention

> In the earlier [Medical Diagnosis]({{site.baseurl}}/chapters/02-generative-models.html#example-causal-models-in-medical-diagnosis) section we suggested understanding the patterns of symptoms for a particular disease by changing the prior probability of the disease such that it is always true (also called the *do* operator).

### a)

> For this example, does intervening on the program in this way (e.g. by setting the value of `lungCancer`) have the same effect as *conditioning* on the disease being true? What about the casual dependency makes this case?

In *this* example, intervening on `lungCancer` or conditioning on it has the same effect on `cough`. The reason for this is that `lungCancer` is a cause of `cough` and it's not causally dependent on any other variable in the program.

~~~~
// original
display("original")
viz.table(Infer({method: "enumerate"}, function() {
  var lungCancer = flip(0.01);
  var cold = flip(0.2);
  var cough = (
    (cold && flip(0.5)) ||
    (lungCancer && flip(0.3))
  )
  return cough;
}));

// intervention
display("intervention")
viz.table(Infer({method: "enumerate"}, function() {
  var lungCancer = true;
  var cold = flip(0.2);
  var cough = (
    (cold && flip(0.5)) ||
    (lungCancer && flip(0.3))
  )
  return cough;
}));


// conditioning
display("conditioning")
viz.table(Infer({method: "enumerate"}, function() {
  var lungCancer = flip(0.01);
  condition(lungCancer);
  var cold = flip(0.2);
  var cough = (
    (cold && flip(0.5)) ||
    (lungCancer && flip(0.3))
  )
  return cough;
}));
~~~~

### b) 

> Why would intervening have a different effect than conditioning for more general hypotheticals? Construct an example where they differ. Then translate this into a WebPPL model and show that manipulating the prior gives different answers than manipulating the observation. *Hint:* think about the effect that intervening vs. conditioning on a variable that has a **causal parent** would have on that parent.

Conditioning on a causally downstream variable can inform us about what the value of the causal parent *might have been*, but intervention breaks that statistical dependence.

~~~~
// original
display("original")
viz.table(Infer({method: "enumerate"}, function() {
var A = 
}));

// intervention
display("intervention")
viz.table(Infer({method: "enumerate"}, function() {
var lungCancer = true;
var cold = flip(0.2);
var cough = (
  (cold && flip(0.5)) ||
  (lungCancer && flip(0.3))
)
return cough;
}));


// conditioning
display("conditioning")
viz.table(Infer({method: "enumerate"}, function() {
var lungCancer = flip(0.01);
condition(lungCancer);
var cold = flip(0.2);
var cough = (
  (cold && flip(0.5)) ||
  (lungCancer && flip(0.3))
)
return cough;
}));
~~~~

## Exercise 3: Computing marginals

> Use the rules for computing probabilities to compute the marginal distribution on return values from these programs by hand (use `viz()` to check your answers):

### a)

    
<!--     a=T (0.5)                     a=F (0.5)
    /        \                   /        \
b=T (0.5)   b=F (0.5)      b=T (0.5)    b=F (0.5)
   ✓             ✓             ✓            ☓ -->

$$ P(a \mid a \lor b) = \frac{ P(a \land (a \lor b)) } { P(a \lor b) } = \frac{P(a)} {P(a \lor b)} = \frac{0.5} {1 - P(!a \land !b)} = \frac{0.5} {1 - (0.5)\cdot(0.5)} = 2/3 $$


~~~~
viz.table(Infer({method: "enumerate"}, function() {
  var a = flip();
  var b = flip();
  condition(a || b);
  return a;
}))
~~~~

### b)

~~~~
var smilesModel = function() {
  var nice = mem(function(person) {return flip(.7)});
  var smiles = function(person) {return nice(person) ? flip(.8) : flip(.5);}
  condition(smiles('alice') && smiles('bob') && smiles('alice'));
  return nice('alice');
}

viz.table(Infer({method: "enumerate"}, smilesModel))
~~~~

Using Bayes rule:

$$ P(N_A \mid S_A, S_B, S_A) \propto P(S_A, S_B, S_A \mid N_A) P(N_A) $$

Alice is nice:

$$ P(S_A | N_A)^2 P(S_B | N_A) P(N_A) = P(S_A | N_A)^2 \left(P(S_B | N_B)P(N_B) + P(S_B | !N_B)P(!N_B)\right) P(N_A) = 0.31808 $$

Alice isn't nice:

$$ P(S_A | !N_A)^2 P(S_B | !N_A) P(!N_A) = P(S_A | !N_A)^2 \left(P(S_B | N_B)P(N_B) + P(S_B | !N_B)P(!N_B)\right) P(!N_A) = 0.05325 $$

Normalize:

$$ P(N_A \mid S_A, S_B, S_A)  = 0.31808 / (0.31808 + 0.05325) = 0.85659655831 $$


## Exercise 4: Extending the smiles model

### a)

> Describe (using ordinary English) what the second WebPPL program, `smilesModel` above means.

Most people are nice. Nice people smile a lot, other people smile less. Alice smiled twice (and Bob smiled once). Is Alice nice?

### b)

> Extend `smilesModel` to create a version of the model that captures these two intuitions:

> 1. people are more likely to smile if they want something and
> 2. *nice* people are less likely to want something.

> *Hint:* Which variables change at different times for the same person? Which values *depend* on other values?

~~~~
var extendedSmilesModel = function() {
  var nice = mem(function(person) {return flip(.7)});

  var wantsSomething = function(person) {
    return nice(person) ? flip(.2) : flip(.5)
  }

  var smiles = function(person, wants) {
    return (wants ? flip(.8) : flip(.5))
            || (nice(person) ? flip(.8) : flip(.5))
  }  

  var aliceWants = wantsSomething('alice');
  return smiles('alice', aliceWants)
}

Infer({method: "enumerate"}, extendedSmilesModel)
~~~~

Note that smiles now has two possible causes (draw the diagram!) Being nice makes you more likely to smile and, separately, wanting something makes you more likely to smile. Using the OR operator here captures the intuition that either one is sufficient to make someone more likely to smile (recall the 'explaining away' phenomenon in Chapter 4 which had a similar flavor). Critically, being nice is a persistant property of a person and is therefore held constant within an execution using `mem` while wanting something is circumstantial: the same person may want something on one occasion and not another. Finally, by making smiles a function of a person and *whether they want something* at a given time (as opposed to calling `wantsSomething` inside smiles), we can query a particular instance of wanting something without flipping separate coins outside and inside.

### c)

> Suppose you've seen Bob five times this week and each time, he was not smiling. But today, you see Bob and he *is* smiling. Use this `extendedSmilesModel` model to compute the posterior belief that Bob wants something from you today.

> *Hint:* How will you represent the same person (Bob) smiling *multiple times*? What features of Bob will stay the same each time he smiles (or doesn't) and what features will change?

> In your answer, show the WebPPL inference and a histogram of the answers -- in what ways do these answers make intuitive sense or fail to?

~~~~
var extendedSmilesModel = function() {
  var nice = mem(function(person) {return flip(.7)});

  var wantsSomething = function(person) {
    return nice(person) ? flip(.2) : flip(.5)
  }

  var smiles = function(person, wants) {
    return (wants ? flip(.8) : flip(.5))
            || (nice(person) ? flip(.8) : flip(.5))
  }  

  var wantToday = wantsSomething('bob');
  condition(smiles('bob', wantToday)                  // smiles today!
            && !smiles('bob', wantsSomething('bob'))  // no smile on day 1
            && !smiles('bob', wantsSomething('bob'))  // no smile on day 2
            && !smiles('bob', wantsSomething('bob'))  // no smile on day 3
            && !smiles('bob', wantsSomething('bob'))  // no smile on day 4
            && !smiles('bob', wantsSomething('bob'))) // no smile on day 5
  return wantToday
}

Infer({method: "enumerate"}, extendedSmilesModel)
~~~~

We condition on all the data that we have; bob failed to smile 5 times before, but then smiled today. Again, critically, because wantsSomething is not memoized, each of these observations is independent. We have uncertainty over whether bob wanted something on *every* day, but we're only interested in whether he wanted something on the day that he smiled, thus why we store that value and return it at the end.

## Question 5.5: Sprinklers, Rain and `mem`

### a)

> I have a particularly bad model of the sprinkler in my garden.
> It is supposed to water my grass every morning, but is turns on only half the time (at random, as far as I can tell).
> Fortunately, I live in a city where it also rains 30% of days.
> 
> One day I check my lawn and see that it is wet, meaning that either it rained that morning or my sprinkler turned on (or both).
> 
> Answer the following questions, either using the Rules of Probability or by writing your own sprinkler model in webppl.
> 
> * What is the probability that it rained?

$$P(rain) = 0.46153846153846156$$

> * What is the probability that my sprinkler turned on?

$$P(sprinkler) = 0.7692307692307692$$


~~~~
display("rain")
viz.table(Infer({method: "enumerate"}, function() {
  var sprinkler = flip();
  var rain = flip(0.3);
  var wet_lawn = sprinkler || rain;
  condition(wet_lawn);
  return rain;
}))

display("sprinkler")
viz.table(Infer({method: "enumerate"}, function() {
  var sprinkler = flip();
  var rain = flip(0.3);
  var wet_lawn = sprinkler || rain;
  condition(wet_lawn);
  return sprinkler;
}))
~~~~

### c)

> My neighbour Kelsey, who has the same kind of sprinkler, tells me that her lawn was also wet that same morning.
> What is the new posterior probability that it rained?

$$P(rain) = 0.631578947368421$$

~~~~
viz.table(Infer({method: "enumerate"}, function() {
  var rain = flip(0.3);
  var my_sprinkler = flip();
  var her_sprinkler = flip();
  var my_lawn_is_wet = my_sprinkler || rain;
  var her_lawn_is_wet = her_sprinkler || rain;
  condition(my_lawn_is_wet && her_lawn_is_wet);
  return rain;
}))
~~~~

### d)

> To investigate further we poll a selection of our friends who live nearby, and ask if their grass was wet this morning.
> Kevin and Manu and Josh, each with the same sprinkler, all agree that their lawns were wet too.
> Using `mem`, write a model to reason about arbitrary numbers of people, and then use it to find the new probability that it rained.

$$P(rain) = 0.9320388349514566$$

~~~~
viz.table(Infer({method: "enumerate"}, function() {
  var rain = flip(0.3);

  var sprinkler = mem(function(person) {return flip();})
  var wet_lawn = mem(function(person) {return rain || sprinkler(person);})

  condition(wet_lawn("me"), wet_lawn("Kelsey"), wet_lawn("Kevin"), wet_lawn("Manu"), wet_lawn("Josh"));
  return rain;
}))
~~~~

*Note:* We don't actually *have* to use `mem` here, because we're asking about rain. But if we instead wanted to reason about whether *my* sprinker went off, we can do that a lot more easily with the model that uses `mem`. E.g.

~~~~
viz.table(Infer({method: "enumerate"}, function() {
  var rain = flip(0.3);

  var sprinkler = mem(function(person) {return flip();})
  var wet_lawn = mem(function(person) {return rain || sprinkler(person);})

  condition(wet_lawn("me"), wet_lawn("Kelsey"), wet_lawn("Kevin"), wet_lawn("Manu"), wet_lawn("Josh"));
  return wet_lawn("me");
}))
~~~~

## Exercise 5: Casino game

> Consider the following game.
> A machine randomly gives Bob a letter of the word "game"; it gives a, e (the vowels) with probability 0.45 each and the remaining letters (the consonants g, m) with probability 0.05 each.
> The probability that Bob wins depends on which letter he got.
> Letting $$h$$ denote the letter and letting $$Q(h)$$ denote the numeric position of that letter in the word "game" (e.g., $$Q(\text{g}) = 1, Q(\text{a}) = 2$$, and so on), the probability of winning is $$1/Q(h)^2$$.
> 
> Suppose that we observe Bob winning but we don't know what letter he got.
> How can we use the observation that he won to update our beliefs about which letter he got?
> Let's express this formally.
> Before we begin, a bit of terminology: the set of letters that Bob could have gotten, $$\{g, a, m, e\}$$, is called the *hypothesis space* -- it's our set of hypotheses about the letter.

### a)

> In English, what does the posterior probability $$p(h \mid \text{win})$$ represent?

Given that Bob wins, which letter did he probably draw?

### b)

> Manually compute $$p(h \mid \text{win})$$ for each hypothesis.
> Remember to normalize --- make sure that summing all your $$p(h \mid \text{win})$$ values gives you 1.

Using Bayes rule,

$$ P(h \mid \text{win}) \propto P(h) \cdot P(\text{win} \mid h) $$

Let $$Z$$ be the sum of $$ P(h) \cdot P(\text{win} \mid h) $$ across all values of $$h$$.

| $$h$$ | $$p(h)$$ | $$p(\text{win}\mid h)$$ | $$p(h \mid \text{win})$$ |
| ----- | -------- | ------------------------ |------------------------- |
| g     | 0.05     | 1                        | 0.05 / Z = 0.255         |
| a     | 0.45     | 1/4                      | 0.45/4 / Z = 0.573       |
| m     | 0.05     | 1/9                      | 0.05/9 / Z = 0.028       |
| e     | 0.45     | 1/16                     | 0.45/16 / Z = 0.143      |

### d)

> Now, we're going to write this model in WebPPL using `Infer`. Here is some starter code for you:

~~~~
// define some variables and utility functions
var checkVowel = function(letter) {return _.contains(['a', 'e', 'i', 'o', 'u'], letter);}
var letterVals = ['g', 'a', 'm', 'e'];
var letterProbs = map(function(letter) {return checkVowel(letter) ? 0.45 : 0.05;}, letterVals);
var letters = Categorical({vs: letterVals, ps: letterProbs})

// Compute p(h | win)
var distribution = Infer({method: 'enumerate'}, function() {
  var letter = sample(letters);
  var position = letterVals.indexOf(letter) + 1; 
  var winProb = 1 / Math.pow(position, 2);
  var win = flip(winProb);
  condition(win)
  return letter;
});
viz.auto(distribution);
viz.table(distribution);
~~~~

> Fill in the `...`'s in the code to compute $$p(h \mid \text{win})$$.
> Include a screenshot of the resulting graph.
> What letter has the highest posterior probability?

`a`

> In English, what does it mean that this letter has the highest posterior?

If we had to guess a letter, `a` would be the best one. It's both likely to be drawn a priori (because it's a vowel) and likely to result in a win if Bob drew it.

> It might be interesting to comment out the `condition` statement so you can compare visually the prior (no `condition` statement) to the posterior (with `condition`).
> 
> Make sure that your WebPPL answers and hand-computed answers agree -- note that this demonstrates the equivalence between the program view of conditional probability and the distributional view.

### e)

Which is higher, $$p(\text{vowel} \mid \text{win})$$ or $$p(\text{consonant} \mid \text{win})$$?
Answer this using the WebPPL code you wrote *Hint:* use the `checkVowel` function.

~~~~
// define some variables and utility functions
var checkVowel = function(letter) {return _.contains(['a', 'e', 'i', 'o', 'u'], letter);}
var letterVals = ['g', 'a', 'm', 'e'];
var letterProbs = map(function(letter) {return checkVowel(letter) ? 0.45 : 0.05;}, letterVals);
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

A vowel is more likely ($$P(vowel) = 0.7168141592920354$$) than a consonant ($$P(vowel) = 0.28318584070796465 $$)

### f)

> What difference do you see between your code and the mathematical notation?
> What are the advantages and disadvantages of each?
> Which do you prefer?

The mathematical notation is more precise in some cases (we might get some rounding errors on the computer), but it's less error prone, easier to think about, and much easier to extend. What if we did this with all the letters of the alphabet instead? That would be tedious.


