---
layout: chapter
title: Generative models
description: Generative models
custom_js:
- assets/js/box2d.js
- assets/js/phys.js
---

# Models, simulation, and degrees of belief

One view of knowledge is that the mind maintains working models of parts of the world.
'Model' in the sense that it captures some of the structure in the world, but not all (and what it captures need not be exactly what is in the world---just useful).
'Working' in the sense that it can be used to simulate this part of the world, imagining what will follow from different initial conditions.
As an example take the Plinko machine: a box with uniformly spaced pegs, with bins at the bottom.
Into this box we can drop marbles:

<canvas id="plinkocanvas" width="10" height="10" style="background-color:#333333;"></canvas>
<button id="makeplinko" onclick="plinkoinit(); jQuery('#makeplinko').hide();">Set-up Plinko!</button>

The plinko machine is a 'working model' for many physical processes in which many small perturbations accumulate---for instance a leaf falling from a tree.
It is an approximation to these systems because we use a discrete grid (the pegs) and discrete bins.
Yet it is useful as a model: for instance, we can ask where we expect a marble to end up depending on where we drop it in, by running the machine several times---simulating the outcome.

Simulation is intimately connected to degrees of belief.
For instance, imagine that someone has dropped a marble into the plinko machine; before looking at the outcome, you can probably report how much you believe that the ball has landed in each possible bin.
Indeed, if you run the plinko machine many times, you will see a shape emerge in the bins.
The number of balls in a bin gives you some idea how much you should expect a new marble to end up there.
This 'shape of expected outcomes' can be formalized as a probability distribution (described below).
Indeed, there is an intimate connection between simulation and probability, which we explore in the rest of this section.

There is one more thing to note about our Plinko machine above: we are using a computer program to *simulate* the simulation.
Computers can be seen as universal simulators.
How can we, clearly and precisely, describe the simulation we want a computer to do?

# Building Generative Models

We wish to describe in formal terms how to generate states of the world.
That is, we wish to describe the causal process, or steps that unfold, leading to some potentially observable states.
The key idea of this section is that these generative processes can be described as *computations*---computations that involve random choices to capture uncertainty about the process.

As our formal model of computation we start with the $$\lambda$$-calculus, and its embodiment in the LISP family of programming languages.
The $$\lambda$$-calculus is a formal system which was invented by Alonzo Church in 1936 as a way of formalizing the notion of an effectively computable function [@Church1936].
The $$\lambda$$-calculus has only two basic operations for computing: creating and applying functions.
Despite this simplicity, it is a *universal* model of computation---it is (conjectured to be) equivalent to all other notions of classical computation.
(The $$\lambda$$-calculus was shown to have the same computational power as the Turing machine, and vice versa, by Alan Turing in his famous paper which introduced the Turing machine [@Turing1937]).

In 1958 John McCarthy introduced LISP (**LIS**t **P**rocessing), a programming language based on the $$\lambda$$-calculus.
Scheme is a variant of LISP developed by Guy L.
Steele and Gerald Jay Sussman with particularly simple syntax and semantics.
We will use Scheme-style notation for the $$\lambda$$-calculus in this tutorial.
For a quick introduction to programming in Scheme see [the appendix on Scheme basics](appendix-scheme.html).
The Church programming language [@Goodman2008], named in honor of Alonzo Church, is a generalization of Scheme which introduces the notion of probabilistic computation to the language.
This addition results in a powerful language for describing generative models.

In Church, in addition to deterministic functions, we have a set of random functions implementing *random choices.*  These random primitive functions are called *Exchangeable Random Primitives* (XRPs).
Application of an XRP results in a *sample* from the probability distribution defined by that XRP.
For example, the simplest XRP is `flip` which results in either true or false -- it simulates a (possibly biased) coin toss.
(Note that the return values `true` and `false` will look like this in the output: `#t` and `#f`.)

~~~~
flip()
~~~~

Run this program a few times.
You will get back a different sample on each execution.
Also, notice the parentheses around `flip`.
These are meaningful; they tell Church that you are asking for an application of the XRP `flip`---resulting in a sample.
Without parentheses `flip` is a *procedure* object---a representation of the simulator itself, which can be used to get samples.

