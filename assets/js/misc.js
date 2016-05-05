// CPS and addressing forms

function updateTransformForm(inputId, outputId, transformer){
  try {
    var cpsCode = transformer($(inputId).val());
    $(outputId).val(cpsCode);
  } catch (err) {
  }
  $(outputId).trigger('autosize.resize');
}

function setupTransformForm(inputId, outputId, eventListener){
  $(inputId).autosize();
  $(outputId).autosize();
  $(inputId).bind('input propertychange', eventListener);
  $(inputId).change();
  eventListener();
}

// CPS

var updateCpsForm = function(){
  updateTransformForm("#cpsInput", "#cpsOutput", webppl.cps);
};
var setupCpsForm = function(){
  setupTransformForm("#cpsInput", "#cpsOutput", updateCpsForm);
};

$(function(){
  if ($("#cpsInput").length){
    $(setupCpsForm);
  }
});


// Naming

var updateNamingForm = function(){
  updateTransformForm("#namingInput", "#namingOutput", webppl.naming);
};
var setupNamingForm = function(){
  setupTransformForm("#namingInput", "#namingOutput", updateNamingForm);
};

$(function(){
  if ($("#namingInput").length){
    $(setupNamingForm);
  }
});
