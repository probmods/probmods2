---
layout: exercise
title: Conditioning - exercises
custom_js:
- assets/js/box2d.js
- assets/js/physics.js
---

## Exercise 1: Fair coins and biased coins

### a)

I flip a fair coin. What is the probability that it lands heads?

~~~~
var model = function() {
  // Your code here
}
var log_prob = Infer({method:'enumerate'}, model).score('H')
Math.exp(log_prob)
~~~~

### b)

I also have a biased coin, with $$P(\text{heads})=0.9$$.
I hand you one of the coins (either biased or fair) without telling you which.
You flip it three times.

Given that first two coin flips landed on heads, what is the posterior distribution for the next flip?

~~~~
var model = function() {
  // Your code here
}
viz(Infer({method:'enumerate'}, model))
~~~~

### c)

Given that all three flips landed on heads, what is the probability that the coin was biased?

### d)

Given that the first two flips were different, what is the probability that the third flip will be heads?

## Exercise 2: Conditioning and Intervention

In the earlier [Medical Diagnosis]({{site.baseurl}}/chapters/02-generative-models.html#example-causal-models-in-medical-diagnosis) section we suggested understanding the patterns of symptoms for a particular disease by changing the prior probability of the disease such that it is always true (also called the *do* operator).

~~~~
var lungCancer = flip(0.01);
var cold = flip(0.2);
var cough = (
  (cold && flip(0.5)) ||
  (lungCancer && flip(0.3))
)
cough;
~~~~

### a)

For this example, does intervening on the program in this way (e.g. by setting the value of `lungCancer`) have the same effect as *conditioning* on the disease being true? What about the casual dependency makes this case?

### b) 

Why would intervening have a different effect than conditioning for more general hypotheticals? Construct an example where they differ. Then translate this into a WebPPL model and show that manipulating the prior gives different answers than manipulating the observation. *Hint:* think about the effect that intervening vs. conditioning on a variable that has a **causal parent** would have on that parent.

~~~~

~~~~

## Exercise 3: Computing marginals

Use the rules for computing probabilities to compute the marginal distribution on return values from these programs by hand (use `viz()` to check your answers):

### a)

~~~~
Infer({method: "enumerate"}, function() {
  var a = flip();
  var b = flip();
  condition(a || b);
  return a;
})
~~~~

### b)

~~~~
var smilesModel = function() {
  var nice = mem(function(person) {return flip(.7)});
  var smiles = function(person) {return nice(person) ? flip(.8) : flip(.5);}
  condition(smiles('alice') && smiles('bob') && smiles('alice'));
  return nice('alice');
}

Infer({method: "enumerate"}, smilesModel)
~~~~

## Exercise 4: Extending the smiles model

### a)

Describe (using ordinary English) what the second WebPPL program, `smilesModel` above means.

### b)

Extend `smilesModel` to create a version of the model that also captures these two intuitions:

1. people are more likely to smile if they want something and
2. *nice* people are less likely to want something.

Note: Do not lose the fact that niceness is also a risk factor for smiling.

*Hint:* Which variables change at different times for the same person?
Which values *depend* on other values?

~~~~
var extendedSmilesModel = function() {
  var nice = mem(function(person) {return flip(.7)});

  ...

  var smiles = function(person, ...) {
    return nice(person) ? flip(.8) : flip(.5);
  }

  return smiles('alice')
}

Infer({method: "enumerate"}, extendedSmilesModel)
~~~~

### c)

Suppose you've seen Bob five times this week and each time, he was not smiling. But today, you see Bob and he *is* smiling.
Use this `extendedSmilesModel` model to compute the posterior belief that Bob wants something from you today.

*Hint:* How will you represent the same person (Bob) smiling *multiple times*?
What features of Bob will stay the same each time he smiles (or doesn't) and what features will change?

In your answer, show the WebPPL inference and a histogram of the answers -- in what ways do these answers make intuitive sense or fail to?

~~~~
var extendedSmilesModel = function() {
  // copy your code frome above

  // make the appropriate observations

  // return the appropriate query
  return ...;
}


Infer({method: "enumerate"}, extendedSmilesModel)
~~~~


Question 5: Sprinklers, Rain and mem

### a)

I have a particularly bad model of the sprinkler in my garden.
It is supposed to water my grass every morning, but is turns on only half the time (at random, as far as I can tell).
Fortunately, I live in a city where it also rains 30% of days.

One day I check my lawn and see that it is wet, meaning that either it rained that morning or my sprinkler turned on (or both).

Answer the following questions, either using the Rules of Probability or by writing your own sprinkler model in webppl.

* What is the probability that it rained?
* What is the probability that my sprinkler turned on?

~~~~

~~~~

### c)

My neighbour Kelsey, who has the same kind of sprinkler, tells me that her lawn was also wet that same morning.
What is the new posterior probability that it rained?

~~~~

~~~~

### d)

To investigate further we poll a selection of our friends who live nearby, and ask if their grass was wet this morning.
Kevin and Manu and Josh, each with the same sprinkler, all agree that their lawns were wet too.
Using `mem`, write a model to reason about arbitrary numbers of people, and then use it to find the new probability that it rained.

~~~~

~~~~


## Exercise 5: Casino game

Consider the following game.
A machine randomly gives Bob a letter of the word "game"; it gives a, e (the vowels) with probability 0.45 each and the remaining letters (the consonants g, m) with probability 0.05 each.
The probability that Bob wins depends on which letter he got.
Letting $$h$$ denote the letter and letting $$Q(h)$$ denote the numeric position of that letter in the word "game" (e.g., $$Q(\text{g}) = 1, Q(\text{a}) = 2$$, and so on), the probability of winning is $$1/Q(h)^2$$.

Suppose that we observe Bob winning but we don't know what letter he got.
How can we use the observation that he won to update our beliefs about which letter he got?
Let's express this formally.
Before we begin, a bit of terminology: the set of letters that Bob could have gotten, $$\{g, a, m, e\}$$, is called the *hypothesis space* -- it's our set of hypotheses about the letter.

### a)

In English, what does the posterior probability $$p(h \mid \text{win})$$ represent?

### b)

Manually compute $$p(h \mid \text{win})$$ for each hypothesis.
Remember to normalize --- make sure that summing all your $$p(h \mid \text{win})$$ values gives you 1.

| $$h$$ | $$p(h)$$ | $$p(\text{win}\mid h)$$ | $$p(h \mid \text{win})$$ |
| ----- | -------- | ------------------------ |------------------------- |
| g     | 0.05     |                          |                          |
| a     | 0.45     |                          |                          |
| m     | 0.05     |                          |                          |
| e     | 0.45     |                          |                          |

<!-- ### c)

What does the `Categorical` function do (hint: check the [docs](http://webppl.readthedocs.io/en/master/distributions.html))?
Use `Categorical` to express this distribution:

|x    | P(x)|
|---- | -----|
|red  | 0.5|
|blue | 0.05|
|green| 0.4|
|black| 0.05|	

~~~~ 
var distribution = Categorical(...)
~~~~ -->

### d)


Now, we're going to write this model in WebPPL using `Infer`. Here is some starter code for you:

~~~~
// define some variables and utility functions
var checkVowel = function(letter) {return _.includes(['a', 'e', 'i', 'o', 'u'], letter);}
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

Fill in the `...`'s in the code to compute $$p(h \mid \text{win})$$.
Include a screenshot of the resulting graph.
What letter has the highest posterior probability?
In English, what does it mean that this letter has the highest posterior?
It might be interesting to comment out the `condition` statement so you can compare visually the prior (no `condition` statement) to the posterior (with `condition`).

Make sure that your WebPPL answers and hand-computed answers agree -- note that this demonstrates the equivalence between the program view of conditional probability and the distributional view.

### e)

Which is higher, $$p(\text{vowel} \mid \text{win})$$ or $$p(\text{consonant} \mid \text{win})$$?
Answer this using the WebPPL code you wrote *Hint:* use the `checkVowel` function.

~~~~
// define some variables and utility functions
var checkVowel = function(letter) {return _.includes(['a', 'e', 'i', 'o', 'u'], letter);}
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

### f)

What difference do you see between your code and the mathematical notation?
What are the advantages and disadvantages of each?
Which do you prefer?

<!-- ## Question 1: Preliminaries

### a)

I show you two identical-looking coins, and tell you that one is fair, i.e. $$P(\text{heads})=0.5$$, while the other is biased with probability $$0.9$$.
You then toss one coin twice, and observe that it lands tails both times.

What is the probability that you chose the fair coin?
The code has been written for you, and needs only to be uncommented.

~~~~
var modelQuery = function() {
/*
    var fair = flip()
    var p_heads = fair ? 0.5 : 0.9
    var flip1 = flip(p_heads) ? 'H' : 'T'
    var flip2 = flip(p_heads) ? 'H' : 'T'

    condition(flip1 == 'T' && flip2 == 'T')
    fair
 */
}
var dist = Infer({method:'enumerate'}, modelQuery)

viz(dist, {xLabel: 'Fair', yLabel: 'P(Fair | T,T)'})
print("P(Fair=True  | Flip1=Tails, Flip2=Tails) = " + Math.exp(dist.score(true)))

// Note: dist.score returns a log probability, which is why need Math.exp
~~~~

Notice that we used the `Infer` function to return a dist object.
This object describes the marginal distribution for the output of our generative model (in this case, the value of fair) under the conditions we give it.
It has many different properties including the score function, which gives us the inferred log probability for each value.
For more about WebPPL’s inference functions, see the [probmods textbook](http://probmods.org/) and the [WebPPL documentation](http://docs.webppl.org/en/master/).

### b)

If we want to make several different queries on the same underlying model structure without having to rewrite it each time, we can use a code pattern like the one below. 
We define `makeModelQuery`, which creates a new model query given a querier.

This querier is a function which should take as input all variables we might want to condition on or query about — in this case, observations of the two coin flips and whether the coin is fair.
We can then reuse `makeModelQuery` as many times as we like, giving different conditioning statements and queries each time.
Run the two textboxes in order, noting how `editor.put` and `editor.get` can be used to persist variables between textboxes.

~~~~
var makeModelQuery = function(querier) {return function() {
    var fair = flip()
    var p_heads = fair ? 0.5 : 0.9
    var flip1 = flip(p_heads) ? 'H' : 'T'
    var flip2 = flip(p_heads) ? 'H' : 'T'
    querier(fair, flip1, flip2)
}}
editor.put("makeModelQuery", makeModelQuery)
var makeModelQuery = editor.get("makeModelQuery")

var dist1 = Infer({method:'enumerate'}, makeModelQuery(function(fair, flip1, flip2) {
  condition(flip1 == 'T' && flip2 == 'T')
  fair
}))
viz(dist1, {xLabel: 'Fair', yLabel: 'P(Fair | T,T)'})
print("P(Fair=True | Flip1=Tails, Flip2=Tails) = " + Math.exp(dist1.score(true)))

var dist2 = Infer({method:'enumerate'}, makeModelQuery(function(fair, flip1, flip2) {
  condition(flip2 == 'H')
  flip1
}))
viz(dist2, {xLabel: 'Coin1', yLabel: 'P(Coin1 | Coin2=H)'})
print("P(Coin1=Heads | Coin2=Heads) = " + Math.exp(dist2.score('H')))
Find the probability that the coin is fair, given that each of the two coin tosses gives a different result

var makeModelQuery = editor.get("makeModelQuery")
// Your code here
~~~~

### c)

If we want to reason about arbitrary numbers of coin flips we can use `mem`, as below. 
`mem` stores the output of a random process, which allows us to call a random function multiple times but get the same output if the same input is used.
This is described in more detail in the probmods textbook

~~~~~
var makeModelQuery = function(querier) {return function() {
    var fair = flip()
    var p_heads = fair ? 0.5 : 0.9
    var flips = mem(function(i) {
      flip(p_heads) ? 'H' : 'T'
    })
    querier(fair, flips)
}}
editor.put("makeModelQuery", makeModelQuery)

var dist1 = Infer({method:'enumerate'}, makeModelQuery(function(fair, flips) {
  condition(flips(1) == 'H' && flips(2) == 'H' && flips(3) == 'H')
  fair
}))
viz(dist1, {xLabel: 'Fair', yLabel: 'P(Fair | H,H,H)'})
print("P(Fair=True | Heads,Heads,Heads) = " + Math.exp(dist1.score(true)))

var dist2= Infer({method:'enumerate'}, makeModelQuery(function(fair, flips) {
  // The 'psychic' random sequence Josh beamed to the class
  condition(flips(1) == 'H' && flips(2) == 'H' && flips(3) == 'T' && flips(4) == 'H' && flips(5) == 'T')
  fair
}))
viz(dist2, {xLabel: 'Fair', yLabel: 'P(Fair | H,H,T,H,T)'})
print("P(Fair=True | Heads,Heads,Tails,Heads,Tails) = " + Math.exp(dist2.score(true)))
Find the probability that the next coin will come up ‘heads’, after observing 4 consecutive tails.

// Your code here
~~~~ -->

<!-- ## Exercise 4: A Bayes Net for Exam Results

The year is 2022 A.D. You, now a young professor at Stanford, are the instructor for "Computational Cognitive and Molecular Neuroscience".
The class contains many industrious students, but it also has some students who you suspect are, in fact, not studying.
In order to determine which students are trying to get by without studying, you decide to set weekly exams.
You decide to make most (80%) of the exams easy, and the rest (20%) hard.
In either case, you expect that students who study will be more likely to pass the exam than students who do not study, with roughly these probabilities:

|Studied? | Exam is easy? | Pass the exam? |
|T | T | 0.9 |
|T | F | 0.7 |
|F | T | 0.6 |
|F | F | 0.2 |

*A priori*, at the time you set up the exams but before looking at any students scores, your best guess is that 50% of the students are studying.
Your class has students and exams.
You may assume that each student has constant study habits --- either studying or not studying --- for the entire quarter.

### a)

Based on the information provided above, construct a resuable model to reason about arbitrary sets of students and exams.
Use `mem` to store the study habit for each student, and the difficulty for each exam.
In the probmods textbook you will find a WebPPL model of a similar setup.
You are free to copy/modify this code in this problem set.

~~~~
var makeModelQuery = function(querier) {return function() {
  // Your code here
    querier( /* Some variables here */ )
}}
editor.put("makeModelQuery", makeModelQuery)
What is the probability that somebody who passed an exam also studied?

var makeModelQuery = editor.get("makeModelQuery")
// Your code here
What is the probability that an exam passed by a student who studied was hard?

var makeModelQuery = editor.get("makeModelQuery")
// Your code here
(b) Use the model constructed in (a) for the rest of the parts of this question. Student 1 fails exam 1 and 2. What is the probability that he is a studier ? What is the probability that exam 1 is easy ?

var makeModelQuery = editor.get("makeModelQuery")
// Your code here
(c) You now learn that in addition to student 1 failing exams 1 and 2, students 2 and 3 failed exams 1 and 2 as well. What is the new probability that student 1 is a studier? The new probability that exam 1 is easy?

var makeModelQuery = editor.get("makeModelQuery")
// Your code here
Explain why the changes you see go in the direction they do.
~~~~

### d)

In addition to knowing how all the students did on exams 1 and 2, you now find out that students 2 and 3 failed exams 3 and 4 as well.
How does this change the probability that exam 1 is easy? How does it change the probability that student 1 is a studier?

~~~~
var makeModelQuery = editor.get("makeModelQuery")
// Your code here
Explain why you observe the changes that you do.
~~~~

### e)

To complete the performance record of all the students, you find out that student 1 has passed exam 3 and 4.
Given this complete record, what are the new probabilities that exam 1 is easy and that student 1 is a studier?

~~~~
var makeModelQuery = editor.get("makeModelQuery")
// Your code here
~~~~

Do they change significantly from your answer in part (d)? Why or why not?

### f)

Find a friend and describe the situation in this problem (3 students, 4 exams, 50% likelihood of studying and 80% easy exams, and the probabilities given in the table above).

For each of parts (b) through (e), ask for their intuitive judgments about how the changes made would alter the probability that student 1 is a studier and that exam 1 is hard.
To make it easier for your subject to give consistent judgments, you should first ask them about the direction of change that they expect for each probability (up, down or no change) after each piece of information, and then ask them to give their best numerical guess for that probability.

Record your subject’s answers for each of parts (b)-(e).
Compare these answers to the performance of your Bayesian network model, both qualitatively (do the judgments shift in the right direction?) and quantitatively (how close are the numerical judgments to the correct probabilities?).
If there are there any differences, can you identify any general trends or patterns? 
Why do you think you see those differences?
Do your own gut instincts look similar to your subjects judgments? -->

<!-- ### g) Redo parts (b)-(e) using a different value for the prior probability of an exam being easy and the prior probability of a student being a studier, and submit the results. (Find a prior that does have at least some effect.)

~~~~
// Your code here
~~~~

What role do these priors have on the assessments of student A and exam 1?
In general, does changing the priors result in a qualitative or simply a quantitative shift in the output of the Bayes net?
In particular, consider the explaining away effect that occurs between (b) and (c) for the probability that student 1 is a studier.
How does this effect depend on the prior probabilities, and why?

### h) Now we’re going to put priors on our priors.

Assume that the professor (you) is either a lenient instructor or a challenging instructor.
An instructor is equally likely to be lenient or challenging, and stays that way throughout the course.
Let and .
Assume that the class is either advanced or introductory, and is a priori equally likely to be either.
Let and .

Repeat the inferences in parts (b)-(e), but this time calculate the posterior distribution over whether the instructor is challenging/lenient and advanced/introductory.

~~~~
// Your code here
~~~~

Explain the qualitative shifts between these posteriors in (b)-(e): concretely, a trend in parts (b)-(d) is reversed in part (e).
What and why is this trend, and why is it reversed?

*Note:* You can take out these "priors on priors" for the next part.

### i)

The assumptions we made when setting up the models in this question are highly oversimplified.
For example, it might be more accurate to say that students either study a lot, study a little, or don’t study; we could even model students’ study habits as continuous variables.
The models are also unsuitable for certain questions that we might wish to ask them; we might want to be able to infer, say, which students studied together, or whether a given student was sleepy while taking the test.

Devise an a small extension of these models which better reflects your intuitive understanding of this domain, and modify your WebPPL code to implement it (you’ll probably need to expand the probability tables given above as you add more random variables; just choose values that seem reasonable).
Test your new model by querying it with a few representative questions (e.g. did students 1 and 2 study together?).

~~~~
// Your code here
~~~~

Does your intuition match the model predictions? Why do you think your new model does or does not capture your own judgments? -->

<!-- Question 3: Arm wrestles and reusable models

Rather than rewrite the model every time we want to make a new query, we can define a reusable function to build each new model query for us (given a set of conditions or outputs). For example, the code below defines a generic model for reasoning about people’s strength in arm wrestling tournaments. For simplicity, each person is assumed to be either strong or weak.

var makeModelQuery = function(querier) {return function() {
    var strong = mem(function(person) { //Is this person strong?
        flip()
    })
    var beats = function(personA, personB) { //Given a contest between personA and personB, does personA win?
        if(strong(personA) && !strong(personB)) {
            flip(0.8)
        } else if(strong(personB) && !strong(personA)) {
            flip(0.2)
        } else {
            flip(0.5)
        }
    }
    querier(strong, beats)
}}
editor.put("makeModelQuery", makeModelQuery)
If we wanted to find the probability that Hillary is strong, given that she beats Josh, we could write

var makeModelQuery = editor.get("makeModelQuery")
var dist = Infer({method:'enumerate'}, makeModelQuery(function(strong, beats) {
    condition(beats("Hillary", "Josh"))
    strong("Hillary")
}))
Math.exp(dist.score(true))
(a) Find the probability that Hillary is strong, given that she and Donald both beat Josh. This is an example of explaining away, as discussed in class

(b) Find the probability that Kevin is strong, given that he beat Luke in two out of three arm wrestles.

(c) Find the probability that Kelsey will beat Kevin, given that Kevin beat Luke in two out of three arm wrestles.

Problem Set 3

Note: The due date for this problem set has been revised to: Tuesday, Nov 15
Question 1: Preliminaries

You and your friend are playing a game. You roll a dice repeatedly, and count up the sum of the rolls until it reaches at least 10. This sum then becomes your score (between 10 and 15).

How can we write out a generative model for this process? Probabilistic programming allows us to create models of structures, such as sequences or trees, by building them up with a recursive function:

var fairDice = Categorical({vs: [1, 2, 3, 4, 5, 6], ps: [1/6, 1/6, 1/6, 1/6, 1/6, 1/6]})
var generateFrom = function(sequenceSoFar) {
  var roll = sample(fairDice)
  var sequence = sequenceSoFar.concat(roll)
  if(sum(sequence) >= 10) {
    return sequence
  } else {
    return generateFrom(sequence)
  }
}
editor.put("generateFrom", generateFrom)

var sequence = generateFrom([]) // [] is an empty list
print("Sequence: " + sequence)

var score = sum(sequence)
print("Score: " + score)
(a) What is the distribution for your final score in this game?

var generateFrom = editor.get("generateFrom")
var model = function() {
  // Your code here
}
viz(Infer({method:'enumerate'}, model))
(b) What is the distribution on the total number of times you roll the dice.

Hint: you can make use of the javascript property length

(c) What is the distribution of the value of your final roll, given that your score is at least 13?

Question 2: The Casino Dealer Switching Game

You enter a casino and walk up to a new game table. A suspicious looking dealer flips coins and participants predict whether the coin will land heads or tails. Observing many other players lose their money to the dealer, you notice a strange pattern in the coin flips. You suspect the dealer might be switching between two types of coins. You decide to use your probabilistic modeling skills to predict the next flip and beat the house for the first time.

To model the stochastic process according to which the dealer operates, you initially assume that there’s a fixed probability that on any given trial, the dealer will switch coins. You make the ‘Markov assumption’ that the dealer’s choice of coin at state t depends only on the coin used at the previous state, t−1, and the fixed probability . The probabilistic model where the current state of the world depends only on some previous latent state is called a Hidden Markov Model (HMM), since the outcome at the current state only depends on the previous state (Markov) which happens to be latent (or “hidden”). HMMs are widely used in computational biology (e.g. for gene recognition and alignment) and computational linguistics (e.g. for speech recognition and segmentation).

HMM

Figure 1: Graphical model representation of the casino dealer switching game.

Switching Probabilities Coin Weights
Coin 1 → Coin 2:  
Coin 2 → Coin 1:  
Table 1: Switching probabilities and dealer’s coin weights.

(a) Write WebPPL code to sample from this generative process, given some number n of coin faces. Your code should sample both the dealer’s choice of coin and the face each flip lands on.

Hint: Your recursive function needs to output both the sequence of coins and the sequence of faces. One way to do this is to return a two element list [coins, faces]. Another way is to return an javascript object {coins:coins, faces:faces}, where the two elements can then be referenced using x.coins and x.faces.

var n = 32
// Your code here

print("Coins: " + coins) // Print the dealer's coin choices, as a list of length n
print("Faces: " + faces) // Print the list of coin faces, as a list of length n
(b) Suppose we observe the following sequence of coin faces:

H H H H T H H T

We are interested in inferring which coin was used for each flip. Using the code you wrote above, use WebPPL to infer the dealer’s chosen sequence of coins, conditioned on this sequence of observations. You can use the function viz.casino to visualise the marginals of this distribution.

Hint: WebPPL includes the underscore.js library. When conditioning, you may find the function _.isEqual(list1, list2) useful to check equality of two lists.

var observations = ['H', 'H', 'H', 'H', 'T', 'H', 'H', 'T']
var model = function() {
  // Your code here
  return coins
}
var dist = Infer({method:"enumerate"}, model)
viz.casino(observations, dist)
(c) Now try copying your code into the box below, to run inference on a longer sequence of observations.

var observations = ['H', 'H', 'H', 'H', 'H', 'T', 'T', 'T', 'T', 'H', 'T', 'H', 'H', 'H', 'H']
// Your code here
You will find that, on this longer sequence, the inference algorithm takes an unreasonably long time to output the posterior distribution. So far, all our calls to Infer have used {method:"enumerate"}, which calculates exact posterior probabilities by summing over all sequences of random choices that could have been made. For sequences like the one above, this means summing over all possibilities.

In such situations, WebPPL has a variety of inbuilt approximate inference algorithms, which involve sampling latent variables rather than enumerating over all possibilities. One such algorithm is Metropolis-Hastings, which Josh has covered in class.

Modify the code above so that Infer uses MCMC for inference, using 50000 samples. This should be able to generate an approximate posterior within in a few seconds. If you like, you can visualise MCMC progress by adding the Infer option callbacks: [editor.MCMCProgress()].

(d) When running the code above, you probably see a warning:

Initialization warning [1/4]: Trace not initialized after 1000 attempts.

This is because in order to initialise the search, Metropolis-Hastings has to find at a setting for the random choices which has non-zero posterior probability. It attempts this by sampling from the prior until it lands on a state which satisfies all of the conditions (i.e. until it happens to sample the correct sequence of coin faces). For sequences much longer than the one above, Metropolis-Hastings will fail to initialise.

We can rewrite the model above to fix this problem. Rather than sampling a face solely to condition it to equal some particular value, we can use the observe keyword to directly add each as a likelihood factor. observe is descibed in the probmods textbook.

In the codebox below, rewrite your model so that inference behaves well with even longer sequences. Instead of sampling faces, your recursive function should output only a sequence of coins and call observe once for each coin it samples. Hint: you may want to use either a Bernoulli Distribution or a Categorical Distribution for your observations.

var observations = ['H', 'H', 'H', 'T', 'T', 'T', 'T', 'T', 'T', 'H', 'H', 'H', 'T', 'H', 'H', 'H',
                    'T', 'H', 'H', 'T', 'T', 'H', 'T', 'T', 'H', 'T', 'T', 'H', 'H', 'H', 'T', 'T']
// Your code here
Question 3: Testing and fitting the model to human data

In this question we will vary the parameters of your model, and compare its predictions to human data. If you like, it might help to add a wrapper to the model above that lets you reuse the same code for different observations or parameters. You can use the box below to do this, and check that it works by repeating the inference in 2d (you should get approximately the same posterior).

var makeModelQuery = function(pSwitch_12, pSwitch_21, pHeads_1, pHeads_2, observations) { return function() {
    // Your model code here, using
    // pSwitch_12, pSwitch_21, pHeads_1, pHeads_2, observations

    return coins
}}
editor.put("makeModelQuery", makeModelQuery)

// Usage example:
var obss = ['H', 'H', 'H', 'T', 'T', 'T', 'T', 'T', 'T', 'H', 'H', 'H', 'T', 'H', 'H', 'H',
            'T', 'H', 'H', 'T', 'T', 'H', 'T', 'T', 'H', 'T', 'T', 'H', 'H', 'H', 'T', 'T']
var model = makeModelQuery(0.15, 0.15, 0.3, 0.7, obss)
// Your Infer code here
(a) (i) Use 2(a) to sample a sequence of faces from a model with parameter settings in Table 1 (you may also use the sequence above, or a shorter subsequence if you were unable to complete 2d). We’ll call the model that uses the settings from Table 1 the “generating model”, since it is the model according to which sequences were produced. Now use a different model — the “parsing model” — for inference (to ‘parse’ the sequence), where the switching probabilities and coin weights are different than Table 1. First, keep of the parsing model the same as the generating model, but vary the coin weights. Second, keep the coin weights the same as the generating model, but vary in the parsing model. What happens in these two scenarios? Describe how differences between the switching probabilities and coin weights of the generating versus parsing model affect the inferences you get, and the errors made by the model.

var makeModelQuery = editor.get("makeModelQuery")
// Your code here



(ii) People are good at detecting patterns in data, despite noise and sparse observations. However, our strong inference abilities sometimes lead us to see spurious patterns, produced by a random underlying process. In machine learning and statistics, methods that exhibit this behavior are said to be overfitting the data. Use several randomly generated sequences — where flips are generated independently from a fair coin — to test whether your model tends to overfit and find structures that aren’t really there in the data. Vary the coin switching probabilities and the coin weights. How do these different settings affect the errors the model might make in inferring the true underlying latent states? Show example sequences and the model posterior marginals to support your arguments.

var makeModelQuery = editor.get("makeModelQuery")
// Your code here



(b) Compare your posterior marginals with the human data. Sample a set of two sequences from a model with parameters as in Table 1, and ask five or more human subjects to infer the coins used to produce these sequences, using the following cover story. You may collaborate with your classmates to reduce the burden of data gathering. However, each person must gather data from at least one subject.

You enter a casino and walk up to a new game table run by a suspicious looking dealer. The dealer flips coins and participants predict whether the coin will land heads or tails. After observing many other players lose their money to the dealer, you notice a strange pattern in the coin flips. You suspect that the dealer might be secretly switching between two types of coins, one which is biased towards tails (Coin 1, 3 out of 10 flips are heads), and one which is biased towards heads (Coin 2, 7 out of 10 flips are heads), but that dealer only switches between the two coins rarely, so as not to make the switching conspicuous.

You confront the dealer, and she admits to using two different coins, as you suspected. She challenges you to predict what coin was used to produce each coin flip in a sequence of coin flips. If you perform this task successfully, you will win back all the money lost to the house in the game. For each coin flip, please mark whether you think it was produced by Coin 1 or Coin 2.

Show a plot of human data against your model’s predictions, produced with the same settings of the coin weights and . How does the model fit the subjects’ responses?

To compare your model predictions directly to a subjects’ ratings, plot your model posterior against the mean of the ratings. Does it make sense to compare the model to the a single subject or to the averaged subject ratings?

var makeModelQuery = editor.get("makeModelQuery")

// Your code here. You can use viz.casino to plot the mean subject ratings. For example:
// var obss = ['H', 'H', 'H', 'H', 'T', 'T']
// var p_coin1 = [0.2, 0.2, 0.3, 0.4, 0.6, 0.8]
// viz.casino(obss, p_coin1)



(c) Even for an ideal Bayesian agent who knows the parameters of the generating model, the coin weights and the switching probabilities, the difficulty of this parsing task depends on how those parameters are set. Consider different settings of the generating model parameters, and test how well the Bayesian ideal learner does at parsing (inferring the correct generating coin sequences) for several different sequences drawn from the model at each parameter setting.

var makeModelQuery = editor.get("makeModelQuery")
//Your code here
(i) Which parameter settings are intrinsically harder or easier? Why?




(ii) Try out your own intuitions on similar example sequences where you know the correct parameter values for the generating model but do not know (i.e., hide from yourself) the true coins used at each step of the sequence. Qualitatively, do the same parameter changes which affect difficulty for the model also affect difficulty for you? Are there sequences that are systematically difficult for you, easy for the model, or vice versa? Give some examples of sequences and the inferences you and the model made to support your claims.




(d) Is the Hidden Markov Model (HMM) approach a good way to model the way people approach this task? What are some ways of generating sequencing of flips where this approach will get the wrong answer? And what general changes would you make to the model to try to correct the model?




Export  Import: Choose File




Final Project Idea (Optional)

Using a larger scale method of testing human subjects (like Amazon’s Mechanical Turk: https://www.mturk.com), test 10 or more subjects in the above task, using the two conditions (one where the coin weights are .5 and .8 but the switching probability is low (.2), and one where the coin weights are .5 and .6, but the switching probability is high (.7)).

To make the study more convincing, write a function to sample sequences of flips from the model given certain configurations of the coin weights and pswitch (keeping track of which latent state produced these). Each subject in a condition will receive a random sample of flips from that condition.

Write a function to sample sequences of flips from an interestingly different generative process. Think of a generative process where human subjects can do well on the task, but where the HMM approach fails. To quantify the error of the sampler, you can use the measure of mean error, in one of at least two ways:

Using the sampler’s estimate of posterior marginals. Let be the mean error of the posterior marginals compared with the true underlying set of latent states. Let be the posterior marginal of state , estimated by the sampler. Then the is:
where each is the true setting of the latent state used to produced the sequence.

Using the sampler’s maximum a posterior (MAP) estimate. Rather than using the posterior marginals, the mean error will be computed using the sampled configuration of the latent states that received the single best score under the posterior. , the mean error of the MAP, is:
Similarly, the error of the human subjects can simply be the mean error using the aver- age subject ratings, appropriately transformed. Show plots comparing the performance of the model with humans, using one or both of these measures.

 -->
