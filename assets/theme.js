/* bootstrap-spin https://shaack.com/projekte/bootstrap-input-spinner/ */
!function(t){"use strict";var e=function(t,e){var n=t.locale||"en-US";this.parse=function(t){var e=new Intl.NumberFormat(n),r=e.format(11111).replace(/1/g,"")||".",o=e.format(1.1).replace(/1/g,"");return parseFloat(t.replace(new RegExp(" ","g"),"").replace(new RegExp("\\"+r,"g"),"").replace(new RegExp("\\"+o),"."))},this.render=function(t){var r=parseInt(e.getAttribute("data-decimals"))||0,o=!("false"===e.getAttribute("data-digit-grouping"));return new Intl.NumberFormat(n,{minimumFractionDigits:r,maximumFractionDigits:r,useGrouping:o}).format(t)}},n=!1,r=t.fn.val;function o(t,e){t.addEventListener("mousedown",function(t){0===t.button&&(t.preventDefault(),e(t))}),t.addEventListener("touchstart",function(t){t.cancelable&&t.preventDefault(),e(t)}),t.addEventListener("keydown",function(t){32!==t.keyCode&&13!==t.keyCode||n||(n=!0,e(t))})}t.fn.val=function(t){if(arguments.length>=1)for(var e=0;e<this.length;e++)this[e]["bootstrap-input-spinner"]&&this[e].setValue&&this[e].setValue(t);return r.apply(this,arguments)},t.fn.inputSpinner=function(r){if("destroy"===r)return this.each(function(){this["bootstrap-input-spinner"]?this.destroyInputSpinner():console.warn("element",this,"is no bootstrap-input-spinner")}),this;var i={decrementButton:"<strong>&minus;</strong>",incrementButton:"<strong>&plus;</strong>",groupClass:"",buttonsClass:"btn-outline-secondary",buttonsWidth:"2.5rem",textAlign:"center",autoDelay:500,autoInterval:50,buttonsOnly:!1,keyboardStepping:!0,locale:navigator.language,editor:e,template:'<div class="input-group ${groupClass}"><button style="min-width: ${buttonsWidth}" class="btn btn-decrement ${buttonsClass} btn-minus" type="button">${decrementButton}</button><input type="text" inputmode="decimal" style="text-align: ${textAlign}" class="form-control form-control-text-input"/><button style="min-width: ${buttonsWidth}" class="btn btn-increment ${buttonsClass} btn-plus" type="button">${incrementButton}</button></div>'};for(var a in r)i[a]=r[a];var p=i.template.replace(/\${groupClass}/g,i.groupClass).replace(/\${buttonsWidth}/g,i.buttonsWidth).replace(/\${buttonsClass}/g,i.buttonsClass).replace(/\${decrementButton}/g,i.decrementButton).replace(/\${incrementButton}/g,i.incrementButton).replace(/\${textAlign}/g,i.textAlign);return this.each(function(){if(this["bootstrap-input-spinner"])console.warn("element",this,"is already a bootstrap-input-spinner");else{var e=t(this);e[0]["bootstrap-input-spinner"]=!0,e.hide(),e[0].inputSpinnerEditor=new i.editor(i,this);var r=null,a=null,u=t(p),s=u.find(".btn-decrement"),l=u.find(".btn-increment"),d=u.find("input"),c=t("label[for='"+e.attr("id")+"']");c[0]||(c=e.closest("label"));var f=null,m=null,b=null;D();var v=parseFloat(e[0].value),g=!1,h=e.attr("data-prefix")||"",y=e.attr("data-suffix")||"";if(h){var w=t('<span class="input-group-text">'+h+"</span>");u.find("input").before(w)}if(y){var x=t('<span class="input-group-text">'+y+"</span>");u.find("input").after(x)}e[0].setValue=function(t){N(t)},e[0].destroyInputSpinner=function(){e.prop("required",d.prop("required")),E.disconnect(),B(),d.off("paste input change focusout"),u.remove(),e.show(),e[0]["bootstrap-input-spinner"]=void 0,c[0]&&c.attr("for",e.attr("id"))};var E=new MutationObserver(function(){D(),N(v,!0)});E.observe(e[0],{attributes:!0}),e.after(u),N(v),d.on("paste input change focusout",function(t){var n=d[0].value,r="focusout"===t.type;N(n=e[0].inputSpinnerEditor.parse(n),r),k(e,t.type)}).on("keydown",function(t){i.keyboardStepping&&(38===t.which?(t.preventDefault(),s.prop("disabled")||F(b)):40===t.which&&(t.preventDefault(),l.prop("disabled")||F(-b)))}).on("keyup",function(t){!i.keyboardStepping||38!==t.which&&40!==t.which||(t.preventDefault(),B())}),o(s[0],function(){s.prop("disabled")||(g=!0,F(-b))}),o(l[0],function(){l.prop("disabled")||(g=!0,F(b))}),C=document.body,$=function(){!0===g&&(B(),k(e,"change"),g=!1)},C.addEventListener("mouseup",function(t){$(t)}),C.addEventListener("touchend",function(t){$(t)}),C.addEventListener("keyup",function(t){32!==t.keyCode&&13!==t.keyCode||(n=!1,$(t))})}var C,$;function N(t,n){void 0===n&&(n=!0),isNaN(t)||""===t?(e[0].value="",n&&(d[0].value=""),v=NaN):(t=parseFloat(t),t=Math.min(Math.max(t,f),m),e[0].value=t,n&&(d[0].value=e[0].inputSpinnerEditor.render(t)),v=t)}function k(t,e){e&&setTimeout(function(){var n;"function"==typeof Event?n=new Event(e,{bubbles:!0}):(n=document.createEvent("Event")).initEvent(e,!0,!0),t[0].dispatchEvent(n)})}function F(t){S(t),B(),void 0!==i.autoInterval&&(r=setTimeout(function(){a=setInterval(function(){S(t)},i.autoInterval)},i.autoDelay))}function S(t){isNaN(v)&&(v=0),N(Math.round(v/t)*t+t),k(e,"input")}function B(){clearTimeout(r),clearTimeout(a)}function D(){e.prop("required")&&(d.prop("required",e.prop("required")),e.removeAttr("required")),d.prop("placeholder",e.prop("placeholder")),d.attr("inputmode",e.attr("inputmode")||"decimal");var t=e.prop("disabled"),n=e.prop("readonly");d.prop("disabled",t),d.prop("readonly",n||i.buttonsOnly),l.prop("disabled",t||n),s.prop("disabled",t||n),(t||n)&&B();var r=e.prop("class"),o="";/form-control-sm/g.test(r)?o="input-group-sm":/form-control-lg/g.test(r)&&(o="input-group-lg");var a=r.replace(/form-control(-(sm|lg))?/g,"");u.prop("class","input-group "+o+" "+i.groupClass),d.prop("class","form-control "+a),f=isNaN(e.prop("min"))||""===e.prop("min")?-1/0:parseFloat(e.prop("min")),m=isNaN(e.prop("max"))||""===e.prop("max")?1/0:parseFloat(e.prop("max")),b=parseFloat(e.prop("step"))||1,e.attr("hidden")?u.attr("hidden",e.attr("hidden")):u.removeAttr("hidden"),e.attr("id")&&(d.attr("id",e.attr("id")+"_MP_cBdLN29i2"),c[0]&&c.attr("for",d.attr("id")))}}),this}}(jQuery);

