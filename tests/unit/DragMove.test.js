/* global define, beforeEach, afterEach, describe, context, it, assert, $ws */
define([
   'js!SBIS3.CONTROLS.ListView.DragMove',
   'js!SBIS3.CONTROLS.DragEntity.List',
   'js!SBIS3.CONTROLS.DragObject',
   'js!SBIS3.CONTROLS.ListView',
   'js!WS.Data/Collection/RecordSet',
   'Core/core-instance',
   'js!SBIS3.CONTROLS.DragEntity.List'
], function (DragMove, DragList, DragObject, ListView, RecordSet, cInstance) {
   'use strict';
   describe('DragMove', function () {
      var list, element, view, dragMove, event;
      beforeEach(function () {
         if (typeof $ === 'undefined') {
            this.skip();
            return;
         }
         list = new DragList({});
         element = $(
            '<div class="view">' +
            '</div>'
         );
         view = new ListView({
            element: element,
            items: new RecordSet({
               rawData: [{id: 1}, {id: 2}, {id: 3}, {id: 4}],
               idProperty: 'id'
            }),
            multiselect: true,
            displayProperty: 'id',
            idProperty: 'id'
         });
         dragMove = view._getDragMove();
         event = {
            type: "mouseUp",
            target: view.getContainer().find('[data-id=1]'),
            pageX: 0,
            pageY: 0
         };
         DragObject._jsEvent = event;
         DragObject._targetsControl = view;
         DragObject.setOwner(view);
      });
      afterEach(function () {
         DragObject.reset();
      });
      describe('._checkHorisontalDragndrop', function () {
         it('should return true if target has display inline-block', function () {
            var target = $('<div style="display:inline-block; float:none">');
            assert.isTrue(DragMove.prototype._checkHorisontalDragndrop(target));
         });
         it('should return true if target is a float', function () {
            var target = $('<div style="float:left">');
            assert.isTrue(DragMove.prototype._checkHorisontalDragndrop(target));
         });
         it('should return true if parent targets has display flex', function () {
            var target = $('<div style="float:none">');
            parent = $('<div style="display: flex; flex-direction: row">');
            parent.html(target);
            assert.isTrue(DragMove.prototype._checkHorisontalDragndrop(target));
         });
         it('should return flase if target has display block', function () {
            var target = $('<div style="float:none; display: block">');
            assert.isFalse(DragMove.prototype._checkHorisontalDragndrop(target));
         });
         it('should return false if parent targets has display flex and flex-direction column', function () {
            var target = $('<div style="float:none">');
            parent = $('<div style="display: flex; flex-direction: column">');
            parent.html(target);
            assert.isFalse(DragMove.prototype._checkHorisontalDragndrop(target));
         });
      });
      describe('._isCorrectSource', function () {
         it('should return true when source is list', function () {
            var list = new DragList({});
            assert.isTrue(DragMove.prototype._isCorrectSource(list));
         });
         it('should return false when source is array', function () {
            assert.isFalse(DragMove.prototype._isCorrectSource([]));
         });
         it('should check source after begin drag', function () {
            dragMove.beginDrag();
            assert.isTrue(dragMove._isCorrectSource(DragObject.getSource()));
         });
      });
      describe('.beginDrag', function () {
         it('should not begin drag', function () {
            var dragMove = new DragMove({
                  view: new ListView()
               });
            DragObject._jsEvent = {
               type: "mouseUp",
               target: $('<div/>'),
               pageX: 0,
               pageY: 0
            };
            assert.isFalse(dragMove.beginDrag());
         });
         it('should begin drag', function () {
            assert.isTrue(dragMove.beginDrag());
         });
         it('should set source 1 element', function () {
            dragMove.beginDrag();
            assert.equal(DragObject.getSource().getCount(), 1);
            var item = DragObject.getSource().at(0);
            assert.equal(item.getModel().getId(), 1);
            assert.equal(item.getDomElement()[0], DragObject._jsEvent.target[0]);
         });
         it('should set source 2 element', function () {
            view.setSelectedKeys([1,2]);
            dragMove.beginDrag();
            assert.equal(DragObject.getSource().getCount(), 2);
            assert.include([1, 2], DragObject.getSource().at(0).getModel().getId());
            assert.include([1, 2], DragObject.getSource().at(1).getModel().getId());
         });
         it('should create drag list', function () {
            dragMove.beginDrag();
            assert.isTrue(cInstance.instanceOfModule(DragObject.getSource(), 'SBIS3.CONTROLS.DragEntity.List'));
         });
      });
      describe('._getDragTarget', function () {
         it('should return drag target', function () {
            var target = dragMove._getDragTarget();
            assert.equal(target.item.getId(), 1);
            assert.equal(target.domElement.html(), 1);
         })
      });
      describe('._getDirectionOrderChange', function () {
         it('should return before', function () {
            assert.equal(dragMove._getDirectionOrderChange(event.target), 'before');
         });
         it('should return after', function () {
            event.pageY = 11;
            assert.equal(dragMove._getDirectionOrderChange(event.target), 'after');
         });
         it('should return before', function () {
            dragMove._horisontalDragNDrop = true;
            assert.equal(dragMove._getDirectionOrderChange(event.target), 'before');
         });
         it('should return after', function () {
            dragMove._horisontalDragNDrop = true;
            event.pageX = 21;
            assert.equal(dragMove._getDirectionOrderChange(event.target), 'after');
         });

      });
      describe('.updateTarget', function () {
         beforeEach(function () {
            if (dragMove) {
               dragMove.beginDrag();
               dragMove._horisontalDragNDrop = false;
            }
         });
         it('should set target', function () {
            dragMove.updateTarget();
            var target = DragObject.getTarget();
            assert.isTrue(cInstance.instanceOfModule(target, 'SBIS3.CONTROLS.DragEntity.Row'));
            assert.equal(target.getModel().getId(), 1);
         });
         it('should not set target', function () {
            event.target = view.getContainer().find('[data-id=2]');
            dragMove.updateTarget();
            assert.isUndefined(DragObject.getTarget());
         });
         it('should not set target when item outside', function () {
            event.target = $('body');
            dragMove.updateTarget();
            assert.isUndefined(DragObject.getTarget());
         });
         it('should not throw error when source is array', function () {
            DragObject.setSource([{mr:'trololo'}]);
            assert.doesNotThrow(function () {
               dragMove.updateTarget();
            });
         });
         it('should not throw error when source is undefined', function () {
            DragObject.setSource(undefined);
            assert.doesNotThrow(function () {
               dragMove.updateTarget();
            });
         });
      });
      describe('._canDragMove', function () {
         it('should return true', function () {
            dragMove.beginDrag();
            dragMove.updateTarget();
            assert.isTrue(dragMove._canDragMove());
         });
         it('should return false when source is not correct', function () {
            dragMove.beginDrag();
            dragMove.updateTarget();
            DragObject.setSource([]);
            assert.isFalse(dragMove._canDragMove());
         });
         it('should return false when targets control is not equal source', function () {
            dragMove.beginDrag();
            dragMove.updateTarget();
            DragObject._targetsControl = {};
            assert.isFalse(dragMove._canDragMove());
         });
         it('should return false when source list is empty', function () {
            dragMove.beginDrag();
            dragMove.updateTarget();
            DragObject.setSource(new DragList({}));
            assert.isFalse(dragMove._canDragMove());
         });
         it('should return false when source not exist Row', function () {
            dragMove.beginDrag();
            dragMove.updateTarget();
            DragObject.setSource(new DragList({
               items: [{mr:'Trololo'}]
            }));
            assert.isFalse(dragMove._canDragMove());
         });
      });
      describe('.getContainer', function () {
         it('should return container', function () {
            assert.equal(dragMove.getContainer(), view.getContainer());
         });
      });
      describe('.drag', function () {
         it('should add hilight', function () {
            dragMove.beginDrag();
            dragMove.updateTarget();
            dragMove.drag();
            assert.isTrue(DragObject.getTarget().getDomElement().hasClass('controls-DragNDrop__insertBefore'));
         });
         it('should add hilight if another drag owner', function () {
            dragMove.beginDrag();
            dragMove.updateTarget();
            DragObject.setOwner({});
            dragMove.drag();
            assert.isTrue(DragObject.getTarget().getDomElement().hasClass('controls-DragNDrop__insertBefore'));
         });
      });
      describe('.endDrag', function () {
         it('should call move', function (done) {
            dragMove.beginDrag();
            event.target = view.getContainer().find('[data-id=3]');
            dragMove.updateTarget();
            view.move = function (moved, target, position) {
               assert.equal(moved[0].getId(), 1);
               assert.equal(target.getId(), 3);
               assert.equal(position, 'before');
               done();
            };
            dragMove.endDrag();
         });
         it('should move outside', function (done) {
            dragMove.beginDrag();
            event.target = view.getContainer().find('[data-id=3]');
            dragMove.updateTarget();
            var view1 = new ListView({
               element: element,
               items: new RecordSet({
                  rawData: [{id: 1}, {id: 2}, {id: 3}, {id: 4}],
                  idProperty: 'id'
               }),
               multiselect: true,
               displayProperty: 'id',
               idProperty: 'id'
            });
            DragObject.setOwner(view1);
            view._getMover().moveFromOutside = function (dragSource, target, ownerItems, move) {
               assert.equal(DragObject.getSource(), dragSource);
               assert.equal(DragObject.getTarget(), target);
               assert.equal(view1.getItems(), ownerItems);
               assert.equal(move, false);
               done();
            };
            dragMove.endDrag();
         });
      });

      describe('createAvatar', function () {
         it('should create avatar', function () {
            dragMove.beginDrag();
            assert.isTrue(dragMove.createAvatar().length > 0);
         });
         it('should set counter in avatar', function () {
            view.setSelectedKeys([1,2]);
            dragMove.beginDrag();
            assert.equal(dragMove.createAvatar().find('.controls-DragNDrop__draggedCount').html(), 2);
         });
      });
      describe('setItemsDragNDrop', function () {
         it('setItemsDragNDrop', function () {
            dragMove.setItemsDragNDrop('allow');
            assert.equal(dragMove.getItemsDragNDrop(), 'allow');
         });
      });
      describe('setItemsDragNDrop', function () {
         it('setItemsDragNDrop', function () {
            new DragMove({
               itemsDragNDrop: 'allow'
            });
            assert.equal(dragMove.getItemsDragNDrop(), 'allow');
         });
      });
   });
});