In Church, each time you run a program you get a *sample* by simulating the computations and random choices that the program specifies.
If you run the program many times, and collect the values in a histogram, you can see what a typical sample looks like:

~~~~
viz.hist(repeat(1000,flip))
~~~~

Here we have used the `repeat` procedure which takes a number of repetitions, $$K$$, and a random distribution (in this case `flip`) and returns a list of $$K$$ samples from that distribution.
We have used the `hist` procedure to display the results of taking 1000 samples from `flip`.
As you can see, the result is an approximately uniform distribution over `true` and `false`.

An important idea here is that `flip` can be thought of in two different ways.
From one perspective, `flip` is a procedure which returns a sample from a fair coin.
That is, it's a *sampler* or *simulator*.
From another perspective, `flip` is *itself* a characterization of the distribution over `true` and `false`.
When we think about probabilistic programs we will often move back and forth between these two views, emphasizing either the sampling perspective or the distributional perspective.
(With suitable restrictions this duality is complete: any Church program implicitly represents a distribution and any distribution can be represented by a Church program; see e.g., @Ackerman2011 for more details on this duality.)
We return to this relationship between probability and simulation below.

The `flip` function is the simplest XRP in Church, but you will find other XRPs corresponding to familiar probability distributions, such as `gaussian`, `gamma`, `dirichlet`, and so on.
Using these XRPs we can construct more complex expressions that describe more complicated sampling processes. For instance here we describe a process that samples a number by multiplying two samples from a gaussian distribution:

~~~~
gaussian(0,1) * gaussian(0,1)
~~~~

What if we want to invoke this sampling process multiple times? We would like to construct a stochastic function that multiplies two Gaussians each time it is called.
We can use `lambda` to construct such complex stochastic functions from the primitive ones.

~~~~
var twoGaussians = function() { return gaussian(0,1) * gaussian(0,1) }
viz.density(repeat(100, twoGaussians))
~~~~

A lambda expression with an empty argument list, `(lambda () ...)`, is called a *thunk*: this is a function that takes no input arguments. If we apply a thunk (to no arguments!) we get a return value back, for example `(flip)`. A thunk is an object that represents a whole *probability distribution*.
Complex functions can also have arguments. Here is a stochastic function that will only sometimes double its input:

~~~~
var noisyDouble = function(x) { flip() ? x+x : x }
noisyDouble(3)
~~~~

By using higher-order functions we can construct and manipulate probability distributions.
A good example comes from coin flipping...

## Example: Flipping Coins

The following program defines a fair coin, and flips it 20 times:

~~~~
var fairCoin = function() { flip(0.5) ? 'h' : 't' };
viz.hist(repeat(20, fairCoin))
~~~~

This program defines a "trick" coin that comes up heads most of the time (95%), and flips it 20 times:

~~~~
var trickCoin = function() { flip(0.95) ? 'h' : 't' };
viz.hist(repeat(20, trickCoin))
~~~~

The higher-order function `make-coin` takes in a weight and outputs a function (a thunk) describing a coin with that weight.  Then we can use `make-coin` to make the coins above, or others.

~~~~
var makeCoin = function(weight) { return function() { flip(weight) ? 'h' : 't' } };
var fairCoin = makeCoin(0.5);
var trickCoin = makeCoin(0.95);
var bentCoin = makeCoin(0.25);

viz.hist(repeat(20,fairCoin))
viz.hist(repeat(20,trickCoin))
viz.hist(repeat(20,bentCoin))
~~~~

We can also define a higher-order function that takes a "coin" and "bends it":

~~~~
var makeCoin = function(weight) { return function() { flip(weight) ? 'h' : 't' } };
var bend = function(coin) {
    return function() {
        (coin() == 'h') ? makeCoin(0.7)() : makeCoin(0.1)()
    }
}
var fairCoin = makeCoin(0.5)
var bentCoin = bend(fairCoin)
viz.hist(repeat(100,bentCoin))
~~~~

