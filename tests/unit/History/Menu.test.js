define(
   [
      'Controls/History/Menu',
      'WS.Data/Source/Memory',
      'Core/core-clone',
      'WS.Data/Entity/Model',
      'Controls/History/Source',
      'Controls/History/Service',
      'Core/Deferred'
   ],
   function(Menu, Memory, Clone, Model, HistorySource, HistoryService, Deferred) {
      'use strict';

      let items = [
         {
            id: '1',
            title: 'Запись 1'
         },
         {
            id: '2',
            title: 'Запись 2'
         },
         {
            id: '3',
            title: 'Запись 3'
         }
      ];

      var menuConfig = {
         filter: { id: 'test' },
         viewMode: 'link',
         icon: 'icon-small',
         source: new Memory({
            data: items,
            idProperty: 'id'
         })
      };

      var getHistoryMenu = function(config) {
         var hMenu = new Menu(config);
         hMenu.saveOptions(config);
         return hMenu;
      };

      describe('Controls/History/Menu', function() {
         it('_private.getMetaHistory', function() {
            assert.deepEqual(Menu._private.getMetaHistory(), {
               $_history: true
            });
         });

         it('_private.getMetaPinned', function() {
            var item = new Model({
               rawData: {
                  pinned: false
               }
            });

            assert.deepEqual(Menu._private.getMetaPinned(item), {
               $_pinned: true
            });
         });

         it('_private.prepareFilter', function() {
            var filter = {
               test: 'test'
            };

            assert.deepEqual(Menu._private.prepareFilter(filter), {
               test: 'test',
               $_history: true
            });
         });
         it('_beforeMount', function() {
            var menu = getHistoryMenu(menuConfig);
            menu._beforeMount(menuConfig);
            assert.equal(menu._offsetClassName, 'controls-MenuButton controls-MenuButton_link_small');
            assert.deepEqual(menu._filter, { $_history: true, id: 'test' });
         });
         it('_beforeUpdate filter changed', function() {
            var menu = getHistoryMenu(menuConfig);
            menu._beforeMount(menuConfig);
            var newConfig = { filter: { id: 'test2' } };
            assert.deepEqual(menu._filter, { $_history: true, id: 'test' });
            menu._beforeUpdate(newConfig);
            assert.deepEqual(menu._filter, { $_history: true, id: 'test2' });
         });
         it('_beforeUpdate source changed', function() {
            var menu = getHistoryMenu(menuConfig);
            var newConfig = Clone(menuConfig);
            newConfig.source = new Memory({
               data: []
            });
            menu._beforeUpdate(newConfig);
            assert.deepEqual(menu._filter, { $_history: true, id: 'test' });
         });
         it('_onPinClickHandler', function() {
            var newConfig = Clone(menuConfig);
            newConfig.source = new HistorySource({
               originSource: new Memory({
                  idProperty: 'id',
                  data: items
               }),
               historySource: new HistoryService({
                  historyId: 'TEST_HISTORY_ID'
               }),
               parentProperty: 'parent'
            });
            newConfig.source.update = function() {
               return Deferred.success(false);
            };
            var menu = getHistoryMenu(newConfig);
            menu._children = {
               notificationOpener: {
                  open: (popupOptions) => {
                     assert.deepEqual(popupOptions, {
                        template: 'wml!Controls/Popup/Templates/Notification/Simple',
                        templateOptions: {
                           style: 'error',
                           text: 'Невозможно закрепить более 10 пунктов',
                           icon: 'Alert'
                        }
                     });
                  }
               }
            };
            menu._onPinClickHandler('pinClicked', [new Model({
               rawData: {
                  pinned: false
               }
            })]);
         });
      });
   }
);
