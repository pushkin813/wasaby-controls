/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Format.RecordField', [
   'js!SBIS3.CONTROLS.Data.Format.Field'
], function (Field) {
   'use strict';

   /**
    * Формат поля для записи
    * @class SBIS3.CONTROLS.Data.Format.RecordField
    * @extends SBIS3.CONTROLS.Data.Format.Field
    * @public
    * @author Мальцев Алексей
    */

   var RecordField = Field.extend(/** @lends SBIS3.CONTROLS.Data.Format.RecordField.prototype */{
      _moduleName: 'SBIS3.CONTROLS.Data.Format.RecordField'

      //region Public methods

      //endregion Public methods

   });

   return RecordField;
});
