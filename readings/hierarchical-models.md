---
layout: exercise
title: Hierarchical models - readings
description: The power of abstraction.
---


## 1. The "no negative evidence" problem

@perfors2010variability

#### Reading questions:

a) What is a linguistic alternation, such as the dative alternation?

See if ChatGPT's answer roughly matches what you learned from the paper. If not, what would you correct?

> A linguistic alternation is a phenomenon in language where different syntactic structures are used to express the same meaning. One example of a linguistic alternation is the dative alternation, also known as the double object construction.

>The dative alternation involves the use of two different syntactic structures to convey the same meaning, specifically the transfer of an object from one person or thing to another. In one structure, the indirect object (the recipient) appears as a prepositional phrase introduced by the preposition "to", while the direct object (the transferred object) appears as a noun phrase. In the other structure, the indirect object appears as a noun phrase, while the direct object appears as a prepositional phrase introduced by the preposition "to".

>For example, in the sentence "I gave the book to Mary," "Mary" is the indirect object introduced by the preposition "to," while "book" is the direct object. In the dative alternation, the same meaning can be expressed using the sentence "I gave Mary the book," where "Mary" is the indirect object expressed as a noun phrase, and "book" is the direct object expressed as a prepositional phrase.

>The dative alternation is one of many syntactic alternations in English, and it is found in many other languages as well. Understanding these alternations is important for language learners and researchers alike, as they provide insight into the underlying structure and organization of language.

b) What is the Problem of No Negative Evidence?

Based on what you read in the paper, can you improve on ChatGPT's answer? Or is it basically right?

> The problem of no negative evidence, also known as the poverty of the stimulus problem, is a well-known issue in language acquisition and linguistic theory.

> In essence, the problem arises from the fact that children seem to be able to learn language incredibly quickly and accurately, even though they are not provided with explicit negative feedback on incorrect language usage. That is, children are not explicitly told which sentences or grammatical structures are incorrect, yet they are still able to learn the rules of their language with remarkable speed and accuracy.

>This has led some researchers to argue that there must be some innate knowledge or ability in the human brain that allows us to learn language so easily. Others have suggested that children are able to learn language because they are exposed to a rich, complex input of language data, which provides them with enough positive evidence to induce the grammatical rules of their language.

>Despite ongoing research and debate, the problem of no negative evidence remains unsolved. However, it continues to be a topic of great interest and importance in the fields of linguistics, cognitive psychology, and artificial intelligence, as it sheds light on the mechanisms of language acquisition and the nature of human cognition more broadly.

c) How does a hierarchical Bayesian model ameliorate the Problem of No Negative Evidence?

ChatGPT definitely bungles this one. Can you help?

> A hierarchical Bayesian model is a statistical model that can be used to explain how humans learn language in the absence of explicit negative feedback. In the context of the problem of no negative evidence, a hierarchical Bayesian model can ameliorate this problem by incorporating prior knowledge about language and using this knowledge to guide the learning process.

>The model assumes that the child has prior beliefs about the structure of their language, which are represented in the form of a probabilistic grammar. This grammar encodes the child's beliefs about the distribution of different syntactic structures in their language. When the child is exposed to language data, the model updates its beliefs about the grammar based on the observed data.

>The key innovation of the hierarchical Bayesian model is that it allows the child to learn from both positive and negative evidence in a principled way. The model assumes that the child is uncertain about the true structure of their language, and this uncertainty is captured by a probability distribution over possible grammars. When the child observes a sentence, the model evaluates the probability of that sentence under each possible grammar, and updates the probability distribution over grammars accordingly.

>Importantly, the model can use negative evidence, or evidence that a particular sentence is ungrammatical, to rule out certain grammars and narrow down the set of possible hypotheses. This is because ungrammatical sentences will have low probability under some grammars, while grammatical sentences will have high probability under all grammars. By ruling out certain grammars, the model can gradually converge on the correct grammar for the child's language.

>Overall, the hierarchical Bayesian model provides a principled way to learn language in the absence of explicit negative feedback. By incorporating prior knowledge and using probabilistic reasoning, the model can learn from both positive and negative evidence and converge on the correct grammar for the child's language.

# Extras

## Psychology / Linguistics

* While the problem of negative evidence is often associated with Nativist theories, it was first popularized by Melissa Bowerman, a dyed-in-the-wool Empiricist. Her original paper remains a classic: [The 'no negative evidence' problem: How do children avoid constructing an overly general grammar?](https://pure.mpg.de/rest/items/item_468143/component/file_532427/content).
* To get a sense of verb alternations, there's really nothing better than looking at [VerbNet](https://uvi.colorado.edu/). VerbNet is an online database that categorizes verbs into classes depending on which syntactic frames they can use (the two forms of the dative alternation are examples of two frames).

## Computer Science

* Perfors and colleagues also wrote a tutorial on [Bayesian models of cognition development](https://www.sciencedirect.com/science/article/pii/S001002771000291X), which includes a useful explanation of overhypotheses / hierarchical models. 
* Also useful is [Learning overhypotheses with hierarchical Bayesian models](https://onlinelibrary.wiley.com/doi/full/10.1111/j.1467-7687.2007.00585.x), by many of the same authors.