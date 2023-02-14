---
layout: exercise
title: Conditional dependence - exercises
---


## Exercise 1: Epidemiology

Imagine that you are an epidemiologist and you are determining people's cause of death.
In this simplified world, there are two main diseases, cancer and the common cold.
People rarely have cancer, $$p( \text{cancer}) = 0.00001$$, but when they do have cancer, it is often fatal, $$p( \text{death} \mid \text{cancer} ) = 0.9$$.
People are much more likely to have a common cold, $$p( \text{cold} ) = 0.2$$, but it is rarely fatal, $$p( \text{death} \mid \text{cold} ) = 0.00006$$.
Very rarely, people also die of other causes $$p(\text{death} \mid \text{other}) = 0.000000001$$.

Write this model in WebPPL and use `Infer` to answer these questions (Be sure to include your code in your answer):

### a)

Compute $$p( \text{cancer} \mid \text{death} , \text{cold} )$$ and $$p( \text{cancer} \mid \text{death} , \text{no cold} )$$.
How do these probabilities compare to $$p( \text{cancer} \mid \text{death} )$$ and $$p( \text{cancer} )$$?
Using these probabilities, give an example of explaining away.

~~~~ 
display("prior")
viz.table(Infer({method: 'enumerate'}, function() {
  ...
}));
~~~~

~~~~
display("death")
viz.table(Infer({method: 'enumerate'}, function() {
  ...
}));
~~~~

~~~~
display("death and cold")
viz.table(Infer({method: 'enumerate'}, function() {
  ...
}));
~~~~

~~~~
display("death and no cold")
viz.table(Infer({method: 'enumerate'}, function() {
  ...
}));
~~~~

### b)

Compute $$p( \text{cold} \mid \text{death} , \text{cancer} )$$ and $$p( \text{cold} \mid \text{death} , \text{no cancer} )$$.
How do these probabilities compare to $$p( \text{cold} \mid \text{death} )$$ and $$p( \text{cold} )$$?
Using these probabilities, give an example of explaining away.

~~~~ 
display("prior")
viz.table(Infer({method: 'enumerate'}, function() {
  ...
}));
~~~~

~~~~
display("death")
viz.table(Infer({method: 'enumerate'}, function() {
  ...
}));
~~~~

~~~~
display("death and cancer")
viz.table(Infer({method: 'enumerate'}, function() {
  ...
}));
~~~~

~~~~
display("death and no cancer")
viz.table(Infer({method: 'enumerate'}, function() {
  ...
}));
~~~~

## Exercise 2: Monty Hall.

Here, we will use the tools of Bayesian inference to explore a classic statistical puzzle -- the Monty Hall problem.
Here is one statement of the problem:

> Alice is on a game show, and she's given the choice of three doors.
> Behind one door is a car; behind the others, goats.
> She picks door 1. The host,
> Monty, knows what's behind the doors and opens another door, say No. 3, revealing a goat.
> He then asks Alice if she wants to switch doors.
> Should she switch?

Intuitively, it may seem like switching doesn't matter.
However, the canonical solution is that you *should* switch doors.
We will explore why this is the case.

For this problem, we will assume (condition) that we observe Monty opening the door that
is neither Alice's door nor the prize door.

### Exercise 2.1

The decision to switch depends crucially on how you believe Monty chooses doors to pick.
First, write the model such that the host *randomly* picks doors (for this, fill in `montyRandom`).
In this setting, should Alice switch, or does it not matter?

~~~~
///fold: 
var removeBadItems = function(l, badItems) {
  return reduce(function(badItem, remainingL) {
    return remove(badItem, remainingL)
  }, l, badItems);
}

var doors = [1, 2, 3];
///

var montyRandom = function(aliceDoor, prizeDoor) {
  return Infer({method: 'enumerate'}, function() {
    return ...
  })
};

var model = function(switch_cond) {
  var aliceDoor = ...
  var prizeDoor = ...
  var montyDoor = ...
  
  condition(montyDoor != prizeDoor);
  condition(montyDoor != aliceDoor);
  
  return ...
}

