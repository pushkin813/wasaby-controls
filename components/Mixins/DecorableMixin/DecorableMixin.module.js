define('js!SBIS3.CONTROLS.DecorableMixin', [
   'js!SBIS3.CONTROLS.Utils.HtmlDecorators',
   'js!SBIS3.CONTROLS.Utils.HtmlDecorators/HighlightDecorator',
   'js!SBIS3.CONTROLS.Utils.HtmlDecorators/ColorMarkDecorator'
], function (HtmlDecorators, HighlightDecorator, ColorMarkDecorator) {
   'use strict';

   /**
    * Миксин, задающий любому контролу возможность подсветки текста и отметки цветом
    * @mixin SBIS3.CONTROLS.DecorableMixin
    * @public
    * @author Мальцев Алексей Александрович
    */

   var DecorableMixin = /** @lends SBIS3.CONTROLS.DecorableMixin.prototype */{
      $protected: {
         _options: {
            /**
             * @cfg {Boolean} Использовать подсветку фразы
             * @see isHighlightEnabled
             * @see setHighlightEnabled
             */
            highlightEnabled: false,

            /**
             * @cfg {Boolean} Использовать отметку цветом
             * @see isColorMarkEnabled
             * @see setColorMarkEnabled
             */
            colorMarkEnabled: false,

            /**
             * @cfg {Boolean} Поле записи, хранящее данные об отметке цветом
             * @see getColorField
             * @see setColorField
             */
            colorField: ''
         },

         /**
          * @var {SBIS3.CONTROLS.Utils.HtmlDecorators} Набор декораторов
          */
         _decorators: undefined,

         /**
          * @var {String} Фраза для подсветки
          */
         _highlightText: ''
      },

      $constructor: function () {
         this._decorators = new HtmlDecorators();

         this._decorators.add(new HighlightDecorator({
            enabledGetter: 'isHighlightEnabled',
            textGetter: 'getHighlightText',
            cssClass: 'controls-ListView-highlight'
         }));

         this._decorators.add(new ColorMarkDecorator({
            enabledGetter: 'isColorMarkEnabled'
         }), 'color');
      },

      before: {
         _redraw: function () {
            this._decorators.update(this);
         }
      },

      /**
       * Подсветка фразы включена
       * @returns {Boolean}
       */
      isHighlightEnabled: function () {
         return this._options.highlightEnabled;
      },

      /**
       * Включает/выключает подсветку фразы
       * @param {Boolean} enabled Включить/выключить
       */
      setHighlightEnabled: function (enabled) {
         if (this._options.highlightEnabled === enabled) {
            return;
         }
         this._options.highlightEnabled = enabled;
         this._redraw();
      },

      /**
       * Возвращает фразу для подсветки
       * @returns {String}
       */
      getHighlightText: function () {
         return this._highlightText;
      },

      /**
       * Устанавливает фразу для подсветки
       * @param {String} text Фраза для подсветки
       */
      setHighlightText: function (text) {
         if (this._highlightText === text) {
            return;
         }
         this._highlightText = text;
         this._redraw();
      },

      /**
       * Отметка цветом включена
       * @returns {Boolean}
       */
      isColorMarkEnabled: function () {
         return this._options.colorMarkEnabled;
      },

      /**
       * Включает/выключает отметку цветом
       * @param {Boolean} enabled Включить/выключить
       */
      setColorMarkEnabled: function (enabled) {
         if (this._options.colorMarkEnabled === enabled) {
            return;
         }
         this._options.colorMarkEnabled = enabled;
         this._redraw();
      },

      /**
       * Возвращает поле записи, хранящее данные об отметке цветом
       * @returns {String}
       */
      getColorField: function () {
         return this._options.colorField;
      },

      /**
       * Устанавливает поле записи, хранящее данные об отметке цветом
       * @param {String} field Название поля
       */
      setColorField: function (field) {
         if (this._options.colorField === field) {
            return;
         }
         this._options.colorField = field;
         this._redraw();
      }
   };

   return DecorableMixin;
});
