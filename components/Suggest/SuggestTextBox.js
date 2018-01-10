define('SBIS3.CONTROLS/Suggest/SuggestTextBox', [
   'SBIS3.CONTROLS/TextBox',
   'SBIS3.CONTROLS/TextBox/resources/TextBoxUtils',
   'SBIS3.CONTROLS/Mixins/PickerMixin',
   'SBIS3.CONTROLS/Mixins/SuggestMixin',
   'SBIS3.CONTROLS/Mixins/ChooserMixin',
   'SBIS3.CONTROLS/Mixins/SuggestTextBoxMixin',
   'SBIS3.CONTROLS/Mixins/SearchMixin',
   'tmpl!SBIS3.CONTROLS/Suggest/resources/afterFieldWrapper',
   'Core/core-instance',
   'css!SBIS3.CONTROLS/Suggest/SuggestTextBox/SuggestTextBox'
], function (
    TextBox,
    TextBoxUtils,
    PickerMixin,
    SuggestMixin,
    ChooserMixin,
    SuggestTextBoxMixin,
    SearchMixin,
    afterFieldWrapper,
    cInstance ) {
   'use strict';

   /**
    * Поле ввода с автодополнением
    * @class SBIS3.CONTROLS/Suggest/SuggestTextBox
    * @extends SBIS3.CONTROLS/TextBox
    *
    * @mixes SBIS3.CONTROLS/Mixins/PickerMixin
    * @mixes SBIS3.CONTROLS/Mixins/SuggestMixin
    * @mixes SBIS3.CONTROLS/Mixins/ChooserMixin
    * @mixes SBIS3.CONTROLS/Mixins/SearchMixin
    * @mixes SBIS3.CONTROLS/Mixins/SuggestTextBoxMixin
    *
    * @demo SBIS3.CONTROLS.Demo.MySuggestTextBox Поле ввода с автодополнением
    *
    * @author Герасимов А.М.
    *
    * @control
    * @public
    * @category Input
    * @cssModifier controls-SuggestTextBox__withoutCross Скрыть крестик удаления значения.
    */
   var SuggestTextBox = TextBox.extend([PickerMixin, SuggestMixin, ChooserMixin, SuggestTextBoxMixin, SearchMixin], {
      $protected: {
         _options: {
            afterFieldWrapper: afterFieldWrapper
         },
         _crossContainer: null
      },
      $constructor: function() {
         this._crossContainer =  $('.js-controls-SuggestTextBox__reset', this._container);

         this.subscribe('onTextChange', function(e, text) {
            this._crossContainer.toggleClass('ws-hidden', !text);
         });

         this._crossContainer.click(this.resetSearch.bind(this));
      },

      _chooseCallback: function(result) {
         if(result && cInstance.instanceOfModule(result[0], 'WS.Data/Entity/Model')) {
            var item = result[0];
            this._onListItemSelect(item.getId(), item);
         }
      },

      _modifyOptions: function() {
         var opts = SuggestTextBox.superclass._modifyOptions.apply(this, arguments);
         opts.cssClassName += ' controls-SuggestTextBox';
         return opts;
      },
      
      _onResizeHandler: function() {
         SuggestTextBox.superclass._onResizeHandler.apply(this, arguments);
         if(this.isPickerVisible()) {
            TextBoxUtils.setEqualPickerWidth(this._picker);
         }
      },

      showPicker: function() {
         SuggestTextBox.superclass.showPicker.apply(this, arguments);
         TextBoxUtils.setEqualPickerWidth(this._picker);
      },

      _onListDrawItems: function() {
         SuggestTextBox.superclass._onListDrawItems.apply(this, arguments);
         TextBoxUtils.setEqualPickerWidth(this._picker);
      },

      _updateList: function() {
         SuggestTextBox.superclass._updateList.apply(this, arguments);
         if(this.isPickerVisible()) {
            TextBoxUtils.setEqualPickerWidth(this._picker);
         }
      },

      destroy: function(){
         SuggestTextBox.superclass.destroy.apply(this, arguments);
         this._crossContainer.unbind('click');
         this._crossContainer = null;
      }
   });

   return SuggestTextBox;
});
