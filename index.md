---
layout: default
title: Probabilistic Models of Cognition
---

<div class="main">
  <h1>The Design and Implementation of Probabilistic Programming Languages</h1>
  <span class="authors">Noah D. Goodman and Andreas Stuhlmüller</span>
</div>

**About:** 
Probabilistic programming languages (PPLs) unify techniques for the formal description of computation and for the representation and use of uncertain knowledge. 
PPLs have seen recent interest from the artificial intelligence, programming languages, cognitive science, and natural languages communities.
This book explains how to implement PPLs by lightweight embedding into a host language. 
We illustrate this by designing and implementing *WebPPL*, a small PPL embedded in Javascript. 
We show how to implement several algorithms for universal probabilistic inference, including priority-based enumeration with caching, particle filtering, and Markov chain Monte Carlo.
We use program transformations to expose the information required by these algorithms, including continuations and stack addresses.
We illustrate these ideas with examples drawn from semantic parsing, natural language pragmatics, and procedural graphics.

**Citing:** Please cite this book as: 
N. D. Goodman and A. Stuhlmüller (electronic). The Design and Implementation of Probabilistic Programming Languages. Retrieved <span class="date"></span> from `http://dippl.org`. <a id="toggle-bibtex" href="#">[bibtex]</a>

<pre id="bibtex">
@misc{dippl,
  title = {% raw %}{{The Design and Implementation of Probabilistic Programming Languages}}{% endraw %},
  author = {Goodman, Noah D and Stuhlm\"{u}ller, Andreas},
  year = {2014},
  howpublished = {\url{http://dippl.org}},
  note = {Accessed: <span class="date"></span>}
}
</pre>

{% assign sorted_pages = site.pages | sort:"name" %}

### Chapters

{% for p in sorted_pages %}
    {% if p.layout == 'chapter' %}
- [{{ p.title }}]({{ site.baseurl }}{{ p.url }})<br>
    <em>{{ p.description }}</em>
    {% endif %}
{% endfor %}


### Examples

{% for p in sorted_pages %}
    {% if p.layout == 'example' %}
- [{{ p.title }}]({{ site.baseurl }}{{ p.url }})<br>
    <em>{{ p.description }}</em>
    {% endif %}
{% endfor %}

### Open source

- [Book content](https://github.com/probmods/dippl)<br>
  *Markdown code for the book chapters*

- [WebPPL](http://webppl.org)<br>
  *A probabilistic programming language for the web*

### Acknowledgments

The construction of this tutorial was made possible by grants from DARPA, under agreement number FA8750-14-2-0009, and the Office of Naval Research, grant number N00014-13-1-0788. 
(The views and conclusions contained herein are those of the authors and should not be interpreted as necessarily representing the official policies or endorsements, either expressed or implied, of DARPA or the U.S. Government.)

This book is based on notes from the [ESSLLI 2014](http://www.esslli2014.info) class on Probabilistic Programming Languages, taught by the authors.

