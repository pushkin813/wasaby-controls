define('Controls-demo/Popup/Opener/StackDemo',
   [
      'Core/Control',
      'wml!Controls-demo/Popup/Opener/StackDemo',
      'wml!Controls-demo/Popup/Opener/resources/footer',
      'wml!Controls-demo/Popup/Opener/DialogTpl',
      'css!Controls-demo/Popup/PopupPageOld'
   ],
   function(Control, template) {
      'use strict';

      var PopupPage = Control.extend({
         _template: template,
         openStack: function() {
            this._children.stack.open({
               opener: this._children.button1,
               closeOnOutsideClick: true,
               template: "Controls-demo/Popup/Opener/resources/StackTemplate",
               width: 600
            });
         },
         openModalStack: function() {
            this._children.stack.open({
               opener: this._children.button4,
               isModal: true,
               template: "Controls-demo/Popup/Opener/resources/StackTemplate",
               width: 600
            });
         },
         openDialog: function() {
            this._children.dialog.open({
               opener: this._children.button3,
               closeOnOutsideClick: true,
               height: 500,
               maxHeight: 700
            });
         },
         openModalDialog: function() {
            this._children.dialog.open({
               opener: this._children.button5,
               templateOptions: {
                  footerContentTemplate: 'wml!Controls-demo/Popup/Opener/resources/footer',
               },
               isModal: true,
               height: 500,
               maxHeight: 700
            });
         },
         openSticky: function() {
            this._children.sticky.open({
               target: this._children.stickyButton._container,
               opener: this._children.stickyButton,
               height: 130,
               actionOnScroll: 'track',
               template: 'wml!Controls-demo/Popup/Opener/DialogTpl'
            });
         },
         openStickyScroll: function() {
            this._children.sticky.open({
               target: this._children.stickyButton._container,
               opener: this._children.stickyButton,
               height: 130,
               actionOnScroll: 'close',
               template: 'wml!Controls-demo/Popup/Opener/DialogTpl'
            });
         },
         openMaximizedStack: function() {
            this._children.stack.open({
               opener: this._children.button2,
               minimizedWidth: 600,
               minWidth: 600,
               width: 600,
               maxWidth: 800,
               template: "Controls-demo/Popup/Opener/resources/StackTemplate",
               templateOptions: {
                  maximized: true,
                  maximizedButtonVisibility: true
               }
            });
         },
         openStackCustomHeader: function(){
            this._children.stack.open({
               opener: this._children.button6,
               width: 800,
               template: "Controls-demo/Popup/Opener/resources/StackTemplateHeader",
            });
         }
      });
      return PopupPage;
   });