Make sure you understand how the `bend` function works! Why are there an "extra" pair of parentheses outside each `make-coin` statement?

Higher-order functions like `repeat`, `map`, and `apply` can be quite useful.
Here we use them to visualize the number of heads we expect to see if we flip a weighted coin (weight = 0.8) 10 times.
We'll repeat this experiment 1000 times and then use `hist` to visualize the results.
Try varying the coin weight or the number of repetitions to see how the expected distribution changes.

~~~~
var makeCoin = function(weight) { return function() { return flip(weight) } }
var coin = makeCoin(0.8)

var data = repeat(1000, function() { sum(map(function (x) { x ? 1 : 0 },
                                             repeat(10, coin))) })
viz.hist(data, {xLabel: 'foo'}) // TODO: add xLabel option
~~~~

# Example: Causal Models in Medical Diagnosis

Generative knowledge is often *causal* knowledge that describes how events or states of the world are related to each other.
As an example of how causal knowledge can be encoded in Church expressions, consider a simplified medical scenario:

~~~~
var lungCancer = flip(0.01);
var cold = flip(0.2);
var cough = or(cold, lungCancer);
cough;
~~~~

This program models the diseases and symptoms of a patient in a doctor's office.
It first specifies the base rates of two diseases the patient could have: lung cancer is rare while a cold is common, and there is an independent chance of having each disease.
The program then specifies a process for generating a common symptom of these diseases -- an effect with two possible causes: The patient coughs if they have a cold or lung cancer (or both).

Here is a more complex version of this causal model:

~~~~
var lungCancer = flip(0.01);
var TB = flip(0.005);
var stomachFlu = flip(0.1);
var cold = flip(0.2);
var other = flip(0.1);

// TODO:  (saccharine-scheme didn't do the best job)
var cough = or(
    and(cold, flip(0.5)),
    and(lungCancer, flip(0.3)),
    and(TB, flip(0.7)),
    and(other, flip(0.01)))

var fever = or(
    and(cold, flip(0.3)),
    and(stomachFlu, flip(0.5)),
    and(TB, flip(0.1)),
    and(other, flip(0.01)))

var chestPain = or(
    and(lungCancer, flip(0.5)),
    and(TB, flip(0.5)),
    and(other, flip(0.01)))

var shortnessOfBreath = or(
    and(lungCancer, flip(0.5)),
    and(TB, flip(0.2)),
    and(other, flip(0.01)))

var symptoms = {cough: cough,
         fever: fever,
         chestPain: chestPain,
         shortnessOfBreath: shortnessOfBreath
        };

symptoms
~~~~

Now there are four possible diseases and four symptoms.
Each disease causes a different pattern of symptoms.
The causal relations are now probabilistic: Only some patients with a cold have a cough (50%), or a fever (30%).
There is also a catch-all disease category "other", which has a low probability of causing any symptom.
*Noisy logical* functions, or functions built from `and`, `or`, and `flip`, provide a simple but expressive way to describe probabilistic causal dependencies between Boolean (true-false valued) variables.

When you run the above code, the program generates a list of symptoms for a hypothetical patient.
Most likely all the symptoms will be false, as (thankfully) each of these diseases is rare.
Experiment with running the program multiple times.
Now try modifying the `define` statement for one of the diseases, setting it to be true, to simulate only patients known to have that disease.
For example, replace `(define lung-cancer (flip 0.01))` with `(define lung-cancer true)`.
Run the program several times to observe the characteristic patterns of symptoms for that disease.

# Prediction, Simulation, and Probabilities

Suppose that we flip two fair coins, and return the list of their values:

~~~~
[flip(), flip()]
~~~~

How can we predict the return value of this program?
For instance, how likely is it that we will see `(#t #f)`?
A **probability** is a number between 0 and 1 that expresses the answer to such a question: it is a degree of belief that we will see a given outcome, such as `(#t #f)`.
The probability of an event $$A$$ (such as the above program returning `(#t #f)`) is usually written as: $$P(A)$$.

As we did above, we can sample many times and examine the histogram of return values:

