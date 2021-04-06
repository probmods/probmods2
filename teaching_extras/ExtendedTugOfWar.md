---
layout: exercise
title: Extended tug-of-war
---


Recall the Tug of War model:

~~~~
var model = function() {
  var strength = mem(function (person) {return Math.max(gaussian(1, 1), 0.01)})
  var lazy = function(person) {return flip(1/3) }
  var pulling = function(person) {
    return lazy(person) ? strength(person) / 2 : strength(person) }
  var totalPulling = function (team) {return sum(map(pulling, team))}
  var winner = function (team1, team2) {
    totalPulling(team1) > totalPulling(team2) ? team1 : team2 }
  var beat = function(team1,team2){_.isEqual(winner(team1,team2), team1)}

  condition(beat(['bob', 'mary'], ['tom', 'sue']))

  return strength('bob')
}

var dist = Infer(model)

print('Expected strength: ' + expectation(dist))
viz(dist)
~~~~

Find an example of *explaining away*. What evidence would cancel out the initial belief that Bob is stronger than average?

## Cleverness

Now let's extend this example. People likely have several properties that affect their performance. Let's call them `strength` and `cleverness`. The outcome of most games likely depends on both proprerties, but some games may depend more on one than the other. Extend the model to include both properties and to have two different games, that depend differently on them.

~~~~
var model = function() {
  var strength = mem(function (person) {return Math.max(gaussian(1, 1), 0.01)})
  var lazy = function(person) {return flip(1/3) }
  var pulling = function(person) {
    return lazy(person) ? strength(person) / 2 : strength(person) }
  var totalPulling = function (team) {return sum(map(pulling, team))}
  var winner = function (team1, team2) {
    totalPulling(team1) > totalPulling(team2) ? team1 : team2 }
  var beat = function(team1,team2){_.isEqual(winner(team1,team2), team1)}

  condition(beat(['bob', 'mary'], ['tom', 'sue']))

  return strength('bob')
}

var dist = Infer(model)

print('Expected strength: ' + expectation(dist))
viz(dist)
~~~~

Note that `strength` and `cleverness` are *a priori* independent in your model. Show that after an observed outcome they are now statistically dependent. Can you find examples where new evidence explains away elevated `strength` but not `cleverness`?



## Mindsets

The initial Tug of War model reflects what psychologists might call a *fixed mindset*: each person has a fixed quality (`strength`) that affects their performance and that they can't change. Importantly, if Bob has a choice of playing a strong player (Alice) or a weak one (Jim) he has every reason to choose Jim, who he expects to beat. An alternative intuitive theory is called a *growth mindset*: a person's strength depends on what matches they've played before, and how difficult these matches were. Can you modify the Tug of War model to reflect this growth mindset?

~~~~
var model = function() {
  var strength = mem(function (person) {return Math.max(gaussian(1, 1), 0.01)})
  var lazy = function(person) {return flip(1/3) }
  var pulling = function(person) {
    return lazy(person) ? strength(person) / 2 : strength(person) }
  var totalPulling = function (team) {return sum(map(pulling, team))}
  var winner = function (team1, team2) {
    totalPulling(team1) > totalPulling(team2) ? team1 : team2 }
  var beat = function(team1,team2){_.isEqual(winner(team1,team2), team1)}

  condition(beat(['bob', 'mary'], ['tom', 'sue']))

  return strength('bob')
}

var dist = Infer(model)

print('Expected strength: ' + expectation(dist))
viz(dist)
~~~~

Imagine Bob's ultimate goal is to beat the super strong player, Slim. Will he decide to first play Alice (strong) or Jim (less strong)?



