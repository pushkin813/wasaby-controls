/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Adapter.JsonRecord', [
   'js!SBIS3.CONTROLS.Data.Adapter.IRecord',
   'js!SBIS3.CONTROLS.Data.Adapter.JsonFormatMixin'
], function (IRecord, JsonFormatMixin) {
   'use strict';

   /**
    * Адаптер для записи таблицы данных в формате JSON
    * @class SBIS3.CONTROLS.Data.Adapter.JsonRecord
    * @mixes SBIS3.CONTROLS.Data.Adapter.IRecord
    * @mixes SBIS3.CONTROLS.Data.Adapter.JsonFormatMixin
    * @public
    * @author Мальцев Алексей
    */

   var JsonRecord = $ws.core.extend({}, [IRecord, JsonFormatMixin], /** @lends SBIS3.CONTROLS.Data.Adapter.JsonRecord.prototype */{
      _moduleName: 'SBIS3.CONTROLS.Data.Adapter.JsonRecord',
      $protected: {
         /**
          * @member {Object.<String, *>} Сырые данные
          */
         _data: null
      },

      $constructor: function (data) {
         if (!(data instanceof Object)) {
            data = {};
         }
         this._data = data;
      },

      //region SBIS3.CONTROLS.Data.Adapter.JsonFormatMixin

      addField: function(format, at) {
         if (this.has(name)) {
            throw new Error('Field "' + name + '" already exists');
         }
         JsonRecord.superclass.addField.call(this, format, at);
         this.set(format.getName(), format.getDefaultValue());
      },

      removeField: function(name) {
         if (!this.has(name)) {
            throw new ReferenceError('Field "' + name + '" is not exists');
         }
         JsonRecord.superclass.removeField.call(this, name);
         delete this._data[name];
      },

      //endregion SBIS3.CONTROLS.Data.Adapter.JsonFormatMixin

      //region Public methods

      has: function (name) {
         return this._data.hasOwnProperty(name);
      },

      get: function (name) {
         return this._data[name];
      },

      set: function (name, value) {
         this._data[name] = value;
      },

      getEmpty: function () {
         return {};
      },

      getFields: function () {
         return Object.keys(this._data);
      },

      getInfo: function() {
         $ws.single.ioc.resolve('ILogger').log('SBIS3.CONTROLS.Data.Adapter.JsonRecord', 'Method getInfo() is deprecated and will be removed in 3.7.4. Use \'getFormat\' instead.');
         return {};
      },

      getKeyField: function () {
         return undefined;
      }

      //endregion Public methods
   });

   return JsonRecord;
});
