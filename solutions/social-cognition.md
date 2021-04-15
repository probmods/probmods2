---
layout: exercise
title: Inference about inference - exercises
---

## Exercise 1: Tricky Agents

> What would happen if Sally knew you were watching her and wanted to deceive you?

### Exercise 1.1

> Complete the code below so that `chooseAction` chooses a misdirection if Sally is deceptive.
> Then describe and show what happens if you knew Sally was deceptive and chose action "b".

~~~~
var actionPrior = Categorical({vs: ['a', 'b', 'c'],
                               ps: [1/3, 1/3, 1/3]});
var foodPrior = Categorical({vs: ['bagel', 'cookie', 'doughnut'],
                             ps: [1/3, 1/3, 1/3]});

var vendingMachine = function(state, action) {
  return action == 'a' ? categorical({vs: ['bagel', 'cookie', 'doughnut'],
                                      ps: [.8, .1, .1]}) :
         action == 'b' ? categorical({vs: ['bagel', 'cookie', 'doughnut'],
                                      ps: [.1, .8, .1]}) :
         action == 'c' ? categorical({vs: ['bagel', 'cookie', 'doughnut'],
                                      ps: [.1, .1, .8]}) :
         'nothing';
}

var chooseAction = function(goal, transition, state, deceive) {
  return Infer({method: 'enumerate'}, function() {
    var action = sample(actionPrior);
    var outcome = transition(state, action);
    condition(deceive ? !goal(outcome) : goal(outcome));
    return action;
  })
};

var goalPosterior = Infer({method: 'enumerate'}, function() {
  var deceive = flip();
  var goalFood = sample(foodPrior);
  var goal = function(outcome) {return outcome == goalFood};
  var sallyActionDist = chooseAction(goal, vendingMachine, 'state', deceive);
  condition(deceive);
  condition(sample(sallyActionDist) == 'b');
  return goalFood;
});

viz.auto(goalPosterior);
~~~~

Results: The probabilities that Sally wants a bagel or doughnut (p=0.45 for both) are much larger than
the probability she wants a cookie (p=0.1).

### Exercise 1.2

> You observe that Sally chooses `a`, and then `b`.
How likely is it that she is deceptive?
What if you instead observed that she chose `b` and then `b` again?
Explain how deceptiveness and preferences interact to produce her actions.

~~~~
///fold:
var actionPrior = Categorical({vs: ['a', 'b', 'c'],
                               ps: [1/3, 1/3, 1/3]});
var foodPrior = Categorical({vs: ['bagel', 'cookie', 'doughnut'],
                             ps: [1/3, 1/3, 1/3]});

var vendingMachine = function(state, action) {
  return action == 'a' ? categorical({vs: ['bagel', 'cookie', 'doughnut'],
                                      ps: [.8, .1, .1]}) :
         action == 'b' ? categorical({vs: ['bagel', 'cookie', 'doughnut'],
                                      ps: [.1, .8, .1]}) :
         action == 'c' ? categorical({vs: ['bagel', 'cookie', 'doughnut'],
                                      ps: [.1, .1, .8]}) :
         'nothing';
}

var chooseAction = function(goal, transition, state, deceive) {
  return Infer({method: 'enumerate'}, function() {
    var action = sample(actionPrior);
    var outcome = transition(state, action);
    condition(deceive ? !goal(outcome) : goal(outcome));
    return action;
  })
};
///

var goalPosterior = Infer({method: 'enumerate'}, function() {
  var deceive = flip();
  var goalFood = sample(foodPrior);
  var goal = function(outcome) {return outcome == goalFood};
  var sallyActionDist = chooseAction(goal, vendingMachine, 'state', deceive);
  
  // condition(sample(sallyActionDist) == 'a'); // case 1
  condition(sample(sallyActionDist) == 'b'); // case 2
  condition(sample(sallyActionDist) == 'b');
  return goalFood;
});

viz.auto(goalPosterior);