~~~~
var randomPair = function () { return [flip(), flip()]; };
viz.hist(repeat(1000, randomPair), 'return values');
~~~~

We see by examining this histogram that `(#t #f)` comes out about 25% of the time.
We may define the **probability** of a return value to be the fraction of times (in the long run) that this value is returned from evaluating the program -- then the probability of `(#t #f)` from the above program is 0.25.

Even for very complicated programs we can predict the probability of different outcomes by simulating (sampling from) the program.
It is also often useful to compute these probabilities directly by reasoning about the sampling process.

## Product Rule

In the above example we take three steps to compute the output value: we sample from the first `(flip)`, then from the second, then we make a list from these values.
To make this more clear let us re-write the program as:

~~~~
var A = flip();
var B = flip();
var C = [A, B];
C;
~~~~

We can directly observe (as we did above) that the probability of `#t` for `A` is 0.5, and the probability of `#f` from `B` is 0.5. Can we use these two probabilities to arrive at the probability of 0.25 for the overall outcome `C` = `(#t #f)`? Yes, using the *product rule* of probabilities:
The probability of two random choices is the product of their individual probabilities.
The probability of several random choices together is often called the *joint probability* and written as $$P(A,B)$$.
Since the first and second random choices must each have their specified values in order to get `(#t #f)` in the example, the joint probability is their product: 0.25.

We must be careful when applying this rule, since the probability of a choice can depend on the probabilities of previous choices. For instance, compute the probability of `(#t #f)` resulting from this program:

~~~~
var A = flip();
var B = flip(A ? 0.3 : 0.7);
[A, B];
~~~~

In general, the joint probability of two random choices $$A$$ and $$B$$ made sequentially, in that order, can be written as $$P(A,B) = P(A) P(B \vert A)$$.
This is read as the product of the probability of $$A$$ and the probability of "$$B$$ given $$A$$", or "$$B$$ conditioned on $$A$$".
That is, the probability of making choice $$B$$ given that choice $$A$$ has been made in a certain way.
Only when the second choice does not depend on (or "look at") the first choice does this expression reduce to a simple product of the probabilities of each choice individually: $$P(A,B) = P(A) P(B)$$.

What is the relation between $$P(A,B)$$ and $$P(B,A)$$, the joint probability of the same choices written in the opposite order?  The only logically consistent definitions of probability require that these two probabilities be equal, so $$P(A) P(B \vert A) = P(B) P(A \vert B)$$.  This is the basis of *Bayes' theorem*, which we will encounter later.

## Sum Rule or Marginalization

Now let's consider an example where we can't determine from the overall return value the sequence of random choices that were made:

~~~~
flip() || flip()
~~~~
We can sample from this program and determine that the probability of returning `#t` is about 0.75.

We cannot simply use the product rule to determine this probability because we don't know the sequence of random choices that led to this return value.
However we can notice that the program will return true if the two component choices are `#t,#t`, or `#t,#f`, or `#f,#t`. To combine these possibilities we use another rule for probabilities:
If there are two alternative sequences of choices that lead to the same return value, the probability of this return value is the sum of the probabilities of the sequences.
We can write this using probability notation as: $$P(A) = \sum_{B} P(A,B)$$, where we view $$A$$ as the final value and $$B$$ as a random choice on the way to that value.
Using the product rule we can determine that the probability in the example above is 0.25 for each sequence that leads to return value `#t`, then, by the sum rule, the probability of `#t` is 0.25+0.25+0.25=0.75.

Using the sum rule to compute the probability of a final value is called *marginalization*.
From the point of view of sampling processes marginalization is simply ignoring (or not looking at) intermediate random values that are created on the way to a final return value.
From the point of view of directly computing probabilities, marginalization is summing over all the possible "histories" that could lead to a return value.
Putting the product and sum rules together, the marginal probability of return values from a program that we have explored above is the sum over sampling histories of the product over choice probabilities---a computation that can quickly grow unmanageable, but can be approximated by sampling.


# Stochastic recursion

