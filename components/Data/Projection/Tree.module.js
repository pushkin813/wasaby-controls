/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Projection.Tree', [
   'js!SBIS3.CONTROLS.Data.Projection.ITree',
   'js!SBIS3.CONTROLS.Data.Projection.Collection',
   'js!SBIS3.CONTROLS.Data.Projection.TreeEnumerator',
   'js!SBIS3.CONTROLS.Data.Projection.TreeChildren',
   'js!SBIS3.CONTROLS.Data.Projection.TreeChildrenByItemPropertyStrategy',
   'js!SBIS3.CONTROLS.Data.Projection.TreeChildrenByParentIdStrategy',
   'js!SBIS3.CONTROLS.Data.Di',
   'js!SBIS3.CONTROLS.Data.Utils',
   'js!SBIS3.CONTROLS.Data.Projection.LoadableTreeItem'
], function (
   ITreeProjection,
   CollectionProjection,
   TreeEnumerator,
   TreeChildren,
   TreeChildrenByItemPropertyStrategy,
   TreeChildrenByParentIdStrategy,
   Di,
   Utils
) {
   'use strict';

   /**
    * Проекция дерева - предоставляет методы навигации, фильтрации и сортировки, не меняя при этом исходное дерево
    * @class SBIS3.CONTROLS.Data.Projection.Tree
    * @extends SBIS3.CONTROLS.Data.Projection.Collection
    * @mixes SBIS3.CONTROLS.Data.Projection.ITree
    * @public
    * @author Мальцев Алексей
    */

   var TreeProjection = CollectionProjection.extend([ITreeProjection], /** @lends SBIS3.CONTROLS.Data.Projection.Tree.prototype */{
      _moduleName: 'SBIS3.CONTROLS.Data.Projection.Tree',
      $protected: {
         _itemModule: 'projection.tree-item',

         /**
          * @var {SBIS3.CONTROLS.Data.Projection.TreeItem} Корневой элемент дерева
          */
         _root: null,

         /**
          * @var {Object} Стратегия получения дочерних элементов узла
          */
         _childrenStrategy: null,

         /**
          * @var {Object.<String, SBIS3.CONTROLS.Data.Projection.Collection>} Соответствие элементов и их дочерних узлов
          */
         _childrenMap: {}
      },

      $constructor: function () {
         if (!this._options.idProperty) {
            throw new Error('Option "idProperty" is required.');
         }

         if ($ws.helpers.instanceOfMixin(this._options.collection, 'SBIS3.CONTROLS.Data.Collection.ISourceLoadable')) {
            this._itemModule = 'projection.loadable-tree-item';
         }

         this._initChildrenStrategy();

         //TODO: filtering, ordering
      },

      destroy: function () {
         TreeProjection.superclass.destroy.call(this);
      },

      //region mutable

      /**
       * Возвращает дочерний элемент узла с указанным хэшем
       * @param {String} hash Хеш элемента
       * @param {SBIS3.CONTROLS.Data.Projection.CollectionItem} [parent] Родительский элемент, в котором искать. Если не указан, ищется от корня
       * @returns {SBIS3.CONTROLS.Data.Projection.CollectionItem}
       * @state mutable
       */
      getByHash: function(hash, parent) {
         var children = this.getChildren(parent || this.getRoot()),
            item = children.getByHash(hash);
         if (item === undefined) {
            var enumerator = children.getEnumerator(),
               child;
            while((child = enumerator.getNext())) {
               item = this.getByHash(hash, child);
               if (item !== undefined) {
                  break;
               }
            }
         }
         return item;
      },

      /**
       * Возвращает индекс дочернего элемента узла с указанным хэшем
       * @param {String} hash Хеш элемента
       * @param {SBIS3.CONTROLS.Data.Projection.CollectionItem} [parent] Родительский элемент, в котором искать. Если не указан, ищется от корня
       * @returns {Number}
       * @state mutable
       */
      getIndexByHash: function (hash, parent) {
         var children = this.getChildren(parent || this.getRoot()),
            index = children.getIndexByHash(hash);
         if (index === -1) {
            var enumerator = children.getEnumerator(),
               child;
            while((child = enumerator.getNext())) {
               index = this.getIndexByHash(hash, child);
               if (index !== -1) {
                  break;
               }
            }
         }
         return index;
      },

      //endregion mutable

      //region SBIS3.CONTROLS.Data.Collection.IEnumerable

      /**
       * Возвращает энумератор для перебора элементов проекции
       * @returns {SBIS3.CONTROLS.Data.Projection.TreeEnumerator}
       */
      getEnumerator: function () {
         return new TreeEnumerator({
            tree: this
         });
      },

      //endregion SBIS3.CONTROLS.Data.Collection.IEnumerable

      //region SBIS3.CONTROLS.Data.Projection.ICollection

      setFilter: function () {
         throw new Error('Tree projection doesn\'t support filtering');
      },

      //endregion SBIS3.CONTROLS.Data.Projection.ICollection

      //region SBIS3.CONTROLS.Data.Projection.ITree

      getIdProperty: function () {
         return this._options.idProperty;
      },

      setIdProperty: function (name) {
         this._options.idProperty = name;
      },

      getParentProperty: function () {
         return this._options.parentProperty;
      },

      setParentProperty: function (name) {
         this._options.parentProperty = name;
         this._initChildrenStrategy();
      },

      getNodeProperty: function () {
         return this._options.nodeProperty;
      },

      setNodeProperty: function (name) {
         this._options.nodeProperty = name;
      },

      getChildrenProperty: function () {
         return this._options.childrenProperty;
      },

      setChildrenProperty: function (name) {
         this._options.childrenProperty = name;
         this._initChildrenStrategy();
      },

      getRoot: function () {
         if (this._root === null) {
            if (this._options.root && $ws.helpers.instanceOfModule(this._options.root, this._itemModule)) {
               this._root = this._options.root;
            } else {
               var contents = this._options.root;
               if (typeof contents !== 'object') {
                  contents = {};
                  contents[this._options.idProperty] = this._options.root;
               }
               this._root = Di.resolve(this._itemModule, {
                  owner: this,
                  node: true,
                  expanded: true,
                  contents: contents
               });
            }
         }

         return this._root;
      },

      getChildren: function (parent) {
         this._checkItem(parent);
         var hash = parent.getHash();
         if (!(hash in this._childrenMap)) {
            this._childrenMap[hash] = new CollectionProjection({
               collection: new TreeChildren({
                  owner: parent,
                  items: this._childrenStrategy.getChildren(parent) || []
               }),
               itemModule: this._itemModule,
               convertToItem: this._childrenStrategy.getItemConverter(parent).bind(this)
            });
         }

         return this._childrenMap[hash];
      },

      moveToAbove: function () {
         var current = this.getCurrent();
         if (!current) {
            return false;
         }
         var parent = current.getParent();
         if (!parent || parent.isRoot()) {
            return false;
         }

         this.setCurrent(parent);
         return true;
      },

      moveToBelow: function () {
         var current = this.getCurrent();
         if (!current || !current.isNode()) {
            return false;
         }
         if (!current.isExpanded()) {
            current.setExpanded(true);
         }
         var children = this.getChildren(current);
         if (children.getCount() === 0) {
            return false;
         }

         this.setCurrent(children.at(0));
         return true;
      },

      //endregion SBIS3.CONTROLS.Data.Projection.ITree

      //region Protected methods

      _bindHandlers: function() {
         TreeProjection.superclass._bindHandlers.call(this);

         this._onSourceCollectionChange = this._onSourceCollectionChange.callAround(onSourceCollectionChange.bind(this));
         this._onSourceCollectionItemChange = this._onSourceCollectionItemChange.callAround(onSourceCollectionItemChange.bind(this));
      },

      _convertToItem: function (item) {
         var parentIndex = this.getCollection().getIndexByValue(
               this._options.idProperty,
               Utils.getItemPropertyValue(item, this._options.parentProperty)
            ),
            parent;
         if (parentIndex > -1) {
            //FIXME: оптимизировать переиндексацию
            this._getServiceEnumerator().reIndex();
            parent = this.at(parentIndex);
         } else {
            parent = this.getRoot();
         }

         return Di.resolve(this._itemModule, {
            contents: item,
            owner: this,
            parent: parent,
            node: !!Utils.getItemPropertyValue(item, this._options.nodeProperty)
         });
      },

      /**
       * Инициализирует стратегию получения дочерних элементов узла
       * @protected
       */
      _initChildrenStrategy: function() {
         var Strategy;
         if (this._options.childrenProperty) {
            Strategy = TreeChildrenByItemPropertyStrategy;
         } else {
            Strategy = TreeChildrenByParentIdStrategy;
         }
         this._childrenStrategy = new Strategy({
            source: this.getCollection(),
            settings: this._options
         });
      },

      /**
       * Проверяет валидность элемента коллекции
       * @param {*} item Элемент коллекции
       * @protected
       */
      _checkItem: function (item) {
         if (!item && !$ws.helpers.instanceOfModule(item, this._itemModule)) {
            throw new Error('Item should be an instance of ' + this._itemModule);
         }
      }

      //endregion Protected methods

   });

   /**
    * Обрабатывает событие об изменении потомков узла дерева исходного дерева
    * @param {Function} prevFn Оборачиваемый метод
    * @param {$ws.proto.EventObject} event Дескриптор события.
    * @param {String} action Действие, приведшее к изменению.
    * @param {*[]} newItems Новые элементы коллеции.
    * @param {Number} newItemsIndex Индекс, в котором появились новые элементы.
    * @param {*[]} oldItems Удаленные элементы коллекции.
    * @param {Number} oldItemsIndex Индекс, в котором удалены элементы.
    * @private
    */
   var onSourceCollectionChange = function (prevFn, event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
         this._childrenMap = {};

         Array.prototype.shift.call(arguments);
         prevFn.apply(this, arguments);
   },

   /**
    * Обрабатывает событие об изменении элемента исходной коллекции
    * @param {Function} prevFn Оборачиваемый метод
    * @param {$ws.proto.EventObject} event Дескриптор события.
    * @param {*} item Измененный элемент коллеции.
    * @param {Integer} index Индекс измененного элемента.
    * @param {String} [property] Измененное свойство элемента
    * @private
    */
   onSourceCollectionItemChange = function (prevFn, event, item, index, property) {
      Array.prototype.shift.call(arguments);
      prevFn.apply(this, arguments);
   };

   Di.register('projection.tree', TreeProjection);

   return TreeProjection;
});