var possibleActions = Infer({method: 'enumerate'}, function() {
  var deceive = flip();
  var goalFood = sample(foodPrior);
  var goal = function(outcome) {return outcome == goalFood};
  var sallyActionDist = chooseAction(goal, vendingMachine, 'state', deceive);
  
  condition(deceive);
  var outcome1 = sample(sallyActionDist);
  var outcome2 = sample(sallyActionDist);
  return {o1: outcome1, o2: outcome2};
});

viz.auto(possibleActions);
~~~~

When Sally chooses `a` and `b`, it's unlikely that she wanted a bagel or a cookie since she would have then selected
`a` twice or `b` twice.
However, if she really wanted a doughnut and deceptive, it makes sense that she would avoid `c` both times.
When Sally chooses `b` twice, the scenario where she's honest is much more consistent with the outcome.
In the second visualization above, we can see that if Sally is deceptive, the probability of any two actions is
relatively uniform. However, if we set `condition(!deceive)` instead, we see much higher peaks for pairs of the same
actions.


## Exercise 2: Monty Hall.

> Here, we will use the tools of Bayesian inference to explore a classic statistical puzzle -- the Monty Hall problem.
Here is one statement of the problem:
> 
>> Alice is on a game show, and she's given the choice of three doors.
>> Behind one door is a car; behind the others, goats.
>> She picks door 1. The host,
>> Monty, knows what's behind the doors and opens another door, say No. 3, revealing a goat.
>> He then asks Alice if she wants to switch doors.
>> Should she switch?
> 
> Intuitively, it may seem like switching doesn't matter.
> However, the canonical solution is that you *should* switch doors.
> We will explore why this is the case.

### Exercise 2.1

> The decision to switch depends crucially on how you believe Monty chooses doors to pick.
First, write the model such that the host *randomly* picks doors (for this, fill in `montyRandom`).
In this setting, should Alice switch, or does it not matter?
Hint: it is useful to condition on the exact doors that we discussed in the problem description.

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
    return categorical({vs: doors});
  })
};

var model = function(switches) {
  var aliceDoor = categorical({vs: doors});
  var prizeDoor = categorical({vs: doors});

  var montyDoorDist = montyRandom(aliceDoor, prizeDoor);
  var montyDoor = sample(montyDoorDist);
  var aliceDoor = switches ? removeBadItems(doors, [aliceDoor, montyDoor])[0] : aliceDoor;
  
  return aliceDoor == prizeDoor;
}

display("P(win) if Alice doesn't switch");
viz.auto(Infer({method: 'enumerate'}, function() {model(false)}));
display("P(win) if Alice does switch");
viz.auto(Infer({method: 'enumerate'}, function() {model(true)}));
~~~~

In this case, it doesn't matter whether Alice switches.
*A priori*, all doors are equally likely to be the prize door.
Monty has eliminated one, but there's no reason to favor either of the other two.

### Exercise 2.2

> This time, fill in the code so that Monty behaves according to the original Monty Hall problem,
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
    var montyDoor = categorical({vs: doors});
    condition(montyDoor != aliceDoor);
    condition(montyDoor != prizeDoor);
    return montyDoor;
  })
};

var model = function(switches) {
  var aliceDoor = categorical({vs: doors});
  var prizeDoor = categorical({vs: doors});

  var montyDoorDist = montyAvoidBoth(aliceDoor, prizeDoor);
  var montyDoor = sample(montyDoorDist);
  var aliceDoor = switches ? removeBadItems(doors, [aliceDoor, montyDoor])[0] : aliceDoor;
  
  return aliceDoor == prizeDoor;
}

display("P(win) if Alice doesn't switch");
viz.auto(Infer({method: 'enumerate'}, function() {model(false)}));
display("P(win) if Alice does switch");
viz.auto(Infer({method: 'enumerate'}, function() {model(true)}));
~~~~

By running the model, we see that switching doors allows Alice to find the car 2/3 of the time.

### Exercise 2.3

