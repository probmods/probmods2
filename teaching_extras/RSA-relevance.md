---
layout: exercise
title: Listener actions and relevance
---

In the rational speech acts (RSA) framework the available actions matter. This is the case for both the speaker, who chooses speech actions, and for the listener, who must use the information provided to act in the world.


## An action-directed utility 

In a reference game the goal, for both listener and speaker, is for the listener to choose the correct target. 
The usual RSA formulation hides this structure slightly by describing the speaker utility in terms of the information provided to the listener. This **standard utility** is $$U=\log P_L(o|u)$$, or in WebPPL code it is the line `factor(alpha * (literalListener(utterance).score(obj)))` in the speaker model.

However, we could think of the value of a speech act for the speaker as the expected payoff from whatever action the listener takes (after hearing the utterance).
Reformulate the RSA model to directly model the listener taking the action of choosing an object, and the speaker utility as depending on the game payoff -- whether the listener's choice is correct. 

~~~
~~~

Convince yourself that this action-directed formulation of the utility is equivalent to the standard information formulation of RSA. (You should at least compare simulations, but you'll understand better if you write out the math for both versions.) What do you have to assume about the payoff when the listener chooses incorrectly in order for the equivalence to hold? Discuss how this assumption fits, or doesn't, with the actual payoff of a game, and what this means about langauge.

## The effect of listener actions

Now, let's consider a slightly more complex game, where there are several aspects of the world that the listener doesn't yet know. Concretely, imagine a game where the speaker sees an object circled in red (the "red target") and another circled in blue (the "blue target"). The team gets one point if the listener circles the correct red target in red and another for circling the correct blue target in blue. Revise your action-directed RSA model to implement this new game. (You will of course need to extend the utterance space with, for example, "the red target is a square.", etc. It may be interesting to consider utterance cost as well -- "square" is simpler but less precise than "the red target is square".)

~~~
~~~

Now, what happens if the listener's actions are restricted -- for instance, if the listener doesn't have a red pen. What happens to the speaker's utterance choices? To the pragmatic listener's interpretations, especially of ambiguous utterances?

Listeners' actions are not the only way to affect what information the speaker needs to provide: Change the payoffs of the game so that only the blue target matters for the reward and verify that this is equivalent to removing the red pen.

You can have some fun with this setting! What if the payoff is twice as much for red as blue? What if the speaker isn't sure which color pen the listener will have, but suspects it will be red?  What happens if the listener is color blind, so they don't know which pen is which? 

<!--
Imagine a slightly more complex game, where some information will only be revleaed after the speaker chooses an utterance. 
For instance there may be a hidden distractor object (that the speaker can't yet see), which is revealed before the listener chooses an utterance. -->

## From reference to relevance

The above exploration should have convinced you that the speaker only needs to talk about *relevant* information: information that could conceivably affect the listener's choice for the game at hand. Indeed, it is clear that a speaker knows almost infinite details about the world and most of these would provide new, but useless information to a listener. (E.g. "My cat has a small white tuft one centimeter from his chin...") The standard RSA utility, however, rewards the listener for any new information. 

First, use the standard utility for the above game (with two targets). Does it care which pens the listener has?

~~~
~~~

Now try to modify the standard utility to take into account the listener's possible actions. What is the most compact way you can come up with to provide the speaker model a specification of relevance? Will the same notion of relevance capture (ir)relevance because of action restrictions and (ir)relevance because of game payoff structure?

~~~
~~~

What about the case where the red target matters more in the payoff, can your model capture *graded* relevance? 

More generally, what would you need in order to capture a general notion of *relevance* -- what information is worth sharing? Discuss What factors you think should impact relevance. Will they do so in your formulation?


