"use strict";

var renderMath = function() {
  // HT https://xuc.me/blog/KaTeX-and-Jekyll/
  $("script[type='math/tex']").replaceWith(
    function(){
      var tex = $(this).text();

      var rendered = katex.renderToString(tex);
      try {
        rendered = katex.renderToString(tex);
      } catch (e){
        rendered = tex;
      } finally {
        return "<span class=\"inline-equation\">" + rendered + "</span>";
      }
    });

  $("script[type='math/tex; mode=display']").replaceWith(
    function(){
      var tex = $(this).text();
      return "<div class=\"equation\">" +
        katex.renderToString("\\displaystyle "+tex) +
        "</div>";
    });
}

$(renderMath);

// Code boxes
function setupCodeBoxes(){
  // TODO: optimize this, (maybe have wpEditor.setup take a content option?)
  $("pre:not(#bibtex)").map(function(i,el) {
    var firstLine = $(el).text().split("\n")[0];
    var language = (firstLine == '// language: javascript' ? 'javascript' : 'webppl');

    wpEditor.setup(el, {language: language})
  })
}

$(setupCodeBoxes);

// Google analytics

// (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
// (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
// m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
// })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

// ga('create', 'UA-54996-12', 'auto');
// ga('send', 'pageview');


// Date

function setDate(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  $(".date").text(yyyy+'-'+mm+'-'+dd);
}

$(setDate);


// Bibtex

function setBibtex(){
  $('#toggle-bibtex').click(function(){$('#bibtex').toggle(); return false;});
}

$(setBibtex)

if (ERP) {
  ERP.prototype.__print__ = viz.print;
}
