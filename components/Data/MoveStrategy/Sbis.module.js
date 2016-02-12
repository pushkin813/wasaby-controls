/* global define, $ws*/
define('js!SBIS3.CONTROLS.Data.MoveStrategy.Sbis', [
   'js!SBIS3.CONTROLS.Data.MoveStrategy.Base',
   'js!SBIS3.CONTROLS.Data.Di',
   'js!SBIS3.CONTROLS.Data.Source.Provider.SbisBusinessLogic'
], function (BaseMoveStrategy, DI) {
   'use strict';
   /**
    * Стандартная стратегия перемещения записей
    * @class SBIS3.CONTROLS.Data.MoveStrategy.Sbis
    * @extends SBIS3.CONTROLS.Data.MoveStrategy.Base
    * @public
    * @author Ганшин Ярослав
    * @example
    */

   return BaseMoveStrategy.extend([],/** @lends SBIS3.CONTROLS.Data.MoveStrategy.Sbis.prototype */{
      $protected: {
         _options:{

            /**
             * @cfg {String} Имя объекта бизнес-логики, реализующего перемещение записей. По умолчанию 'ПорядковыйНомер'.
             * @example
             * <pre>
             *    <option name="moveResource">ПорядковыйНомер</option>
             * </pre>
             * @see move
             */
            moveResource: 'ПорядковыйНомер',

            /**
             * @cfg {String} Префикс имени метода, который используется для перемещения записи. По умолчанию 'Вставить'.
             * @see move
             */
            moveMethodPrefix: 'Вставить',
            /**
             * @cfg {String} Имя поля, по которому по умолчанию сортируются записи выборки. По умолчанию 'ПорНомер'.
             * @see move
             */
            moveDefaultColumn: 'ПорНомер'

         },
         _orderProvider: undefined
      },
      $constructor: function (cfg){
         if(!cfg.resource && !cfg.dataSource){
            throw new Error('The Resource and the Data Source are not defined.');
         }
         if (!cfg.resource) {
            this._options.resource = cfg.dataSource.getResource();
         }
      },

      move: function (from, to, after) {
         var self = this,
            suffix = after ? 'После':'До',
            def = new $ws.proto.ParallelDeferred(),
            method = this._options.moveMethodPrefix + suffix,
            params = this._getMoveParams(to, after);
         if (!this._orderProvider) {
            this._orderProvider = DI.resolve('source.provider.sbis-business-logic', {resource: this._options.moveResource});
         }
         $ws.helpers.forEach(from, function(record) {
            params['ИдО'] = [String.prototype.split.call(record.getId(), ',')[0], self._options.resource];
            def.push(self._orderProvider.call(method, params, $ws.proto.BLObject.RETURN_TYPE_ASIS).addErrback(function (error) {
               $ws.single.ioc.resolve('ILogger').log('SBIS3.CONTROLS.Data.MoveStrategy.Sbis::move()', error);
               return error;
            }));
         });
         return def.done().getResult();
      },

      /**
       * Возвращает параметры перемещения записей
       * @param {String} to Значение поля, в позицию которого перемещаем (по умолчанию - значение первичного ключа)
       * @param {Boolean} after Дополнительная информация о перемещении
       * @returns {Object}
       * @private
       */
      _getMoveParams: function(to, after) {
         var objectName = this._options.resource,
            params = {
               'ПорядковыйНомер': this._options.moveDefaultColumn,
               'Иерархия': null,
               'Объект': this._options.resource
            },
            id = String.prototype.split.call(to.getId(), ',')[0];

         if (after) {
            params['ИдОПосле'] = [id, objectName];
         } else {
            params['ИдОДо'] = [id, objectName];

         }
         return params;
      }


   });
});
