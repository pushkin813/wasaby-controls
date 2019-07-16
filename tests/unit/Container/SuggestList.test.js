define(
   ['Controls/suggestPopup', 'Env/Env', 'Types/entity', 'Types/collection'],
   function(suggestPopup, Env, entity, collection) {
      
      'use strict';
      
      describe('Controls.Container.Suggest.List', function() {
         suggestPopup.ListContainer._private.scrollToLastItem = function(){};

         describe('_beforeUpdate', function() {
            var suggestList = new suggestPopup.ListContainer();
            var contextObject = {
               suggestOptionsField: {
                  options: {
                     tabsSelectedKey: null
                  }
               }
            };
            var contextObjectWithNewKey = {
               suggestOptionsField: {
                  options: {
                     tabsSelectedKey: 'test'
                  }
               }
            };
            var contextObjectWithStickyPosition = {
               suggestOptionsField: {
                  options: {
                     stickyPosition: {
                        verticalAlign: {
                           side: 'top'
                        }
                     }
                  }
               }
            };

            var eventFired = false;
            var tab = null;
   
            suggestList._suggestListOptions = {
               tabsSelectedKey: null
            };
            
            suggestList._notify = function(event, id) {
               eventFired = true;
               tab = id[0];
            };

            it('default', function() {
               suggestList._beforeUpdate({}, contextObject);

               assert.isFalse(eventFired);
               assert.equal(tab, null);
            });
   
            it('with new tab key', function() {
               suggestList._beforeUpdate({}, contextObjectWithNewKey);

               assert.isTrue(eventFired);
               assert.equal(tab, 'test');
            });
   
            it('with stickyPosition reverse', function() {
               suggestList._reverseList = false;
               suggestList._beforeUpdate({}, contextObjectWithStickyPosition);
               assert.isTrue(suggestList._reverseList);
            });
         });
         
         it('_tabsSelectedKeyChanged', function() {
            var suggestList = new suggestPopup.ListContainer();
            var tab = null;
            suggestList._suggestListOptions = {
               tabsSelectedKeyChangedCallback: function(newtab) {
                  tab = newtab;
               }
            };
            
            suggestList._tabsSelectedKeyChanged(null, 'test');
            assert.equal(tab, 'test');
         });
   
         it('isTabChanged', function() {
            assert.isTrue(suggestPopup.ListContainer._private.isTabChanged({tabsSelectedKey: 1}, 2));
            assert.isFalse(suggestPopup.ListContainer._private.isTabChanged({tabsSelectedKey: 1}, 1));
         });

         it('dispatchEvent', function() {
            var eventDispatched = false;
            var container = {
               dispatchEvent: function(event) {
                  assert.equal(event.keyCode, 'testKeyCode');
                  eventDispatched = true;
               }
            }

            suggestPopup.ListContainer._private.dispatchEvent(container, {keyCode: 'testKeyCode'}, {});
            assert.isTrue(eventDispatched);
         });

         it('getTabKeyFromContext', function() {
            var emptyContext = {};
            var contextWithValue = {
               suggestOptionsField: {
                  options: {
                     tabsSelectedKey: 1
                  }
               }
            };
      
            assert.equal(suggestPopup.ListContainer._private.getTabKeyFromContext(emptyContext), null);
            assert.equal(suggestPopup.ListContainer._private.getTabKeyFromContext(contextWithValue), 1);
         });

         describe('_inputKeydown, markedKey is null', function() {
            var
               suggestList = new suggestPopup.ListContainer(),
               domEvent = {
                  nativeEvent: {
                     keyCode: Env.constants.key.up
                  }
               };

            suggestList._options = {
               keyProperty: 'id'
            };
            suggestList._items = new collection.List({
               items: [
                  new entity.Model({
                     rawData: {id: 'first'},
                     idProperty: 'id'
                  }),
                  new entity.Model({
                     rawData: {id: 'last'},
                     idProperty: 'id'
                  })
               ]
            });

            it('list is not reverse', function() {
               suggestList._inputKeydown(null, domEvent);
               assert.equal(suggestList._markedKey, 'last');
            });

            it('list is reverse', function() {
               suggestList._reverseList = true;
               suggestList._markedKey = null;
               suggestList._inputKeydown(null, domEvent);
               assert.equal(suggestList._markedKey, 'first');
            });
         });

         it('_searchEndCallback', function() {
            let
               items = [1, 2, 3],
               suggestList = new suggestPopup.ListContainer();

            suggestList._suggestListOptions = {};
            suggestList._searchEndCallback({
               data: items
            });

            assert.equal(suggestList._items, items);
         });
      });
   }
);