display("P(win) if Alice doesn't switch");
viz.auto(Infer({method: 'enumerate'}, function() {model(false)}));
display("P(win) if Alice does switch");
viz.auto(Infer({method: 'enumerate'}, function() {model(true)}));
~~~~


### Exercise 2.2

This time, fill in the code so that Monty behaves according to the original Monty Hall problem,
i.e. picking the door that is neither the prize door nor Alice's door.
For both-avoiding Monty, you'll find that Alice *should* switch.

~~~~
///fold: 
var removeBadItems = function(l, badItems) {
  return reduce(function(badItem, remainingL) {
    return remove(badItem, remainingL)
  }, l, badItems);
}

var doors = [1, 2, 3];
///

var montyAvoidBoth = function(aliceDoor, prizeDoor) {
  return Infer({method: 'enumerate'}, function() {
    return ...
  })
};

var model = function(switch_cond) {
  var aliceDoor = ...
  var prizeDoor = ...
  var montyDoor = ...
  
  condition(montyDoor != prizeDoor);
  condition(montyDoor != aliceDoor);
  
  return ...
}

display("P(win) if Alice doesn't switch");
viz.auto(Infer({method: 'enumerate'}, function() {model(false)}));
display("P(win) if Alice does switch");
viz.auto(Infer({method: 'enumerate'}, function() {model(true)}));
~~~~


### Exercise 2.3

This is unintuitive  -- we know that Monty picked door 3, so why should the process he used to arrive at this choice matter?
By hand, complete the probability table for P(Alice, Prize, Monty) under both `montyRandom` and `montyAvoidBoth`.
Your tables should look like:

Alice's door|   Prize door|     Monty's Door|   P(Alice, Prize, Monty)
-------------|  -----------|    -------------|  -----------------------
1|              1|              1|              ...
1|              1|              2|              ...
...|            ...|            ...|            ...

Using these tables, explain why Alice should switch for both-avoiding Monty but why switching doesn't matter for random Monty.
Hint: you will want to compare particular *rows* of these tables.


### Exercise 2.4

This time, fill in the code so that Monty randomly chooses between the two doors that aren't Alice's door.
What should Alice do now?

~~~~
///fold: 
var removeBadItems = function(l, badItems) {
  return reduce(function(badItem, remainingL) {
    return remove(badItem, remainingL)
  }, l, badItems);
}

var doors = [1, 2, 3];
///

var montyAvoidAlice = function(aliceDoor, prizeDoor) {
  return Infer({method: 'enumerate'}, function() {
    return ...
  })
};

var model = function(switch_cond) {
  var aliceDoor = ...
  var prizeDoor = ...
  var montyDoor = ...
  
  condition(montyDoor != prizeDoor);
  condition(montyDoor != aliceDoor);
  
  return ...
}

display("P(win) if Alice doesn't switch");
viz.auto(Infer({method: 'enumerate'}, function() {model(false)}));
display("P(win) if Alice does switch");
viz.auto(Infer({method: 'enumerate'}, function() {model(true)}));
~~~~


### Exercise 2.5

This time, fill in the code so that Monty randomly chooses between the two doors that aren't the prize door.
What should Alice do now?

~~~~
///fold: 
var removeBadItems = function(l, badItems) {
  return reduce(function(badItem, remainingL) {
    return remove(badItem, remainingL)
  }, l, badItems);
}

var doors = [1, 2, 3];
///

var montyAvoidPrize = function(aliceDoor, prizeDoor) {
  return Infer({method: 'enumerate'}, function() {
    return ...
  })
};

var model = function(switch_cond) {
  var aliceDoor = ...
  var prizeDoor = ...
  var montyDoor = ...
  
  condition(montyDoor != prizeDoor);
  condition(montyDoor != aliceDoor);
  
  return ...
}

display("P(win) if Alice doesn't switch");
viz.auto(Infer({method: 'enumerate'}, function() {model(false)}));
display("P(win) if Alice does switch");
viz.auto(Infer({method: 'enumerate'}, function() {model(true)}));
~~~~


### Exercise 2.6

The psychological question is why do people have the initial intuition that switching shouldn’t matter?
Given your explorations, propose a hypothesis.
Can you think of an experiment that would test this hypothesis?
