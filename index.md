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
  <span class="authors">by Noah D. Goodman, Joshua B. Tenenbaum <span class='ampersand'>&amp;</span> The ProbMods Contributors</span>
</div>

<br />
This book explores the probabilistic approach to cognitive science, which models learning and reasoning as inference in complex probabilistic models.
We examine how a broad range of empirical phenomena, including intuitive physics, concept learning, causal reasoning, social cognition, and language understanding, can be modeled using probabilistic programs (using the <a href='http://webppl.org'>WebPPL</a> language).

<div id='left'>

<h3>Contributors</h3>
<p>This book is an open source project. We welcome content contributions (<a href='https://github.com/probmods/probmods2'>via GitHub</a>)!</p>
<p>The ProbMods Contibutors are:<br/>
Noah D. Goodman (editor)<br/>
Joshua B. Tenenbaum<br/>
Daphna Buchsbaum<br/>
Joshua Hartshorne<br/>
Robert Hawkins<br/>
Timothy J. O’Donnell<br/>
Michael Henry Tessler<br/>
</p>

<h3>Citation</h3>
N. D. Goodman, J. B. Tenenbaum, and The ProbMods Contributors (2016). <i>Probabilistic Models of Cognition</i> (2nd ed.). Retrieved <span class="date">YYYY-MM-DD</span> from <code>https://probmods.org/</code><br /><a id="toggle-bibtex" href="#">[bibtex]</a>

<pre id="bibtex">
@misc{probmods2,
  title = {% raw %}{{Probabilistic Models of Cognition}}{% endraw %},
  edition = {Second},
  author = {Goodman, Noah D and Tenenbaum, Joshua B. and The ProbMods Contributors},
  year = {2016},
  howpublished = {\url{http://probmods.org/v2}},
  note = {Accessed: <span class="date"></span>}
}
</pre>

<h3>Acknowledgments</h3>

<p>We are grateful for crucial technical assitance from: Andreas Stuhlm&uuml;ller, Tomer Ullman, John McCoy, Long Ouyang, Julius Cheng.</p>

<p>The construction and ongoing support of this tutorial are made possible by grants from the Office of Naval Research, the James S. McDonnell Foundation, the Stanford VPOL, and the Center for Brains, Minds, and Machines (funded by NSF STC award CCF-1231216).</p>

<h3>Previous edition</h3>

The first edition of this book used the probabilistic programming language Church and can be found <a href="http://v1.probmods.org">here</a>.

</div>

{% assign sorted_pages = site.pages | sort:"chapter_num" %}

<div id="right">

<h3>Chapters</h3>
 
<ol>
{% for p in sorted_pages %}
      {% if p.chapter_num != nil %}
        <li><a href="{{ site.baseurl }}{{ p.url }}">{{p.title}}</a><br />
        <em>{{ p.description }}</em>
        </li>
      {% endif %}
{% endfor %}
</ol>


</div>
