define('Controls/Router/Link', [
   'Core/Control',
   'wml!Controls/Router/Link',
   'Transport/URL/getUrl',
   'Core/vdom/Synchronizer/resources/DOMEnvironment',
   'Controls/Router',
   'Controls/Router/RouterHelper'
], function(Control, tmpl, getUrl, DOMEnvironment, Router, RouterHelper) {
   'use strict';

   var module = Control.extend({
      _template: tmpl,
      _href: null,

      clickHandler: function(e) {
         e.preventDefault();
         e.stopPropagation();

         this._notify('routerUpdated', [this._href], { bubbling: true });
      },

      _beforeMount: function(cfg) {
         this._href = RouterHelper.calculateHref(cfg.href, cfg);
      },
      _beforeUpdate: function(cfg) {
         this._href = RouterHelper.calculateHref(cfg.href, cfg);
      }
   });

   return module;
});
