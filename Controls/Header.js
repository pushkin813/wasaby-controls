define('Controls/Header', [
   'Core/Control',
   'Core/IoC',
   'tmpl!Controls/Header/Header',
   'WS.Data/Type/descriptor',
   'css!Controls/Header/Header'
], function(Control, IoC, template, types) {
   'use strict';

   /**
    * Control showing the headers.
    * @class Controls/Header
    * @extends Controls/Control
    * @control
    * @public
    */

   /**
    * @name Controls/Header#size
    * @cfg {String} caption size
    * @variant s Caption has small size.
    * @variant m Caption has middle size.
    * @variant l Caption has large size.
    */

   /**
    * @name Controls/Header#caption
    * @cfg {String} caption Caption text.
    */

   /**
    * @name Controls/Header#style
    * @cfg {String} Caption display style.
    * @variant default Caption will be default.
    * @variant primary Caption will be accented.
    */

   /**
    * @name Controls/Header#clickable
    * @cfg {Boolean} Whether caption can be clicked.
    */

   /**
    * @name Controls/Header#counterValue
    * @cfg {Number} Value of counter. If this option is specified, the title will be displayed.
    */

   /**
    * @name Controls/Header#counterLocation
    * @cfg {String} Counter location relative to header.
    * @variant after Counter will be displayed after the caption.
    * @variant before Counter will be displayed before the caption.
    */

   /**
    * @name Controls/Header#counterStyle
    * @cfg {String} Counter display style.
    * @variant primary Counter will be accented.
    * @variant default Counter will be default.
    * @variant disabled Counter will be non accented.
    */

   /**
    * @name Controls/Header#counterSize
    * @cfg {String} Size of counter.
    * @variant small Counter has small size.
    * @variant default Counter has middle size.
    * @variant large Counter has large size.
    */

   /**
    * @name Controls/Header#countClickable
    * @cfg {Boolean} The ability to send a single event when counter was clicked. Event name is countClick.
    */

   /**
    * @name Controls/Header#iconClickable
    * @cfg {Boolean} The ability to send a single event when icon was clicked. Event name is iconClick.
    */

   /**
    * @name Controls/Header#iconLocation
    * @cfg {String} Icon location relative to header.
    * @variant after Icon will be displayed after the caption.
    * @variant before Icon will be displayed before the caption.
    */

   /**
    * @name Controls/Header#iconStyle
    * @cfg {String} Icon display style.
    * @variant Accent Icon will be default.
    * @variant Additional Icon will be non accented.
    * @variant Main Icon will be accented.
    */

   /**
    * @name Controls/Header#iconType
    * @cfg {String} Icon type.
    * @variant MarkExpandBold Down arrow with double width.
    * @variant ExpandLight Default dawn arrow.
    * @variant AccordionArrowDown Double down arrow.
    */

   /**
    * @name Controls/Header#iconValue
    * @cfg {Boolean} Icon value. If iconValue == true, that icon will be displaying, else icon will not be displaying.
    */

   /**
    * @name Controls/Header#separatorIcon
    * @cfg {Boolean} Icon separator will be displayed or not.
    */

   /**
    * @name Controls/Header#separatorIconStyle
    * @cfg {String} Icon display style. In the online theme has only one display style.
    * @variant primary Icon-separator will be accented.
    * @variant default Icon-separator will be default.
    */

   /**
    * @name Controls/Header#commonClick
    * @cfg {Boolean} A common hover for all header elements.
    */


   var classesOfIcon = {
      MarkExpandBold: {
         true: "icon-MarkExpandBold",
         false: "icon-MarkCollapseBold",
         size: "icon-small"
      },

      ExpandLight: {
         true: "icon-ExpandLight",
         false: "icon-CollapseLight",
         size: "icon-small"
      },

      AccordionArrowDown: {
         true: "icon-AccordionArrowDown",
         false: "icon-AccordionArrowUp ",
         size: "icon-medium"
      }
   };

   var _private = {
      cssStyleGeneration: function (self, options) {
         if (classesOfIcon.hasOwnProperty(options.iconType)) {
            var currentIconClass = classesOfIcon[options.iconType];
            self._icon = currentIconClass[options.iconValue];
         }
      }
   };

   var Header = Control.extend({
      _template: template,

      constructor: function (options) {
         Header.superclass.constructor.apply(this, arguments);
         _private.cssStyleGeneration(this, options);
      },

      _beforeUpdate: function (newOptions) {
         _private.cssStyleGeneration(this, newOptions);
      },

      countClickHandler: function (e) {
         if(this._options.countClickable && this._options.clickable){
            e.stopPropagation();
            this._notify('countClick');
         }
      },

      iconClickHandler: function (e) {
         if(this._options.iconClickable){
            e.stopPropagation();
            this._notify('iconClick');
         }
      }
   });

   Header.getOptionTypes =  function getOptionTypes() {
      return {
         caption: types(String),
         style: types(String).oneOf([
            'default_big',
            'primary_big',
            'default',
            'primary'
         ]),
         clickable: types(Boolean),
         counterValue: types(Number),
         counterLocation: types(String).oneOf([
            'after',
            'before'
         ]),
         counterStyle: types(String).oneOf([
            'primary',
            'default',
            'disabled'
         ]),
         counterSize: types(String).oneOf([
            'default',
            'small',
            'large'
         ]),
         countClickable: types(Boolean),
         size: types(String).oneOf([
            'l',
            'm',
            's'
         ]),
         iconClickable: types(Boolean),
         iconLocation: types(String).oneOf([
            'after',
            'before'
         ]),
         iconStyle: types(String).oneOf([
            'Accent',
            'Additional',
            'Main'
         ]),
         iconType: types(String).oneOf([
            'MarkExpandBold',
            'ExpandLight',
            'AccordionArrowDown'
         ]),
         iconValue: types(Boolean),
         separatorIcon: types(Boolean),
         separatorIconStyle: types(String).oneOf([
            'primary',
            'default'
         ]),
         commonClick: types(Boolean)
      }
   };

   return Header;
});
