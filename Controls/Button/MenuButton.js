define('Controls/Button/MenuButton',
   [
      'Core/Control',
      'tmpl!Controls/Button/Menu/MenuButton',
      'Controls/Button/Classes',
      'css!Controls/Button/Menu/MenuButton',
      'Controls/Button'
   ],
   function(Control, template, Classes) {

      /**
       * MenuButton
       * @class Controls/MenuButton
       * @extends Core/Control
       * @mixes Controls/Button/interface/ICaption
       * @mixes Controls/Button/interface/IClick
       * @mixes Controls/Button/interface/IIcon
       * @mixes Controls/interface/ITooltip
       * @mixes Controls/interface/ISource
       * @mixes Controls/interface/IDropdown
       * @control
       * @public
       * @category Button
       * @demo Controls-demo/Dropdown/MenuVdom
       */

      'use strict';

      /**
       * @name Controls/MenuButton#headConfig
       * @cfg {Object} Menu style menuStyle
       * @variant defaultHead The head with icon and caption
       * @variant duplicateHead The icon set under first item
       * @variant cross Menu have cross in left top corner
       */

      /**
       * @name Controls/MenuButton#size
       * @cfg {String} Size of the menu button.
       * @variant s Button has s size. Not supported by these button styles: buttonPrimary, buttonDefault, buttonAdd, iconButtonBordered.
       * @variant m Button has m size.
       * @variant l Button has l size.
       * @variant xl Button has xl size. Not supported by these button styles: buttonPrimary, buttonDefault, buttonAdd, iconButtonBordered.
       */

      /**
       * @name Controls/MenuButton#style
       * @cfg {String} Display style of menu button.
       * @variant iconButtonBordered Button display as icon with border.
       * @variant linkMain Button display as main link style.
       * @variant linkMain2 Button display as first nonaccent link style.
       * @variant linkMain3 Button display as second nonaccent link style.
       * @variant linkAdditional Button display as third nonaccent link style.
       * @variant linkAdditional2 Button display as first accent link style.
       * @variant linkAdditional3 Button display as second accent link style.
       * @variant linkAdditional4 Button display as third accent link style.
       * @variant linkAdditional5 Button display as fourth accent link style.
       * @variant buttonPrimary Button display as primary contour button style.
       * @variant buttonDefault Button display as default contour button style.
       * @variant buttonAdd Button display as button with icon add style.
       */

      var _private = {
         cssStyleGeneration: function(self, options) {
            var sizes = ['small', 'medium', 'large'],
               menuStyle = options.headConfig && options.headConfig.menuStyle,
               currentButtonClass, iconSize;

            currentButtonClass = Classes.getCurrentButtonClass(options.style);

            // для каждого размера вызывающего элемента создаем класс, который выравнивает popup через margin.
            self._offsetClassName = 'controls-MenuButton controls-MenuButton_' + currentButtonClass.type + '_' + options.size;

            if (currentButtonClass.type === 'link' && options.icon) {
               sizes.forEach(function(size) {
                  if (options.icon.indexOf('icon-' + size) !== -1) {
                     iconSize = size;
                  }
               });

               // у кнопки типа 'Ссылка' высота вызывающего элемента зависит от размера иконки,
               // поэтому необходимо это учесть при сдвиге
               self._offsetClassName += '_' + iconSize;
            }
            self._offsetClassName += (menuStyle === 'duplicateHead' ? '_duplicate' : '');
         }
      };

      var MenuButton = Control.extend({
         _template: template,

         _beforeMount: function(options) {
            _private.cssStyleGeneration(this, options);
         },
   
         _onResult: function(event, result) {
            this._notify('onMenuItemActivate', [result[0]]);
         }
         
      });

      MenuButton.getDefaultOptions = function() {
         return {
            showHeader: true,
            style: 'buttonDefault',
            size: 'default'
         };
      };

      return MenuButton;
   }
);
