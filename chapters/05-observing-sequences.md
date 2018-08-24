---
layout: chapter
title: Models for sequences of observations
description: Generative models of the relations between data points
---

### Authors: Noah Goodman; Timothy J. O'Donnell; Josh Tenenbaum

<!-- Josh's HMM switching HW problem for this section? -->

In the last chapter we learned about common [patterns of inference](04-patterns-of-inference.html) that can result from a few observations, given the right model structure.
There are also many common patterns of *data* that arise from certain model structures.
It is common, for instance, to have a sequence of observations that we believe was each generated from the same causal process: a sequence of coin flips, a series of temperature readings from a weather station, the words in a sentence.
In this chapter we explore models for sequences of observations, moving from simple models to those with increasingly complex statistical dependence between the observations.


# Independent and Exchangeable Sequences

If the observations have *nothing* to do with each other, except that they have the same distribution, they are called *identically, independently distributed* (usually abbreviated to i.i.d.). For instance the values that come from calling `flip` are i.i.d. To verify this, let's first check whether the distribution of two flips in a sequence look the same (are "identical"):

~~~~
var genSequence = function() {return repeat(2, flip)}
var sequenceDist = Infer({method: 'enumerate'}, genSequence)
viz.marginals(sequenceDist)
~~~~

Now let's check that the first and second flips are independent, by conditioning on the first and seeing that the distribution of the second is (approximately) unchanged:

~~~~
var genSequence = function() {return repeat(2, flip)}
var sequenceCondDist = function(firstVal) {
  return Infer({method: 'enumerate'},
    function() {
      var s = genSequence()
      condition(s[0] == firstVal)
      return {second: s[1]};
  })
}

viz(sequenceCondDist(true))
viz(sequenceCondDist(false))
~~~~

It is easy to build other i.i.d. sequences in WebPPL; we simply construct a stochastic thunk and evaluate it several times. For instance, here is an extremely simple model for the words in a sentence:

~~~~
var words = ['chef', 'omelet', 'soup', 'eat', 'work', 'bake', 'stop']
var probs = [0.0032, 0.4863, 0.0789, 0.0675, 0.1974, 0.1387, 0.0277]
var thunk = function() {return categorical({ps: probs, vs: words})};

repeat(10, thunk)
~~~~

In this example the different words are indeed independent: you can show as above (by conditioning) that the first word tells you nothing about the second word.
However, constructing sequences in this way it is easy to accidentally create a sequence that is not entirely independent. For instance:

~~~~
var words = ['chef', 'omelet', 'soup', 'eat', 'work', 'bake', 'stop']
var probs = (flip() ?
             [0.0032, 0.4863, 0.0789, 0.0675, 0.1974, 0.1387, 0.0277] :
             [0.3699, 0.1296, 0.0278, 0.4131, 0.0239, 0.0159, 0.0194])
var thunk = function() {return categorical({ps: probs, vs: words})};

repeat(10, thunk)
~~~~

While the sequence looks very similar, the words are not independent: learning about the first word tells us something about the `probs`, which in turn tells us about the second word. Let's show this in a slightly simpler example:

~~~~
var sequenceCondDist = function(firstVal) {
  return Infer({method: 'enumerate'},
    function() {
      var prob = flip() ? 0.2 : 0.7
      var thunk = function() {return flip(prob)}
      var s = repeat(2, thunk)
      condition(s[0] == firstVal)
      return {second: s[1]}
  });
};

viz(sequenceCondDist(true))
viz(sequenceCondDist(false))
~~~~