[Recursive functions](appendix-scheme.html#recursion) are a powerful way to structure computation in deterministic systems.
In Church it is possible to have a *stochastic* recursion that randomly decides whether to stop.
For example, the *geometric distribution* is a probability distribution over the non-negative integers.
We imagine flipping a (weighted) coin, returning $$N-1$$ if the first `true` is on the Nth flip (that is, we return the number of times we get `false` before our first `true`):

~~~~
var geometric = function (p) {
    flip(p) ? 0 : 1 + geometric(p);
};
viz.hist(repeat(1000, function () {
    return geometric(0.6);
}));
~~~~

There is no upper bound on how long the computation can go on, although the probability of reaching some number declines quickly as we go.
Indeed, stochastic recursions must be constructed to halt eventually (with probability 1).


# Persistent Randomness: `mem`

It is often useful to model a set of objects that each have a randomly chosen property. For instance, describing the eye colors of a set of people:

~~~~
var eyeColor = cache(function (person) {
    return uniformDraw(['blue', 'green', 'brown']);
});
[eyeColor('bob'), eyeColor('alice'), eyeColor('bob')];
~~~~

The results of this generative process are clearly wrong: Bob's eye color can change each time we ask about it! What we want is a model in which eye color is random, but *persistent.* We can do this using another Church primitive: `mem`. `mem` is a higher order function that takes a procedure and produces a *memoized* version of the procedure.
When a stochastic procedure is memoized, it will sample a random value the *first* time it is used for some arguments, but return that same value when called with those arguments thereafter.
The resulting memoized procedure has a persistent value within each "run" of the generative model (or simulated world). For instance consider the equality of two flips, and the equality of two memoized flips:

~~~~
flip() == flip()
~~~~

~~~~
var cacheFlip = cache(flip);
cacheFlip() == cacheFlip()
~~~~

Now returning to the eye color example, we can represent the notion that eye color is random, but each person has a fixed eye color.

~~~~
var eyeColor = cache(function (person) {
    return uniformDraw(['blue', 'green', 'brown']);
});
[eyeColor('bob'), eyeColor('alice'), eyeColor('bob')];
~~~~

This type of modeling is called *random world* style [@Mcallester2008].
Note that we don't have to specify ahead of time the people whose eye color we will ask about: the distribution on eye colors is implicitly defined over the infinite set of possible people, but only constructed "lazily" when needed.
Memoizing stochastic functions thus provides a powerful toolkit to represent and reason about an unbounded set of properties of an unbounded set of objects.
For instance, here we define a function `flip-n` that encodes the outcome of the $$n$$th flip of a particular coin:

~~~~
var flipN = cache(function (n) {
    return flip()
});
[
    [flipN(1), flipN(12), flipN(47), flipN(1548)],
    [flipN(1), flipN(12), flipN(47), flipN(1548)]
];
~~~~

There are a countably infinite number of such flips, each independent
of all the others. The outcome of each, once determined, will always have the same value.

In computer science memoization is an important technique for optimizing programs by avoiding repeated work.
In the probabilistic setting, such as in Church, memoization actually affects the meaning of the memoized function.

# Example: Bayesian Tug of War

Imagine a game of tug of war, where each person may be strong or weak, and may be lazy or not on each match.
If a person is lazy they only pull with half their strength.
The team that pulls hardest will win.
We assume that strength is a continuous property of an individual, and that on any match, each person has a 25% chance of being lazy.
This Church program runs a tournament between several teams, mixing up players across teams.
Can you guess who is strong or weak, looking at the tournament results?

~~~~
var strength = cache(function (person) { gaussian(0, 1) });
var lazy = function (person) { flip(0.25) }
var pulling = function (person) { lazy(person) ? strength(person)/2 : strength(person);}
var totalPulling = function (team) { sum(map(pulling, team)) }
var winner = function (team1, team2) {
    totalPulling(team1) < totalPulling(team2) ? team2 : team1
    };
[
    winner(['alice', 'bob'], ['sue', 'tom']),
    winner(['alice', 'bob'], ['sue', 'tom']),
    winner(['alice', 'sue'], ['bob', 'tom']),
    winner(['alice', 'sue'], ['bob', 'tom']),
    winner(['alice', 'tom'], ['bob', 'sue']),
    winner(['alice', 'tom'], ['bob', 'sue'])
];
~~~~

Notice that `strength` is memoized because this is a property of a person true across many matches, while `lazy` isn't.
Each time you run this program, however, a new "random world" will be created: people's strengths will be randomly re-generated, then used in all the matches.

# Example: Intuitive physics

Humans have a deep intuitive understanding of everyday physics---this allows us to make furniture, appreciate sculpture, and play baseball.
How can we describe this intuitive physics? One approach is to posit that humans have a generative model that captures key aspects of real physics, though perhaps with approximations and noise.
This mental physics simulator could for instance approximate Newtonian mechanics, allowing us to imagine the future state of a collection of (rigid) bodies.
We have included such a 2-dimensional physics simulator, the function `runPhysics`, that takes a collection of physical objects and runs physics 'forward' by some amount of time.
(We also have `animatePhysics`, which does the same, but gives us an animation to see what is happening.)
We can use this to imagine the outcome of various initial states, as in the Plinko machine example above:

~~~~
var dim = function () { uniform(5, 20) }
var staticDim = function () { uniform(10, 50) }
var shape = function () { flip() ? 'circle' : 'rect' }
var xpos = function () { uniform(100, minus(worldWidth, 100)) }
var ypos = function () { uniform(100, minus(worldHeight, 100)) }
// an object in the word is a list of two things:
//  shape properties: a list of SHAPE ("rect" or "circle"), IS_STATIC (#t or #f),
//                    and dimensions (either (list WIDTH HEIGHT) for a rect or
//                    (list RADIUS) for a circle
//  position: (list X Y)
var makeFallingShape = function () {
    [
        [shape(), false, [dim(), dim()]],
        [xpos(), 0]
    ]
}
var makeStaticShape = function () {
    [
        [shape(), true, [staticDim(), staticDim()] ],
        [xpos(), ypos()]
    ]
}
var ground = [
    ['rect', true, [worldWidth, 10]],
    [worldWidth/2, worldHeight]
]
var fallingWorld = [
    ground,
    makeFallingShape(),
    makeFallingShape(),
    makeFallingShape(),
    makeStaticShape(),
    makeStaticShape()
]
physics.animate(1000, fallingWorld);
~~~~

There are many judgments that you could imagine making with such a physics simulator.
@Hamrick2011 have explored human intuitions about the stability of block towers.
Look at several different random block towers; first judge whether you think the tower is stable, then simulate to find out if it is:

~~~~
var xCenter = worldWidth / 2
var getWidth = function (worldObj) { first(third(first(worldObj))) }
var getHeight = function (worldObj) { second(third(first(worldObj))) }
var getX = function (worldObj) { first(second(worldObj)) }
var getY = function (worldObj) { second(second(worldObj)) }
var ground = [
  ['rect', true, [worldWidth, 10]],
  [worldWidth/2, worldHeight]
];
var dim = function() {
  uniform(10, 50)
};
var xpos = function(prevBlock) {
  var prevW = getWidth(prevBlock)
  var prevX = getX(prevBlock)
  uniform(minus(prevX, prevW), plus(prevX, prevW))
};
var ypos = function(prevBlock, h) {
  var prevY = getY(prevBlock)
  var prevH = getHeight(prevBlock)
  prevY - (prevH + h)
};

var addBlock = function(prevBlock, isFirst) {
  var w = dim()
  var h = dim()
  return [['rect', false, [w, h]],
          [isFirst ? xCenter : xpos(prevBlock), ypos(prevBlock, h)]]
};

var makeTowerWorld = function () {
  var firstBlock = addBlock(ground, true);
  var secondBlock = addBlock(firstBlock, false);
  var thirdBlock = addBlock(secondBlock, false);
  var fourthBlock = addBlock(thirdBlock, false);
  var fifthBlock = addBlock(fourthBlock, false);
  return [ground, firstBlock, secondBlock, thirdBlock, fourthBlock, fifthBlock]
};

physics.animate(1000, makeTowerWorld())
~~~~

Were you often right?
Were there some cases of 'surprisingly stable' towers?  @Hamrick2011 account for these cases by positing that people are not entirely sure where the blocks are initially (perhaps due to noise in visual perception).
Thus our intuitions of stability are really stability given noise (or the expected stability marginalizing over slightly different initial configurations).
We can realize this measure of stability as:

~~~~
var listMin = function(xs) {
  if (xs.length == 1) {
    return xs[0]
  } else {
    return Math.min(xs[0], listMin(rest(xs)))
  }
}

var getWidth = function (worldObj) { first(third(first(worldObj))) }
var getHeight = function (worldObj) { second(third(first(worldObj))) }
var getX = function (worldObj) { first(second(worldObj)) }
var getY = function (worldObj) { second(second(worldObj)) }
var isStatic = function (worldObj) { second(first(worldObj)) }
var ground = [
  ['rect', true, [worldWidth, 10]],
  [worldWidth/2, worldHeight+6]
]
var stableWorld = [
  ground,
  [['rect', false, [60, 22]], [175, 473]],
  [['rect', false, [50, 38]], [159.97995044874122, 413]],
  [['rect', false, [40, 35]], [166.91912737427202, 340]],
  [['rect', false, [30, 29]], [177.26195677111082, 276]],
  [['rect', false, [11, 17]], [168.51354470809122, 230]]
]
var almostUnstableWorld = [
  ground,
  [['rect', false, [24, 22]], [175, 473]],
  [['rect', false, [15, 38]], [159.97995044874122, 413]],
  [['rect', false, [11, 35]], [166.91912737427202, 340]],
  [['rect', false, [11, 29]], [177.26195677111082, 276]],
  [['rect', false, [11, 17]], [168.51354470809122, 230]]
]
var unstableWorld = [
  ground,
  [['rect', false, [60, 22]], [175, 473]],
  [['rect', false, [50, 38]], [90, 413]],
  [['rect', false, [40, 35]], [140, 340]],
  [['rect', false, [10, 29]], [177.26195677111082, 276]],
  [['rect', false, [50, 17]], [140, 230]]
]
var doesTowerFall = function (initialW, finalW) {
  var highestY = function (world) {
    listMin(map(getY, world))
  }

  var eps = 1

  var approxEqual = function (a, b) {
    Math.abs(a - b) < eps
  }
  !approxEqual(highestY(initialW), highestY(finalW))
}
var noisify = function (world) {
  var xNoise = function (worldObj) {
    var noiseWidth = 10
    var newX = function (x) { uniform(x - noiseWidth, x + noiseWidth) }

    isStatic(worldObj) ? worldObj : [
      first(worldObj),
      [newX(getX(worldObj)), getY(worldObj)]
    ]
  }
  map(xNoise, world)
}
var runStableTower = function () {
  var initialWorld = noisify(stableWorld)
  var finalWorld = physics.run(1000, initialWorld)
  doesTowerFall(initialWorld, finalWorld)
}
var runAlmostUnstableTower = function () {
  var initialWorld = noisify(almostUnstableWorld)
  var finalWorld = physics.run(1000, initialWorld)
  doesTowerFall(initialWorld, finalWorld)
}
var runUnstableTower = function () {
  var initialWorld = noisify(unstableWorld)
  var finalWorld = physics.run(1000, initialWorld)
  doesTowerFall(initialWorld, finalWorld)
}

print(repeat(10, runStableTower))
print(repeat(10, runAlmostUnstableTower))
print(repeat(10, runUnstableTower))

// uncomment any of these that you'd like to see for yourself
// physics.animate(1000, stableWorld)
// physics.animate(1000, almostUnstableWorld)
// physics.animate(1000, unstableWorld)
~~~~

Test your knowledge: [Exercises]({{site.baseurl}}/exercises/02-generative-models.html)

Next chapter: [Conditioning]({{site.baseurl}}/chapters/03-conditioning.html)
