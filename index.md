---
layout: default
title: Probabilistic Models of Cognition - 2nd Edition
custom_js:
- assets/js/index.js
custom_css:
- assets/css/index.css
---

<div id="header">
  <h1 id='title'>Probabilistic Models of Cognition</h1>
  <hr class='edition' />
  <span class="authors">by Noah D. Goodman <span class='ampersand'>&amp;</span> Joshua B. Tenenbaum</span>
</div>

<br />
This book explores the probabilistic approach to cognitive science, which models learning and reasoning as inference in complex probabilistic models.
We examine how a broad range of empirical phenomena, including intuitive physics, concept learning, causal reasoning, social cognition, and language understanding, can be modeled using a functional probabilistic programming language called WebPPL.

<div id='left'>

<h3>Citation</h3>
N. D. Goodman and J. B. Tenenbaum (2016). <i>Probabilistic Models of Cognition</i> (2nd ed.). Retrieved <span class="date">YYYY-MM-DD</span> from <code>http://probmods.org/v2</code><br /><a id="toggle-bibtex" href="#">[bibtex]</a>

<pre id="bibtex">
@misc{probmods2,
  title = {% raw %}{{Probabilistic Models of Cognition}}{% endraw %},
  edition = {Second},
  author = {Goodman, Noah D and Joshua B. Tenenbaum},
  year = {2016},
  howpublished = {\url{http://probmods.org/v2}},
  note = {Accessed: <span class="date"></span>}
}
</pre>

<h3>Open source</h3>

<ul>
<li><a href='https://github.com/probmods/probmods2'>Book content</a><br />
<em>Markdown code for the book chapters</em></li>

<li><a href='http://webppl.org'>WebPPL</a><br />
    <em>A probabilistic programming language for the web</em></li>
</ul>

<h3>Acknowledgments</h3>

<p>We are grateful to the following people, who contributed content or technical expertise: Timothy J. O’Donnell, Andreas Stuhlmuller, Tomer Ullman, John McCoy, Long Ouyang, Julius Cheng.</p>

<p>The construction and ongoing support of this tutorial are made possible by grants from the Office of Naval Research, the James S. McDonnell Foundation, the Stanford VPOL, and the Center for Brains, Minds, and Machines (funded by NSF STC award CCF-1231216).</p>
</div>

{% assign sorted_pages = site.pages | sort:"name" %}

<div id="right">

<h3>Chapters</h3>

<ol>
{% for p in sorted_pages %}
    {% if p.layout == 'chapter' %}
    <li><a href="{{ site.baseurl }}{{ p.url }}">{{p.title}}</a><br />
    <em>{{ p.description }}</em>
    </li>

    {% endif %}
{% endfor %}
</ol>


</div>