Conditioning on the first value tells us something about the second. This model is thus not i.i.d., but it does have a slightly weaker property: it is [exchangeable](https://en.wikipedia.org/wiki/Exchangeable_random_variables), meaning that the probability of a sequence of values remains the same if permuted into any order.

It turns out that exchangeable sequences can always be modeled in the form used for the last example:
[de Finetti's theorem](https://en.wikipedia.org/wiki/De_Finetti%27s_theorem) says that, under certain technical conditions, any exchangeable sequence can be represented as follows, for some `latentPrior` distribution and `observe` function:

~~~~ norun
var latent = sample(latentPrior)
var thunk = function() {return observe(latent)}
var sequence = repeat(2,thunk)
~~~~

## Polya's urn

A classic example is the Polya urn model. Here, an urn contains some number of white and black balls. On each step we draw a random ball from the urn, note its color, and return it to the urn along with *another* ball of that color. Here is this model in WebPPL:

~~~~
var urnSeq = function(urn, samples) {
  if(samples == 0) {
    return []
  } else {
    var ball = uniformDraw(urn)
    return [ball].concat(urnSeq(urn.concat([ball]), samples-1))
  }
}

var urnDist = Infer({method: 'enumerate'},
                    function(){return urnSeq(['b', 'w'],3).join("")})

viz(urnDist)
~~~~

Observe that this model is exchangeable---permutations of a sequence all have the same probability (e.g., `bbw`, `bwb`, `wbb` have the same probability; `bww`, `wbw`, `wwb` do too).
The Polya urn is an examples of a "rich get richer" dynamic, which has many applications for modeling the real world.

Next, consider the de Finetti representation of this model:

~~~~
var urn_deFinetti = function(urn, samples) {
  var numWhite = sum(map(function(b){return b=='w'},urn))
  var numBlack = urn.length - numWhite
  var latentPrior = Beta({a: numWhite, b: numBlack})
  var latent = sample(latentPrior)
  return repeat(samples, function() {return flip(latent) ? 'b' : 'w'})
}

var urnDist = Infer({method: 'forward', samples: 10000},
                    function(){return urn_deFinetti(['b', 'w'],3).join("")})

viz(urnDist)
~~~~

Here, we sample a shared latent parameter -- in this case, a sample from a Beta distribution -- generating the sequence samples independently given this parameter.
We obtain the same distribution on sequences of draws.

<a name="markov-models"></a>
# Markov Models

Exchangeable sequences don't depend on the order of the observations, but often the order *is* important. For instance, the temperature today is highly correlated with the temperature yesterday---if we were building a model of temperature readings we would want to take this into account.
The simplest assumption we can make to include the order of the observations is that each observation depends on the previous observation, but not (directly) on the ones before that. This is called a *Markov model* (or, in linguistics and biology, a *bi-gram model*). Here is a simple Markov model for Boolean values:

~~~~
var markov = function(prevObs, n) {
  if(n == 0) {
    return [];
  } else {
    var nextObs = prevObs ? flip(0.9) : flip(0.1);
    return [nextObs].concat(markov(nextObs, n - 1));
  }
};

markov(true, 10)
~~~~

Notice that the sequences sampled from this model have "runs" of true or false more than in the i.i.d. or exchangeable models above. This is because the `nextObs` will tend to be similar to the `prevObs`. How would you adjust this model to make it tend to switch on each observation, rather than tending to stay the same?

We can use a Markov model as a better (but still drastically simplified) model for sequences of words in language.

~~~~
var vocab = ['chef', 'omelet', 'soup', 'eat', 'work', 'bake', 'stop'];
var transition = function(word) {
  var ps = (word == 'start' ? [0.0032, 0.4863, 0.0789, 0.0675, 0.1974, 0.1387, 0.0277] :
            word == 'chef' ? [0.0699, 0.1296, 0.0278, 0.4131, 0.1239, 0.2159, 0.0194] :
            word == 'omelet' ? [0.2301, 0.0571, 0.1884, 0.1393, 0.0977, 0.1040, 0.1831] :
            word == 'soup' ?  [0.1539, 0.0653, 0.0410, 0.1622, 0.2166, 0.2664, 0.0941] :
            word == 'eat' ? [0.0343, 0.0258, 0.6170, 0.0610, 0.0203, 0.2401, 0.0011] :
            word == 'work' ? [0.0602, 0.2479, 0.0034, 0.0095, 0.6363, 0.02908, 0.0133] :
            word == 'bake' ? [0.0602, 0.2479, 0.0034, 0.0095, 0.6363, 0.02908, 0.0133] :
            console.error("word (" + word + ") not recognized"))
  return categorical({vs: vocab, ps: ps});
}

var sampleWords = function(lastWord) {
  if(lastWord == 'stop') {
    return [];
  } else {
    var nextWord = transition(lastWord);
    return [lastWord].concat(sampleWords(nextWord));
  }
}

sampleWords('start')
~~~~

Each word is sampled from a categorical distribution whose parameters depend on the previous word, with this dependence specified in the `transition` function.
Notice that we control the length of the generated list here not with a fixed parameter, but by using the model itself: We start the recursion by sampling given the special symbol `start`.  
When we sample the symbol `stop` we end the recursion.
Like the geometric distribution, this [stochastic recursion](02-generative-models.html#stochastic-recursion) can produce unbounded structures---in this case lists of words of arbitrary length.

The above code may seem unnecessarily complex because it explicitly lists every transition probability. Suppose that we put a prior distribution on the multinomial transitions instead. Using `mem` this is very straightforward:

~~~~
var vocab = ['chef', 'omelet', 'soup', 'eat', 'work', 'bake', 'stop']

var wordToDistribution = mem(function(word) {
  return dirichlet(ones([vocab.length,1]))
})

var transition = function(word) {
  return categorical({ps: wordToDistribution(word), vs: vocab})
}

var sampleWords = function(lastWord) {
  if(lastWord == 'stop') {
    return []
  } else {
    var nextWord = transition(lastWord)
    return [lastWord].concat(sampleWords(nextWord))
  }
}

sampleWords('start')
~~~~

This is very much like the way we created an exchangeable model above, except instead of one unknown probability list, we have one for each previous word. Models like this are often called "hierarchical" n-gram models. We consider [hierarchical models](09-hierarchical-models.html) in more detail in a later chapter.


# Example: Subjective Randomness

What does a random sequence look like? Is 00101 more random than 00000? Is the former a better example of a sequence coming from a fair coin than the latter? Most people say so, but notice that if you flip a fair coin, these two sequences are equally probable. Yet these intuitions about randomness are pervasive and often misunderstood: In 1936 the Zenith corporation attempted to test the hypothesis the people are sensitive to psychic transmissions. During a radio program, a group of psychics would attempt to transmit a randomly drawn sequence of ones and zeros to the listeners. Listeners were asked to write down and then mail in the sequence they perceived. The data thus generated showed no systematic effect of the transmitted sequence---but it did show a strong preference for certain sequences [@Goodfellow1938].
The preferred sequences included 00101, 00110, 01100, and 01101.

@Griffiths2001 suggested that we can explain this bias if people are considering not the probability of the sequence under a fair-coin process, but the probability that the sequence would have come from a fair process as opposed to a non-uniform (trick) process:

~~~~
var isFairDist = function(sequence) {
  return Infer({method: 'enumerate'},
    function () {
      var isFair = flip()
      var realWeight = isFair ? .5 : .2;
      var coin = function() {return flip(realWeight)};
      condition(_.isEqual(sequence, repeat(5, coin)))
      return isFair
  })
}

print("00101 is fair?")
viz(isFairDist([false, false, true, false, true]))
print("00000 is fair?")
viz(isFairDist([false, false, false, false, false]))
~~~~

This model posits that when considering randomness, as well as when imagining random sequences, people are more concerned with distinguishing a "truly random" generative process from a trick process. This version of the model doesn't think 01010 looks any less random than 01100 (try it), because even its "trick process" is i.i.d. and hence does not distinguish order.
We could extend the model to consider a Markov model as the alternative (trick) generative process:

~~~~
var markov = function(isFair, prev, n) {
  if(n == 0) {
    return [];
  } else {
    var next = flip(isFair ? 0.5 :
                    prev ? 0.1 : 0.9);
    return [next].concat(markov(isFair, next, n - 1));
  }
}

var isFairDist = function(sequence) {
  return Infer({method: 'enumerate'},
    function () {
      var isFair = flip()
      var init = flip()
      condition(_.isEqual(sequence, markov(isFair, init, sequence.length)));
      return isFair
  })
}

print("00101 is fair?")
viz(isFairDist([false, false, true, false, true]))
print("01010 is fair?")
viz(isFairDist([false, true, false, true, false]))
~~~~

This version thinks that alternating sequences are non-random, but there are other non-uniform generative processes (such as all-true) that it doesn't detect. How could we extend this model to detect more non-random sequences?


# Hidden Markov Models

Another popular model in computational linguistics is the hidden Markov model (HMM). The HMM extends the Markov model by assuming that the "actual" states aren't observable. Instead there is an "observation model" that generates an observation from each "hidden state". We use the same construction as above to generate an unknown observation model.

~~~~
var ones = function(n) {return Vector(repeat(n, function() {return 1}))};
var states = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 'stop'];
var vocab = ['chef', 'omelet', 'soup', 'eat', 'work', 'bake']

var stateToObsModel = mem(function(state) {
  return dirichlet(ones(vocab.length));
})

var observation = function(state) {
  return categorical({ps: stateToObsModel(state), vs: vocab})
}

var stateToTransitionModel = mem(function(state) {
  return dirichlet(ones(states.length));
})

var transition = function(state) {
  return categorical({ps: stateToTransitionModel(state), vs: states});
}

var sampleWords = function(lastState) {
  return (lastState == 'stop' ?
          [] :
          [observation(lastState)].concat(sampleWords(transition(lastState))));
}

sampleWords('start')
~~~~


# Probabilistic Context-free Grammars

The models above generate sequences of words, but lack constituent structure (or "hierarchical structure" in the linguistic sense).

Probabilistic context-free grammars (PCFGs) are a straightforward (and canonical) way to generate sequences of words with constituent structure. There are many ways to write a PCFG in WebPPL. One especially direct way (inspired by Prolog programming) is to let each non-terminal be represented by a WebPPL function; here constituency is embodied by one procedure calling another---that is by causal dependence.

~~~~
var uniformDraw = function (xs) {return xs[randomInteger(xs.length)]};

var D  = function() {return uniformDraw(['the', 'a'])};

var N  = function() {return uniformDraw(['chef', 'soup', 'omelet'])};

var V  = function() {return uniformDraw(['cooks', 'works'])}

var A  = function() {return uniformDraw(['diligently'])}

var AP = function() {return uniformDraw([A()])}

var NP = function() {return [D(), N()]}

var VP = function() {return uniformDraw([[V(), AP()],
                                         [V(), NP()]])}

var S  = function() {return [NP(), VP()]}

S()
~~~~

Now, let's look at one of the procedures defining our PCFG in detail.

~~~~norun
var VP = function() {return uniformDraw([[V(), AP()],
                                         [V(), NP()]])}
~~~~

When `VP` is called, it samples one of two possible expansions, in this case either `[V AP]` or `[V NP]`. These two lists correspond to the "right-hand sides" (RHSs) of the rules $$VP \longrightarrow V\ AP$$ and $$VP \longrightarrow V\ NP$$ in the standard representation of PCFGs. These are lists that consist of symbols which are actually the names of other procedures. Therefore when we sample from them, they themselves recursively sample their RHSs until no more recursion can take place.  Note that our terminal symbols deterministically return the terminal symbol.

While it is most common to use PCFGs as models of strings (for linguistic applications), they can be useful as components of any probabilistic model where constituent structure is required. For instance, in a later chapter we will see how PCFGs can be used to construct the hypothesis space for models of concept learning.

<!--

TODO: consider a shortened version of this?


# Unfold

You may notice that the basic structure of computation was repeated in each non-terminal procedure for the PCFG above. Similarly, each `case` in the Markov model did the same thing.
 We can abstract out these computation pattern as a higher-order procedure. For the Markov model, where we build a list, this is called `unfold`---it describes the pattern of recursively building lists. (There is a related higher-order procedure called `fold` that can be used to process lists, rather than build them.)
`unfold` takes three arguments. The first is the current state, the second is a transition function, which returns the next state given the last one. The last argument is a predicate that stops the recursion.

~~~~
(define (unfold current transition stop?)
  (if (stop? current)
      '()
      (pair current (unfold (transition current) transition stop?))))
~~~~

With `unfold` defined we can now refactor our Markov model:

~~~~
(define (unfold current transition stop?)
   (if (stop? current)
       '()
       (pair current (unfold (transition current) transition stop?))))

(define vocabulary '(chef omelet soup eat work bake stop))

(define word->distribution
  (mem (lambda (word) (dirichlet (make-list (length vocabulary) 1)))))

(define (transition word)
  (multinomial vocabulary (word->distribution word)))

(define (stop? word) (equal? word 'stop))

(unfold 'start transition stop?)
~~~~


The PCFG can't be written with `unfold` because it builds a tree (nested list) rather than a list. However, there is a generalization of `unfold` called `tree-unfold` which will do the trick. Using `tree-unfold` we can rewrite our PCFG in a way that abstracts out the recursive structure, and looks much more like the standard notation for PCFGs:

~~~~
(define (terminal t) (list 'terminal t))

(define (unwrap-terminal t) (second t))

(define (tree-unfold transition start-symbol)
  (if (terminal? start-symbol)
      (unwrap-terminal start-symbol)   
      (pair start-symbol
            (map (lambda (symbol) (tree-unfold  transition symbol)) (transition start-symbol)))))

(define (terminal? symbol)
  (if (list? symbol)
      (equal? (first symbol) 'terminal)
      false))

(define (transition nonterminal)
  (case nonterminal
        (('D) (multinomial(list (list (terminal 'the))
                                (list (terminal 'a)))
                          (list (/ 1 2) (/ 1 2))))
        (('N) (multinomial (list (list (terminal 'chef))
                                 (list (terminal 'soup))
                                 (list (terminal 'omelet)))
                           (list (/ 1 3) (/ 1 3) (/ 1 3))))
        (('V) (multinomial (list (list (terminal 'cooks))
                                 (list (terminal 'works)))
                           (list (/ 1 2) (/ 1 2))))                
        (('A) (multinomial (list (list (terminal 'diligently)))
                           (list (/ 1 1))))
        (('AP) (multinomial (list (list 'A))
                            (list (/ 1 1))))
        (('NP) (multinomial (list (list 'D 'N))
                            (list (/ 1 1))))
        (('VP) (multinomial (list (list 'V 'AP)
                                  (list 'V 'NP))
                            (list (/ 1 2) (/ 1 2))))
        (('S) (multinomial (list (list 'NP 'VP))
                           (list (/ 1 1))))
        (else 'error)))


(tree-unfold transition 'S)
~~~~

Note that this samples a hierarchical (or "parenthesized") sequence of terminals. How would you "flatten" this to return a sequence without parentheses?
-->

Reading & Discussion: [Readings]({{site.baseurl}}/readings/05-observing-sequences.html)

Test your knowledge: [Exercises]({{site.baseurl}}/exercises/05-observing-sequences.html)

Next chapter: [Inference about inference]({{site.baseurl}}/chapters/06-inference-about-inference.html)