> This is unintuitive  -- we know that Monty picked door 3, so why should the process he used to arrive at this choice matter?
By hand, complete the probability table for P(Alice, Prize, Monty) under both `montyRandom` and `montyAvoidBoth`.
Your tables should look like:

> Alice's door|   Prize door|     Monty's Door|   P(Alice, Prize, Monty)
-------------|  -----------|    -------------|  -----------------------
1|              1|              1|              ...
1|              1|              2|              ...
...|            ...|            ...|            ...

> Using these tables, explain why Alice should switch for both-avoiding Monty but why switching doesn't matter for random Monty.
Hint: you will want to compare particular *rows* of these tables.

| Alice's Door | Prize Door | Monty's Door | P(Alice, Prize, Monty) |
|--------------|------------|--------------|------------------------|
| 1            | 1          | 1            | 0.037                  |
| 1            | 1          | 2            | 0.037                  |
| 1            | 1          | 3            | 0.037                  |
| 1            | 2          | 1            | 0.037                  |
| 1            | 2          | 2            | 0.037                  |
| 1            | 2          | 3            | 0.037                  |
| 1            | 3          | 1            | 0.037                  |
| 1            | 3          | 2            | 0.037                  |
| 1            | 3          | 3            | 0.037                  |
| 2            | 1          | 1            | 0.037                  |
| 2            | 1          | 2            | 0.037                  |
| 2            | 1          | 3            | 0.037                  |
| 2            | 2          | 1            | 0.037                  |
| 2            | 2          | 2            | 0.037                  |
| 2            | 2          | 3            | 0.037                  |
| 2            | 3          | 1            | 0.037                  |
| 2            | 3          | 2            | 0.037                  |
| 2            | 3          | 3            | 0.037                  |
| 3            | 1          | 1            | 0.037                  |
| 3            | 1          | 2            | 0.037                  |
| 3            | 1          | 3            | 0.037                  |
| 3            | 2          | 1            | 0.037                  |
| 3            | 2          | 2            | 0.037                  |
| 3            | 2          | 3            | 0.037                  |
| 3            | 3          | 1            | 0.037                  |
| 3            | 3          | 2            | 0.037                  |
| 3            | 3          | 3            | 0.037                  |

If we condition on Alice choosing Door 1, Monty choosing Door 3, and Door 3 not being the prize,
there are only two remaining possibilities:  

| Alice's Door | Prize Door | Monty's Door | P(Alice, Prize, Monty) |
|--------------|------------|--------------|------------------------|
| 1            | 1          | 3            | 0.037                  |
| 1            | 2          | 3            | 0.037                  |

These are equally likely in the prior and thus equally likely in the posterior.

Under `montyAvoidBoth`:

| Alice's Door | Prize Door | Monty's Door | P(Alice, Prize, Monty) |
|--------------|------------|--------------|------------------------|
| 1            | 1          | 1            | 0                      |
| 1            | 1          | 2            | 0.06                   |
| 1            | 1          | 3            | 0.06                   |
| 1            | 2          | 1            | 0                      |
| 1            | 2          | 2            | 0                      |
| 1            | 2          | 3            | 0.11                   |
| 1            | 3          | 1            | 0                      |
| 1            | 3          | 2            | 0.11                   |
| 1            | 3          | 3            | 0                      |
| 2            | 1          | 1            | 0                      |
| 2            | 1          | 2            | 0                      |
| 2            | 1          | 3            | 0.11                   |
| 2            | 2          | 1            | 0.06                   |
| 2            | 2          | 2            | 0                      |
| 2            | 2          | 3            | 0.06                   |
| 2            | 3          | 1            | 0.11                   |
| 2            | 3          | 2            | 0                      |
| 2            | 3          | 3            | 0                      |
| 3            | 1          | 1            | 0                      |
| 3            | 1          | 2            | 0.11                   |
| 3            | 1          | 3            | 0                      |
| 3            | 2          | 1            | 0.11                   |
| 3            | 2          | 2            | 0                      |
| 3            | 2          | 3            | 0                      |
| 3            | 3          | 1            | 0.06                   |
| 3            | 3          | 2            | 0.06                   |
| 3            | 3          | 3            | 0                      |

