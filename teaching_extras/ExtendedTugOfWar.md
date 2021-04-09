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

Find an example of *explaining away*: What evidence would cancel out the initial belief that Bob is stronger than average?

## Cleverness

Now let's extend this example. People likely have several properties that affect their performance. Let's call them `strength` and `cleverness`. The outcome of most games likely depends on both proprerties, but some games may depend more on one than the other. Extend the model to include `cleverness`. Also extend the model to have two different games (say tug of war and table tennis), that depend differently on the the two factors.

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

Note that `strength` and `cleverness` are probably *a priori* independent in your model. Show that after a match outcome they are now statistically dependent. Can you find examples where new evidence explains away elevated `strength` but not `cleverness`? Can you find examples of "two hop" explaining away, where strength of one player becomes coupled to strength of another, via cleverness? These are examples of how complex patterns of inference can emerge from relatively simple beliefs about the world.



## Mindsets

The initial Tug of War model reflects what psychologists might call a *fixed mindset*: each person has a fixed quality (`strength`) that affects their performance and that they can't change. Imagine that Bob uses the model to reason about his own strength, and thence to decide which matches to play. Let's say his goal is to beat a super strong player, Slim. Because Bob believes his strength is a fixed (though unobservable) property, he doesn't other games he plays affect his chance of beating Slim. In particular, he won't seek out challenging matches in order to get better.

An alternative model is called a *growth mindset*: a person's strength depends on what matches they've played before, and how difficult these matches were. Let's modify our tug of war model to reflect a growth mindset. First, we have modified the model below to have only one player teams (for simplicity) and to define strength in terms of the match history.

~~~~
//write the matches as an array of objects that include players and outcome:
var matches = [{player1: 'bob', player2:'alice', outcome: 'player1'}]

var model = function() {
  
  //rewrite function so strength can depend on time:
  var initialStrength = mem(function(person){Math.max(gaussian(1, 1), 0.01)})
  var strength = function (person, matchnum) {
    if (matchnum<0) {
      return initialStrength(person) //initial strength prior
    }
    if (matchnum>matches.length-1){
      return strength(person,matches.length-1)
    }
    var match = matches[matchnum]
    if (match.player1==person) {
      return strength(person, matchnum-1) //no changes, despite playing
    }
    if (match.player2==person) {
      return strength(person, matchnum-1) //no changes, despite playing
    }
    return strength(person, matchnum-1) //no changes, didn't play
  }
  
  var lazy = function(person) {return flip(1/3) }
  var pulling = function(person,matchnum) {
    return lazy(person) ? strength(person,matchnum) / 2 : strength(person,matchnum) }
  var winner = function (match,matchnum) {
    pulling(match.player1,matchnum) > pulling(match.player2,matchnum) ? 'player1' : 'player2' }

  condition(strength('jim', matches.length-1)<0.5) //jim is weak to the end
  condition(strength('alice', matches.length-1)>0.5) //alice is stronger
  condition(strength('slim', matches.length-1)>1.5) //slim is super strong
  
  //condition on outcomes of all the matches:
  mapIndexed(function(i,m){condition(winner(m,i) == m.outcome)}, matches)

  return strength('bob',1) //how strong is bob at the end?
}

var dist = Infer(model)

viz(dist)
~~~~

The above model should be the same -- fixed mindset -- as the original model. 
How would you change it to encode the idea that playing improves strength?
That playing a stronger player improves strength?
That strength improves based on how much stronger the other player is?


Imagine Bob's ultimate goal is to beat the super strong player, Slim. 
He can use the above model to judge how strong he'll be after several matches, and whether he's likely to beat Slim. (Hint: you can return `winner({player1:'bob', player2:'slim'},1)=='player1' //can bob beat slim?`.)
Will Bob decide to first play Alice (strong) or Jim (less strong)? How is this decision going to be affected by the different mindsets you explored above?

NB: Psychologists call this kind of knowledge by many names: intuitive theories, lay theories, schemas, and mindsets are a few. They mean more or less the same thing, though the level of abstraction and format of representation varries from one theorist to another.

