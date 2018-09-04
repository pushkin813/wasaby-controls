define('Controls/Container/MasterList', [
   'Core/Control',
   'tmpl!Controls/Container/MasterList/MasterList'
], function(Control, template) {
   return Control.extend({
      _template: template,
      _itemClickHandler: function(event, key) {
         this._notify('selectedMasterValueChanged', [key], {bubbling: true});
      }
   });
});