Again, conditioning leaves only the two possibilities:

| Alice's Door | Prize Door | Monty's Door | P(Alice, Prize, Monty) |
|--------------|------------|--------------|------------------------|
| 1            | 1          | 3            | 0.06                   |
| 1            | 2          | 3            | 0.11                   |

Thus, in the posterior, the possibility where Door 2 is the prize door is twice as likely as the possibility where Door 1 is the prize door.
Alice should switch.

Via code:

~~~
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
    return categorical({vs: doors});
  })
};

var montyAvoidBoth = function(aliceDoor, prizeDoor) {
  return Infer({method: 'enumerate'}, function() {
    return categorical({vs: removeBadItems(doors, [aliceDoor, prizeDoor])});
  })
};

var model = function(montyFunction) {
  var aliceDoor = categorical({vs: doors});
  var prizeDoor = categorical({vs: doors});

  var montyDoorDist = montyFunction(aliceDoor, prizeDoor);
  var montyDoor = sample(montyDoorDist);
  return {alice: aliceDoor, prize: prizeDoor, monty: montyDoor};
}

display("Using montyRandom")
viz.table(Infer({method: 'enumerate'}, function() { model(montyRandom) }));

display("Using montyAvoidBoth")
viz.table(Infer({method: 'enumerate'}, function() { model(montyAvoidBoth) }));
~~~


### Exercise 2.4

> This time, fill in the code so that Monty randomly chooses between the two doors that aren't Alice's door.
> Then condition the model so that Monty doesn't choose the prize door (otherwise she should just pick it).
> What should Alice do now?

~~~
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
    var montyDoor = categorical({vs: doors});
    condition(montyDoor != aliceDoor);
    return montyDoor;
  })
};

var model = function(switches) {
  var aliceDoor = categorical({vs: doors});
  var prizeDoor = categorical({vs: doors});

  var montyDoorDist = montyAvoidAlice(aliceDoor, prizeDoor);
  var montyDoor = sample(montyDoorDist);
  var aliceDoor = switches ? removeBadItems(doors, [aliceDoor, montyDoor])[0] : aliceDoor;
  
  condition(montyDoor != prizeDoor);
  return aliceDoor == prizeDoor;
}

display("P(win) if Alice doesn't switch");
viz.auto(Infer({method: 'enumerate'}, function() {model(false)}));
display("P(win) if Alice does switch");
viz.auto(Infer({method: 'enumerate'}, function() {model(true)}));
~~~

It doesn't matter whether she switches or not.


### Exercise 2.5

> This time, fill in the code so that Monty randomly chooses between the two doors that aren't the prize door.
> What should Alice do now?

~~~
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
    var montyDoor = categorical({vs: doors});
    condition(montyDoor != prizeDoor);
    return montyDoor;
  })
};

var model = function(switches) {
  var aliceDoor = categorical({vs: doors});
  var prizeDoor = categorical({vs: doors});

  var montyDoorDist = montyAvoidPrize(aliceDoor, prizeDoor);
  var montyDoor = sample(montyDoorDist);
  var aliceDoor = switches ? removeBadItems(doors, [aliceDoor, montyDoor])[0] : aliceDoor;
  
  return aliceDoor == prizeDoor;
}

display("P(win) if Alice doesn't switch");
viz.auto(Infer({method: 'enumerate'}, function() {model(false)}));
display("P(win) if Alice does switch");
viz.auto(Infer({method: 'enumerate'}, function() {model(true)}));
~~~

Alice should switch.


### Exercise 2.6

> The psychological question is why do people have the initial intuition that switching shouldn’t matter?
> Given your explorations, propose a hypothesis.
> Can you think of an experiment that would test this hypothesis?

[Note: There’s no right answer to this, so answers may vary.]

One model might be that people believe that Monty is trying to avoid the prize door, 
or believe that he actually acts randomly.
Either possibility would lead to the prediction that Alice should be indifferent to switching.
