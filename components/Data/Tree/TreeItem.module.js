/* global define, require, $ws */
define('js!SBIS3.CONTROLS.Data.Tree.TreeItem', [
   'js!SBIS3.CONTROLS.Data.Collection.CollectionItem',
   'js!SBIS3.CONTROLS.Data.Tree.ITreeItem',
   'js!SBIS3.CONTROLS.Data.Tree.ObservableTreeChildren',
   'js!SBIS3.CONTROLS.Data.Projection.Tree'
], function (CollectionItem, ITreeItem) {
   'use strict';

   /**
    * Элемент дерева
    * @class SBIS3.CONTROLS.Data.Tree.TreeItem
    * @extends SBIS3.CONTROLS.Data.Collection.CollectionItem
    * @mixes SBIS3.CONTROLS.Data.Tree.ITreeItem
    * @public
    * @author Мальцев Алексей
    */
   var TreeItem = CollectionItem.extend([ITreeItem], /** @lends SBIS3.CONTROLS.Data.Tree.TreeItem.prototype */{
      _moduleName: 'SBIS3.CONTROLS.Data.Tree.TreeItem',
      $protected: {
         _options: {
            /**
             * @cfg {String} Название свойства, содержащего дочерние элементы узла. Используется для анализа элементов {@link children} на предемет наличия дочерних элементов.
             */
            childrenProperty: ''
         },

         /**
          * @var {String} Модуль коллекции дочерних элементов
          */
         _childrenModule: 'SBIS3.CONTROLS.Data.Tree.ObservableTreeChildren',

         _hashPrefix: 'tree-item-'
      },

      $constructor: function (cfg) {
         cfg = cfg || {};

         if ('node' in cfg) {
            this._options.node = !!cfg.node;
         }

         if ('children' in cfg) {
            this._setChildren(cfg.children);
         }
      },

      //region SBIS3.CONTROLS.Data.Tree.ITreeItem

      getParent: function () {
         return this._options.parent;
      },

      setParent: function (parent) {
         if (this._options.parent === parent) {
            return;
         }
         this._options.parent = parent;
         this._notifyItemChangeToOwner('parent');
      },

      getLevel: function () {
         return this.isRoot() ? 0 : 1 + this.getParent().getLevel();
      },

      isNode: function () {
         return this._options.node;
      },

      isRoot: function () {
         return !this._options.parent;
      },

      /**
       * Возвращает коллекцию потомков узла
       * @returns {SBIS3.CONTROLS.Data.Tree.TreeChildren}
       */
      getChildren: function () {
         return this._options.children || (this._options.children = $ws.single.ioc.resolve(this._childrenModule, {
            owner: this
         }));
      },

      getChildByHash: function (hash, deep) {
         var enumerator = this.getChildren().getEnumerator(),
            child = enumerator.getItemByPropertyValue('hash', hash),
            subChild;
         if (child !== undefined) {
            return child;
         }

         if (deep) {
            enumerator.reset();
            while ((child = enumerator.getNext())) {
               subChild = child.getChildByHash(hash, deep);
               if (subChild !== undefined) {
                  return subChild;
               }
            }
         }

         return subChild;
      },

      isExpanded: function () {
         return this._options.expanded;
      },

      setExpanded: function (expanded) {
         if (this._options.expanded === expanded) {
            return;
         }
         this._options.expanded = expanded;
         this._notifyItemChangeToOwner('expanded');
      },

      toggleExpanded: function () {
         this.setExpanded(!this.isExpanded());
      },

      //endregion SBIS3.CONTROLS.Data.Tree.ITreeItem

      //region Public methods

      /**
       * Возвращает название свойства, содержащего дочерние элементы узла
       * @returns {String}
       */
      getChildrenProperty: function () {
         return this._options.childrenProperty;
      },

      /**
       * Генерирует в корневом узле об изменении коллекции дочерних узлов дерева.
       * @param {String} action Действие, приведшее к изменению.
       * @param {SBIS3.CONTROLS.Data.Tree.TreeItem[]} newItems Новые элементы коллеции.
       * @param {Number} newItemsIndex Индекс, в котором появились новые элементы.
       * @param {SBIS3.CONTROLS.Data.Tree.TreeItem[]} oldItems Удаленные элементы коллекции.
       * @param {Number} oldItemsIndex Индекс, в котором удалены элементы.
       * @private
       */
      notifyChildrenChangeToRoot: function (action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
         this._bubbleUp(function() {
            this._notify(
               'onCollectionChange',
               action,
               newItems,
               newItemsIndex,
               oldItems,
               oldItemsIndex
            );
         });
      },

      //endregion Public methods

      //region Protected methods

      /**
       * Генерирует событие у владельца об изменении свойства элемента.
       * Помимо родительской коллекции уведомляет также и корневой узел дерева.
       * @param {String} property Измененное свойство
       * @private
       */
      _notifyItemChangeToOwner: function(property) {
         TreeItem.superclass._notifyItemChangeToOwner.call(this, property);

         var node = this,
            index = this._options.owner.getIndex(this);
         this._bubbleUp(function() {
            this.notifyItemChange(
               node,
               index,
               property
            );
         });
      },

      /**
       * Обеспечивает всплытие метода до корневого узла и вызов его там
       * @param {Function} callback Метод, который должен быть выполнен на корневом узле
       * @param {Object} [context] Контекст метода (если не задан, то корневой узел)
       * @private
       */
      _bubbleUp: function (callback, context) {
         if (this._options.parent) {
            this._options.parent._bubbleUp(callback);
         } else {
            callback.call(context || this);
         }
      },

      /**
       * Устанавливает коллекцию дочерних элементов узла
       * @param {SBIS3.CONTROLS.Data.Tree.TreeChildren|Array} children Дочерние элементы
       * @private
       */
      _setChildren: function (children) {
         if (children === undefined) {
            return;
         }

         if (children instanceof Array) {
            children = $ws.single.ioc.resolve(this._childrenModule, {
               owner: this,
               items: children
            });
         }

         if (!$ws.helpers.instanceOfModule(children, this._childrenModule)) {
            throw new Error('Tree node children should be an instance of ' + this._childrenModule);
         }

         this._options.children = children;
      }

      //endregion Protected methods

   });

   $ws.single.ioc.bind('SBIS3.CONTROLS.Data.Tree.TreeItem', function(config) {
      return new TreeItem(config);
   });

   return TreeItem;
});
