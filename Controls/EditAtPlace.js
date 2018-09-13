define('Controls/EditAtPlace', [
   'Core/Control',
   'wml!Controls/EditAtPlace/EditAtPlace',
   'css!Controls/EditAtPlace/EditAtPlace',
   'css!Controls/List/EditInPlace/Text'
], function(Control, template) {
   'use strict';
   var
      EditResult = {
         CANCEL: 'Cancel' // Undo start editing
      },
      EndEditResult = {
         CANCEL: 'Cancel' // Undo completion of editing
      },
      _private = {
         validate: function(self) {
            return self._children.formController.submit();
         }
      };

   /**
    * Controller for editing of input fields.
    *
    * @class Controls/List/EditAtPlace
    * @extends Core/Control
    * @mixes Controls/interface/IEditAtPlace
    * @author Зайцев А.С.
    * @public
    */

   var EditAtPlace = Control.extend(/** @lends Controls/List/EditAtPlace.prototype */{
      _template: template,
      _isEditing: false,
      _editObject: null,
      _startEditTarget: null,

      _beforeMount: function(newOptions) {
         this._isEditing = newOptions.editWhenFirstRendered;
         this._editObject = newOptions.editObject.clone();
      },

      _beforeUpdate: function(newOptions) {
         if (this._options.editObject !== newOptions.editObject) {
            this._editObject = newOptions.editObject.clone();
         }
      },

      _afterUpdate: function() {
         if (this._startEditTarget) {
            //search closest input and focus
            this._startEditTarget.getElementsByTagName('input')[0].focus();
            this._startEditTarget = null;
         }
      },

      _onClickHandler: function(event) {
         if (!this._options.readOnly && !this._isEditing) {
            this.startEdit(event);
         }
      },

      _onDeactivatedHandler: function() {
         if (!this._options.readOnly && this._isEditing) {
            this._options.commitOnDeactivate
               ? this.commitEdit()
               : this.cancelEdit();
         }
      },

      _onKeyDown: function(event) {
         if (this._isEditing) {
            switch (event.nativeEvent.keyCode) {
               case 13: //Enter
                  this.commitEdit();
                  break;
               case 27: //Esc
                  this.cancelEdit();
                  break;
            }
         }
      },

      startEdit: function(event) {
         var result = this._notify('beforeEdit', [this._editObject], {
            bubbling: true
         });
         if (result !== EditResult.CANCEL) {
            this._isEditing = true;
            this._startEditTarget = event.target.closest(
               '.controls-EditAtPlaceV__editorWrapper'
            );
         }
      },

      cancelEdit: function() {
         var eventResult = this._notify(
            'beforeEndEdit',
            [this._editObject, false],
            { bubbling: true }
         );
         if (eventResult !== EndEditResult.CANCEL) {
            this._editObject.rejectChanges();
            this._isEditing = false;
         }
      },

      commitEdit: function() {
         _private.validate(this).addCallback(
            function(result) {
               for (var key in result) {
                  if (result.hasOwnProperty(key) && result[key]) {
                     return;
                  }
               }
               var eventResult = this._notify(
                  'beforeEndEdit',
                  [this._editObject],
                  { bubbling: true }
               );
               if (eventResult !== EndEditResult.CANCEL) {
                  this._editObject.acceptChanges();
                  this._isEditing = false;
               }
            }.bind(this)
         );
      }
   });

   return EditAtPlace;
});
