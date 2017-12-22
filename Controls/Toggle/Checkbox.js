define('js!Controls/Toggle/Checkbox', [
   'Core/Control',
   'tmpl!Controls/Toggle/Checkbox/Checkbox',
   'WS.Data/Type/descriptor',
   'css!Controls/Toggle/Checkbox/Checkbox'
], function(Control, template, types) {

   /**
    * Контрол, отображающий стандартный флажок
    * @class Controls/Toggle/Checkbox
    * @extends Controls/Control
    * @mixes Controls/Button/interface/ICaption
    * @mixes Controls/interface/ITooltip
    * @control
    * @public
    * @category Toggle
    */

   /**
    * @name Controls/Toggle/Checkbox#triState
    * @cfg {Boolean} Режим трехпозиционного чекбокса
    */

   /**
    * @name Controls/Toggle/Checkbox#checked
    * @cfg {Boolean|null} Состояние переключателя
    */

   /**
    * @event Controls/Toggle/Checkbox#checkedChanged Происходит при изменении состояния переключателя
    * @param {Boolean|null} value Новое состояние
    */

   var _private ={
      notifyChangeValue: function (self, value) {
         self._notify('changeValue', value);
      }
   };

   var CheckBox = Control.extend({
      _template: template,

      _clickHandler: function (e) {
         if(this._options.value && this._options.triState){
            _private.notifyChangeValue(this, null);
         }
         else if (this._options.value===null){
            _private.notifyChangeValue(this, false);
         }
         else{
            _private.notifyChangeValue(this, !this._options.value);
         }
      }
   });

   CheckBox.getOptionTypes = function getOptionTypes() {
      return {
         triState: types(Boolean),
         caption: types(String),
         tooltip: types(String)
      };
   };

   CheckBox.getDefaultOptions = function getDefaultOptions (){
     return{
        value:false,
        triState: false
     };
   };

   CheckBox._ptivate = _private;

   return CheckBox;
});