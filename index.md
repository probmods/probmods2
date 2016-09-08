---
layout: default
title: Probabilistic Models of Cognition
---

<div class="main">
  <h1>Probabilistic Models of Cognition</h1>
  <span class="authors">Noah D. Goodman <span style='color: #ccc'>&amp;</span> Joshua B. Tenenbaum</span>
</div>

In this book, we explore the probabilistic approach to cognitive science, which models learning and reasoning as inference in complex probabilistic models.
In particular, we examine how a broad range of empirical phenomena in cognitive science (including intuitive physics, concept learning, causal reasoning, social cognition, and language understanding) can be modeled using a functional probabilistic programming language called WebPPL.

**Citation:**
N. D. Goodman and J. B. Tenenbaum (electronic). Probabilistic Models of Cognition. Retrieved <Date> from http://probmods.org/v2. <a id="toggle-bibtex" href="#">[bibtex]</a>

<pre id="bibtex">
@misc{probmods,
  title = {% raw %}{{Probalistic Models of Cognition}}{% endraw %},
  author = {Goodman, Noah D and Joshua B. Tenenbaum},
  year = {2016},
  howpublished = {\url{http://probmods.org}},
  note = {Accessed: <span class="date"></span>}
}
</pre>

{% assign sorted_pages = site.pages | sort:"name" %}

### Chapters

{% for p in sorted_pages %}
    {% if p.layout == 'chapter' %}
1. [{{ p.title }}]({{ site.baseurl }}{{ p.url }})<br>
    <em>{{ p.description }}</em>
    {% endif %}
{% endfor %}

### Open source

- [Book content](https://github.com/probmods/probmods)<br>
  *Markdown code for the book chapters*

- [WebPPL](http://webppl.org)<br>
  *A probabilistic programming language for the web*

### Acknowledgments

The construction and ongoing support of this tutorial are made possible by grants from the Office of Naval Research, the James S. McDonnell Foundation, the Stanford VPOL, and the Center for Brains, Minds, and Machines (funded by NSF STC award CCF-1231216).
