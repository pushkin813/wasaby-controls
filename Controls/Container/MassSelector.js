define('Controls/Container/MassSelector', [
   'Core/Control',
   'tmpl!Controls/Container/MassSelector/MassSelector',
   'Controls/Container/MassSelector/SelectionContextField',
   'Controls/Controllers/Multiselect/Selection',
   'Controls/Controllers/SourceController'
], function(
   Control,
   template,
   SelectionContextField,
   Selection,
   SourceController
) {
   'use strict';

   //TODO: нужно стопить события от List/MassSelector

   return Control.extend({
      _template: template,
      _multiselection: null,

      _beforeMount: function(newOptions) {
         var self = this;
         this._updateSelectionContext = this._updateSelectionContext.bind(this);

         this._sourceController = new SourceController({
            source: newOptions.source,
            navigation: newOptions.navigation
         });

         return this._sourceController.load().addCallback(function(items) {
            self._createMultiselection(newOptions, items);
            self._updateSelectionContext();
         });
      },

      //TODO: вроде можно удалить, т.к. используется только в Петиной демке ПМО. А там можно решить всё через selectionChangeHandler
      //TODO: и надо selectionChangeHandler переделать на событие, если получится сделать так, чтобы оно в _beforeMount не стреляло
      getSelection: function() {
         return this._multiselection.getSelection();
      },

      _onCheckBoxClickHandler: function(event, key, status) {
         if (status === true || status === null) {
            this._multiselection.unselect([key]);
         } else {
            this._multiselection.select([key]);
         }

         this._updateSelectionContext();
      },

      _selectedTypeChangedHandler: function(event, typeName) {
         this._multiselection[typeName]();

         this._updateSelectionContext();
      },

      _afterItemsRemoveHandler: function(event, keys) {
         this._multiselection.unselect(keys);

         this._updateSelectionContext();
      },

      _updateSelectionContext: function() {
         var currentSelection = this._multiselection.getSelection();

         //TODO: по сути можно отдавать только multiSelection и сделать его версионируемым
         this._selectionContext = new SelectionContextField(
            currentSelection.selected,
            currentSelection.excluded,
            this._multiselection.getCount(),
            this._multiselection
         );

         //TODO: в _beforeMount тут нет this._options
         if (this._options.selectionChangeHandler) {
            this._options.selectionChangeHandler(currentSelection);
         }
         this._forceUpdate();
      },

      _createMultiselection: function(options, items) {
         this._multiselection = new Selection({
            selectedKeys: options.selectedKeys || [],
            excludedKeys: options.excludedKeys || [],
            items: items,
            strategy: options.strategy
         });
      },

      _getChildContext: function() {
         return {
            selection: this._selectionContext
         };
      }
   });
});
