define(
   [
      'Controls/toolbars',
      'Types/entity',
      'Types/collection',
      'Types/source'
   ],
   (toolbars, entity, collection, sourceLib) => {
      describe('Toolbar', () => {
         let defaultItems = [
            {
               id: '1',
               title: 'Запись 1',
               parent: null,
               '@parent': null
            },
            {
               id: '2',
               title: 'Запись 2',
               parent: null,
               '@parent': true,
               icon: 'icon-Ezy',
               iconStyle: 'super'
            },
            {
               id: '3',
               title: 'Запись 3',
               icon: 'icon-medium icon-Doge icon-primary',
               parent: null,
               '@parent': null,
               showType: 2
            },
            {
               id: '4',
               title: 'Запись 4',
               buttonViewMode: 'link',
               parent: '2',
               '@parent': null,
               showType: 0
            },
            {
               id: '5',
               title: 'Запись 4',
               buttonViewMode: 'link'
            }
         ];

         let records = new collection.RecordSet({
            rawData: defaultItems
         });
         let config = {
            source: new sourceLib.Memory({
               keyProperty: 'id',
               data: defaultItems
            }),
            parentProperty: 'parent',
            nodeProperty: '@parent'
         };
         let itemWithMenu = new entity.Model({
            rawData: defaultItems[1]
         });
         let itemWithOutMenu = new entity.Model({
            rawData: defaultItems[5]
         });
         let toolbar = new toolbars.View(config);
         toolbar._beforeMount(config);

         toolbar._notify = (e, data) => {
            assert.equal(data[0].id, 'myTestItem');
            assert.equal(e, 'itemClick');
         };
         toolbar._children.menuOpener = {
            close: setTrue.bind(this, assert),
            open: setTrue.bind(this, assert)
         };
         toolbar._children.menuTarget = {
            _container: 'target'
         };

         describe('_isShowToolbar', function() {
            it('Test1', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: null,
                     showType: 2
                  }
               });
               assert.isTrue(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
            it('Test2', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: 0,
                     showType: 2
                  }
               });
               assert.isFalse(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
            it('Test3', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: null,
                     showType: 1
                  }
               });
               assert.isTrue(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
            it('Test4', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: 0,
                     showType: 1
                  }
               });
               assert.isTrue(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
            it('Test5', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: null,
                     showType: 0
                  }
               });
               assert.isFalse(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
            it('Test6', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: 0,
                     showType: 0
                  }
               });
               assert.isFalse(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
         });

         describe('publicMethod', function() {
            it('check received state', () => {
               toolbar._beforeMount(config, null, records);
               assert.equal(toolbar._items, records);
               assert.equal(!!toolbar._needShowMenu, true);
               assert.equal(toolbar._menuItems.getCount(), 4);
            });
            it('need show menu', function() {
               return new Promise((resolve) => {
                  toolbar._beforeMount({
                     keyProperty: 'id',
                     source: config.source
                  }).addCallback(() => {
                     assert.equal(!!toolbar._needShowMenu, true);
                     assert.equal(toolbar._menuItems.getCount(), 4);
                     assert.equal(toolbar._items.getCount(), defaultItems.length);
                     resolve();
                  });
               });
            });
            it('open menu', function() {
               let isOpened = false;
               toolbar._notify = (e) => {
                  isOpened = true;
                  assert.equal(e, 'menuOpened');
               };
               toolbar._children.menuOpener = {
                  close: setTrue.bind(this, assert),
                  open: setTrue.bind(this, assert)
               };
               toolbar._children.menuTarget = {
                  _container: 'target'
               };
               toolbar._showMenu({
                  stopPropagation: () => {
                  }
               });
               assert.equal(isOpened, true);
            });
            it('click toolbar item', function() {
               let isNotify = false;
               toolbar._notify = (e, data) => {
                  assert.equal(e, 'itemClick');
                  assert.equal(data[1], 'nativeEvent');
                  isNotify = true;
               };
               toolbar._itemClickHandler({
                  stopPropagation: () => {
                  }, nativeEvent: 'nativeEvent'
               }, {
                  id: 'myTestItem',
                  get: () => {
                  },
                  handler: () => {
                  }
               });
               assert.equal(isNotify, true);
            });
            it('click item with menu', function() {
               let isNotify = false;
               let eventString = '';
               toolbar._beforeMount(config, null, records);
               let isHeadConfigCorrect = false;
               let standart = {
                  icon: 'icon-Ezy',
                  caption: 'Запись 2',
                  iconStyle: 'super',
                  iconSize: 'm'
               };
               let itemConfig = (new toolbars.View())._getMenuConfigByItem.call(toolbar, itemWithMenu);
               if (standart.caption === itemConfig.templateOptions.headConfig.caption &&
                  standart.icon === itemConfig.templateOptions.headConfig.icon &&
                  standart.iconStyle === itemConfig.templateOptions.headConfig.iconStyle &&
                  standart.iconSize === itemConfig.templateOptions.headConfig.iconSize) {
                  isHeadConfigCorrect = true;
               }
               assert.isTrue(isHeadConfigCorrect);
               toolbar._notify = (e) => {
                  eventString += e;
                  isNotify = true;
               };
               toolbar._itemClickHandler({
                  stopPropagation: () => {
                  }
               }, itemWithMenu);
               assert.equal(eventString, 'menuOpeneditemClick');
               assert.equal(isNotify, true);
            });
            it('menu item click', () => {
               let isMenuClosed = false;
               toolbar._nodeProperty = '@parent';
               toolbar._notify = (e) => {
                  assert.equal(e, 'itemClick');
               };
               toolbar._children.menuOpener.close = function() {
                  isMenuClosed = true;
               };
               toolbar._resultHandler({
                  action: 'itemClick', event: {
                     name: 'event', stopPropagation: () => {
                     }
                  }, data: [itemWithMenu]
               });
            });
            it('menu not closed if item has child', function() {
               let isMenuClosed = false;
               toolbar._nodeProperty = '@parent';
               toolbar._children.menuOpener.close = function() {
                  isMenuClosed = true;
               };
               assert.equal(isMenuClosed, false);
            });
            it('item popup config generation', function() {
               var
                  testItem = new entity.Model({
                     rawData: {
                        buttonViewMode: 'buttonViewMode',
                        popupClassName: 'popupClassName',
                        keyProperty: 'itemKeyProperty',
                        showHeader: true,
                        icon: 'icon icon-size',
                        title: 'title',
                        iconStyle: 'iconStyle'
                     }
                  }),
                  testSelf = {
                     _options: {
                        groupTemplate: 'groupTemplate',
                        groupingKeyCallback: 'groupingKeyCallback',
                        size: 'size',
                        theme: 'default',
                        keyProperty: 'keyProperty',
                        itemTemplateProperty: 'myTemplate',
                        iconSize: 'm',
                        nodeProperty: '@parent',
                        parentProperty: 'parent',
                        source: '_options.source'
                     },
                     _source: 'items',
                     _items: { getIndexByValue: () => {} }
                  },
                  expectedConfig = {
                     opener: testSelf,
                     className: 'controls-Toolbar__popup__icon_theme-default popupClassName',
                     targetPoint: {
                        horizontal: 'left',
                        vertical: 'top'
                     },
                     direction: {
                        horizontal: 'right'
                     },
                     templateOptions: {
                        groupTemplate: 'groupTemplate',
                        groupProperty: undefined,
                        groupingKeyCallback: 'groupingKeyCallback',
                        iconSize: 'm',
                        itemTemplateProperty: 'myTemplate',
                        keyProperty: 'keyProperty',
                        nodeProperty: '@parent',
                        parentProperty: 'parent',
                        headConfig: {
                           iconSize: undefined,
                           caption: 'title',
                           icon: 'icon icon-size',
                           iconStyle: 'iconStyle'
                        },
                        source: 'items',
                        root: 'itemKeyProperty',
                        showHeader: true,
                        closeButtonVisibility: false
                     }
                  };
               assert.deepEqual((new toolbars.View())._getMenuConfigByItem.call(testSelf, testItem), expectedConfig);

               testSelf._items = { getIndexByValue: () => { return -1; } }; // для элемента не найдены записи в списке
               expectedConfig.templateOptions.source = '_options.source';
               assert.deepEqual((new toolbars.View())._getMenuConfigByItem.call(testSelf, testItem), expectedConfig);

               testItem.set('showHeader', false);
               expectedConfig.templateOptions.showHeader = false;
               expectedConfig.templateOptions.closeButtonVisibility = true;
               assert.deepEqual((new toolbars.View())._getMenuConfigByItem.call(testSelf, testItem), expectedConfig);
            });
            it('get button template options by item', function() {
               let item = new entity.Record(
                  {
                     rawData: {
                        id: '0',
                        icon: 'icon-24 icon-Linked',
                        fontColorStyle: 'secondary',
                        viewMode: 'toolButton',
                        iconStyle: 'secondary',
                        contrastBackground: true,
                        title: 'Связанные документы',
                        '@parent': false,
                        parent: null,
                        readOnly: true
                     }
                  }
               );
               let modifyItem = {
                  _buttonStyle: 'readonly',
                  _caption: undefined,
                  _captionPosition: 'right',
                  _contrastBackground: true,
                  _fontColorStyle: 'secondary',
                  _fontSize: 'm',
                  _hasIcon: true,
                  _height: 'l',
                  _hoverIcon: true,
                  _icon: 'icon-24 icon-Linked',
                  _iconSize: 'm',
                  _iconStyle: 'readonly',
                  _stringCaption: false,
                  _viewMode: 'toolButton',
                  readOnly: true
               };
               assert.deepEqual((new toolbars.View())._getButtonTemplateOptionsByItem(item), modifyItem);

            });
            it('get functionalButton template options by item', function() {
               let item = new entity.Record(
                  {
                     rawData: {
                        id: '0',
                        icon: 'icon-RoundPlus',
                        fontColorStyle: 'secondary',
                        viewMode: 'functionalButton',
                        iconStyle: 'contrast',
                        title: 'Добавить',
                        '@parent': false,
                        parent: null
                     }
                  }
               );
               let modifyItem = (new toolbars.View())._getButtonTemplateOptionsByItem(item);
               assert.strictEqual(modifyItem._iconSize, 's');
               assert.strictEqual(modifyItem._height, 'default');
               assert.strictEqual(modifyItem._icon, 'icon-RoundPlus');
            });
            it('menu popup config generation', function() {
               let itemsForMenu = [
                  {
                     id: '1',
                     buttonIcon: 'myIcon'
                  },
                  {
                     id: '2',
                     buttonIconStyle: 'secondary'
                  }
               ];

               let recordForMenu = new collection.RecordSet({
                  rawData: itemsForMenu
               });
               var
                  testSelf = {
                     _options: {
                        theme: 'default',
                        size: 'size',
                        additionalProperty: 'additional',
                        popupClassName: 'popupClassName',
                        itemTemplateProperty: 'itp',
                        groupTemplate: 'groupTemplate',
                        groupingKeyCallback: 'groupingKeyCallback',
                        iconSize: 'm',
                        keyProperty: 'id',
                        nodeProperty: '@parent',
                        parentProperty: 'parent'
                     },
                     _children: {
                        menuTarget: 'menuTarget'
                     },
                     _menuSource: recordForMenu
                  },
                  config = {
                     className: 'popupClassName controls-Toolbar__popup__list_theme-default',
                     target: 'menuTarget',
                     templateOptions: {
                        iconSize: 'm',
                        keyProperty: 'id',
                        nodeProperty: '@parent',
                        parentProperty: 'parent',
                        source: recordForMenu,
                        additionalProperty: 'additional',
                        itemTemplateProperty: 'itp',
                        groupTemplate: 'groupTemplate',
                        groupingKeyCallback: 'groupingKeyCallback',
                        groupProperty: undefined,
                        footerContentTemplate: undefined,
                        itemActions: undefined,
                        itemActionVisibilityCallback: undefined
                     }
                  };
               assert.deepEqual((new toolbars.View())._getMenuConfig.call(testSelf), config);
            });
            it('toolbar closed by his parent', () => {
               let isMenuClosed = false;
               toolbar._nodeProperty = '@parent';
               toolbar._children.menuOpener.close = function() {
                  isMenuClosed = true;
               };
               toolbar._resultHandler('itemClick', itemWithOutMenu);
               assert.equal(isMenuClosed, true, 'toolbar closed, but his submenu did not');
            });
            it('_closeHandler', () => {
               let isMenuClosed = false;
               toolbar._notify = (e, arr, bubl) => {
                  assert.equal(e, 'menuClosed', 'closeHandler is uncorrect');
                  assert.equal(bubl.bubbling, true, 'closeHandler is uncorrect');
               };
               toolbar._options.source = config.source;
               toolbar._closeHandler();
            });
         });
         function setTrue(assert) {
            assert.equal(true, true);
         }
      });
   }
);
