/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Collection.ISourceLoadable', [
], function () {
   'use strict';

   /**
    * Интерфейс коллекции, загружаемой через источник данных
    * @mixin SBIS3.CONTROLS.Data.Collection.ISourceLoadable
    * @implements SBIS3.CONTROLS.Data.Query.IQueryable
    * @public
    * @author Мальцев Алексей
    */

   var ISourceLoadable = /** @lends SBIS3.CONTROLS.Data.Collection.ISourceLoadable.prototype */{
      /**
       * @event onBeforeCollectionLoad Перед загрузкой данных из источника
       * @param {$ws.proto.EventObject} event Дескриптор события.
       * @param {String} mode=SBIS3.CONTROLS.Data.Collection.ISourceLoadable.MODE_REPLACE Режим загрузки
       * @param {SBIS3.CONTROLS.Data.Collection.IEnumerable} target Объект, в который производится загрузка
       */

      /**
       * @event onAfterCollectionLoad После загрузки данных из источника
       * @param {$ws.proto.EventObject} event Дескриптор события.
       * @param {String} [mode=SBIS3.CONTROLS.Data.Collection.ISourceLoadable.MODE_REPLACE] Режим загрузки
       * @param {SBIS3.CONTROLS.Data.Source.DataSet} dataSet Набор данных
       * @param {SBIS3.CONTROLS.Data.Collection.IEnumerable} target Объект, в который производится загрузка
       */

      /**
       * @event onBeforeLoadedApply Перед вставкой загруженных данных в коллекцию
       * @param {$ws.proto.EventObject} event Дескриптор события.
       * @param {String} [mode=SBIS3.CONTROLS.Data.Collection.ISourceLoadable.MODE_REPLACE] Режим загрузки
       * @param {SBIS3.CONTROLS.Data.Collection.IEnumerable} collection Коллекция, полученная из источника
       * @param {SBIS3.CONTROLS.Data.Collection.IEnumerable} target Объект, в который производится загрузка
       * @example
       * <pre>
       *    grid.subscribe('onBeforeLoadedApply', function(eventObject, mode, collection){
       *       collection.add('My own list item at 1st position', 0);
       *    });
       * </pre>
       */

      /**
       * @event onAfterLoadedApply После вставки загруженных данных в коллекцию
       * @param {$ws.proto.EventObject} event Дескриптор события.
       * @param {String} [mode=SBIS3.CONTROLS.Data.Collection.ISourceLoadable.MODE_REPLACE] Режим загрузки
       * @param {SBIS3.CONTROLS.Data.Collection.IEnumerable} collection Коллекция, полученная из источника
       * @param {SBIS3.CONTROLS.Data.Collection.IEnumerable} target Объект, в который производится загрузка
       * @example
       * <pre>
       *    grid.subscribe('onAfterLoadedApply', function(eventObject, mode, collection){
       *       collection.add('My own list item at 1st position', 0);
       *    });
       * </pre>
       */


      /**
       * @cfg {SBIS3.CONTROLS.Data.Source.ISource} Источник данных
       * @name SBIS3.CONTROLS.Data.Collection.ISourceLoadable#source
       */
      _$source: undefined,

      /**
       * Возвращает источник данных
       * @returns {SBIS3.CONTROLS.Data.Source.Base}
       */
      getSource: function () {
         throw new Error('Method must be implemented');
      },

      /**
       * Устанавливает источник данных
       * @param {SBIS3.CONTROLS.Data.Source.Base} source
       */
      setSource: function (source) {
         throw new Error('Method must be implemented');
      },

      /**
       * Возвращает признак, что коллекция уже была загружена из источника
       * @returns {Boolean}
       */
      isLoaded: function () {
         throw new Error('Method must be implemented');
      },

      /**
       * Возвращает признак, что запрос на выборку был изменен c момента последнего load()
       * @returns {Boolean}
       */
      isQueryChanged: function () {
         throw new Error('Method must be implemented');
      },
      
      /**
       * Возвращает общее кол-во записей выборки или признак, что еще есть записи (если общее кол-во записей не определено)
       * @returns {Number|Boolean}
       */
      getQueryTotal: function() {
         throw new Error('Method must be implemented');
      },
      
      /**
       * Возвращает признак, что еще не все записи загружены
       * @returns {Boolean}
       */
      hasMore: function() {
         throw new Error('Method must be implemented');
      },

      /**
       * Загружает данные из источника в коллекцию
       * @param {String} [mode=SBIS3.CONTROLS.Data.Collection.ISourceLoadable.MODE_REPLACE] Режим загрузки
       * SBIS3.CONTROLS.Data.Collection.ISourceLoadable.MODE_REPLACE - заменить
       * SBIS3.CONTROLS.Data.Collection.ISourceLoadable.MODE_APPEND - добавить в конец
       * SBIS3.CONTROLS.Data.Collection.ISourceLoadable.MODE_PREPEND - добавить в начало
       * @returns {$ws.proto.Deferred} Асинхронный результат выполнения, первым аргументом придет SBIS3.CONTROLS.Data.Source.DataSet
       */
      load: function (mode) {
         throw new Error('Method must be implemented');
      }
   };

   /**
    * @const {String} Режим загрузки - замена
    */
   ISourceLoadable.MODE_REPLACE = 'r';
   /**
    * @const {String} Режим загрузки - добавление в конец
    */
   ISourceLoadable.MODE_APPEND = 'a';
   /**
    * @const {String} Режим загрузки - добавление в начало
    */
   ISourceLoadable.MODE_PREPEND = 'p';

   return ISourceLoadable;
});