if ((typeof Theme) === 'undefined') { Theme = {}; }
Theme.toggleAffix = function(affixElement, scrollElement, wrapper) {
  var height = affixElement.outerHeight(),
      top = wrapper.offset().top;

  if (scrollElement.scrollTop() >= top){
    wrapper.height(height);
    affixElement.addClass("affix");
  } else {
    affixElement.removeClass("affix");
    wrapper.height('auto');
  }
};

jQuery('body :not(script)').contents().filter(function() {
  return this.nodeType === 3;
}).replaceWith(function() {
  return this.nodeValue.replace(/[™®]/g, '<sup>$&</sup>');
});

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
});

if( parseInt(jQuery(window).width()) < 992 ) { 
  var toastElList = [].slice.call(document.querySelectorAll('.toast'));
  var toastList = toastElList.map(function (toastEl) {
    return new bootstrap.Toast(toastEl, { delay:7000 });
  });
};

/* add input spinner to all qty selectors */
jQuery("input[quantity-select]").inputSpinner();

/* NAVIGATION UX */
if( window.innerWidth > 1024 ) {
  jQuery('[data-toggle="affix"]').each(function() {
    var ele = jQuery(this);
    var wrapper = jQuery('<div></div>');

    ele.before(wrapper);
    jQuery(window).on('scroll resize', function() {
      Theme.toggleAffix(ele, $(this), wrapper);
    });
    Theme.toggleAffix(ele, jQuery(window), wrapper);
  });
}

if( window.innerWidth > 1200 ) {
  jQuery(".navbar-nav.tier-1 > .dropdown").hover(
    function(){ jQuery(".navbar-nav.tier-1 .dropdown").removeClass('open'); jQuery(this).addClass('open'); jQuery('main').prepend('<div class="mainNavOverlay"></div>'); },
    function(){ jQuery(this).removeClass('open'); jQuery('div.mainNavOverlay').not('.cart').remove(); }
  );
  jQuery(".dropdown-toggle").click( function() {
    window.location = jQuery(this).attr('href');
  });

} else {
  var mainMenu = jQuery('.navbar-nav.tier-1');

  jQuery('.navbar-toggler').on('click', function (evt) {
    mainMenu.removeClass('open');
    mainMenu.find('.dropdown.open').removeClass('open');
  });

  jQuery('.navbar-nav.tier-1 > .dropdown > .dropdown-toggle').on('click', function (evt) {
    evt.preventDefault();
    if( parseInt(mainMenu.css('left')) == 0 ) { 
      jQuery(this).parent().toggleClass('open');
      mainMenu.addClass('open');
    }
  });

  jQuery('#navbar-tier-2 > .dropdown').on('click', function () {
    jQuery(this).siblings().removeClass('open');
    jQuery(this).toggleClass('open');
  });

  jQuery('a.menu-back').on('click', function () { 
    mainMenu.removeClass('open');
    mainMenu.find('.dropdown.open').removeClass('open');
    jQuery(this).parent().parent().focusout();
  });

} // if( parseInt(jQuery(window).width()) > 768 )
/* END NAVIGATION UX */