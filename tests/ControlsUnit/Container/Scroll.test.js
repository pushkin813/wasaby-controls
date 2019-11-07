define(
   [
      'Env/Env',
      'Controls/scroll',
      'wml!ControlsUnit/Container/resources/Content'
   ],
   function(Env, scrollMod, Content) {

      'use strict';

      describe('Controls.Container.Scroll', function() {
         var scroll, result;

         beforeEach(function() {
            scroll = new scrollMod.Container({});

            var templateFn = scroll._template;

            scroll._template = function(inst) {
               inst._options = {
                  content: Content
               };
               var markup = templateFn.call(this, inst);

               markup = markup.replace(/ ?(ws-delegates-tabfocus|ws-creates-context|__config|tabindex|name)=".+?"/g, '');
               markup = markup.replace(/\s+/g, ' ');

               return markup;
            };
            scroll._registeredHeadersIds = [];
            scroll._stickyHeadersIds = {
               top: [],
               bottom: []
            };
            scroll._headersHeight = {
               top: 0,
               bottom: 0
            };
            scroll._children.stickyHeaderShadow = {
               start: sinon.fake()
            };
            scroll._children.content = {
               scrollHeight: 50,
               scrollTop: 10
            };
            scroll._displayState = {
               contentHeight: 0
            }
            scroll._shadowVisiblityMode = {
               top: 'auto',
               bottom: 'auto'
            }
         });

         describe('_shadowVisible', function() {
            [{
               title: "shouldn't display shadow if there are fixed headers",
               shadowPosition: 'top',
               hasFixed: true,
               result: false
            }, {
               title: 'should display shadow if shadowVisibilityMode is equal "visible"',
               shadowVisibilityMode: 'visible',
               result: true
            }, {
               title: 'shouldn\'t display shadow if shadowVisibilityMode is equal "auto" and shadowPosition is equal ""',
               result: false
            }, {
               title: 'shouldn display shadow if shadowVisibilityMode is equal "auto" and shadowPosition is equal "top"',
               shadowPosition: 'top',
               result: true
            }].forEach(function(test) {
               it(test.title, function () {
                  scroll._displayState.shadowPosition = test.shadowPosition || '';
                  scroll._shadowVisiblityMode.top = test.shadowVisibilityMode;
                  scroll._children.stickyController = {
                     hasFixed: function () {
                        return Boolean(test.hasFixed);
                     }
                  };

                  if (test.result) {
                     assert.isTrue(scroll._shadowVisible('top'));
                  } else {
                     assert.isFalse(scroll._shadowVisible('top'));
                  }
               });
            });

            describe('ipad', function() {
               beforeEach(function () {
                  if (typeof window === 'undefined') {
                     Env.detection['test::isMobileIOS'] = true;
                  } else {
                     Env.detection.isMobileIOS = true;
                  }
               });
               afterEach(function () {
                  if (typeof window === 'undefined') {
                     Env.detection['test::isMobileIOS'] = undefined;
                  } else {
                     Env.detection.isMobileIOS = false;
                  }
               });

               it('should display top shadow if scrollTop > 0.', function () {
                  scroll._displayState.shadowPosition = 'top';
                  scroll._children.stickyController = {
                     hasFixed: function () {
                        return false;
                     }
                  };

                  assert.isTrue(scroll._shadowVisible('top'));
               });

               it('should not display top shadow if scrollTop < 0.', function () {
                  scroll._displayState.shadowPosition = 'top';
                  scroll._children.content.scrollTop = -10;
                  scroll._children.stickyController = {
                     hasFixed: function () {
                        return false;
                     }
                  };

                  assert.isFalse(scroll._shadowVisible('top'));
               });
            });
         });

         describe('_updateStickyHeaderContext', function() {
            [{
               title: 'should display shadow if shadowVisibilityMode is "visible"',
               shadowVisible: true,
               shadowVisibilityMode: { top: 'visible', bottom: 'visible' },
               resultShadowPosition: 'topbottom'
            }, {
               title: 'shouldn\'t display shadow if shadowVisibilityMode is "auto" and shadowPosition is ""',
               shadowVisible: true,
               shadowVisibilityMode: { top: 'auto', bottom: 'auto' },
               resultShadowPosition: ''
            }].forEach(function (test) {
               it(test.title, function () {
                  scroll._displayState.shadowPosition = test.shadowPosition || '';
                  scroll._displayState.hasScroll = true;
                  scroll._shadowVisiblityMode = test.shadowVisibilityMode;
                  scroll._stickyHeaderContext = {
                     updateConsumers: function() { }
                  };

                  scroll._updateStickyHeaderContext(test.shadowVisible);
                  assert.strictEqual(scroll._stickyHeaderContext.shadowPosition, test.resultShadowPosition);
               });
            });
         });

         describe('_resizeHandler. Paging buttons.', function() {
            it('Content at the top', function() {
               scroll._pagingState = {};
               scroll._children.content = {
                  scrollTop: 0,
                  scrollHeight: 200,
                  clientHeight: 100
               };

               scroll._resizeHandler();
               assert.deepEqual(scroll._pagingState, {
                  stateUp: 'disabled',
                  stateDown: 'normal'
               });
            });
            it('Content at the middle', function() {
               scroll._pagingState = {};
               scroll._children.content = {
                  scrollTop: 50,
                  scrollHeight: 200,
                  clientHeight: 100
               };

               scroll._resizeHandler();
               assert.deepEqual(scroll._pagingState, {
                  stateUp: 'normal',
                  stateDown: 'normal'
               });
            });
            it('Content at the bottom', function() {
               scroll._pagingState = {};
               scroll._children.content = {
                  scrollTop: 100,
                  scrollHeight: 200,
                  clientHeight: 100
               };

               scroll._resizeHandler();
               assert.deepEqual(scroll._pagingState, {
                  stateUp: 'normal',
                  stateDown: 'disabled'
               });
            });
         });

         describe('_resizeHandler', function() {
            it('should update _displayState if it changed.', function() {
               let oldDisplayState = scroll._displayState;
               scroll._pagingState = {};
               scroll._children.content = {
                  scrollTop: 100,
                  scrollHeight: 200,
                  clientHeight: 100
               };

               scroll._resizeHandler();
               assert.notStrictEqual(scroll._displayState, oldDisplayState);
               oldDisplayState = scroll._displayState;
               scroll._resizeHandler();
               assert.strictEqual(scroll._displayState, oldDisplayState);
            });
         });

         describe('_scrollbarTaken', function() {
            it('Should generate scrollbarTaken event if scrollbar displayed', function() {
               const sandbox = sinon.sandbox.create();
               scroll._displayState = { hasScroll: true };
               sandbox.stub(scroll, '_notify');
               scroll._scrollbarTaken();
               sinon.assert.calledWith(scroll._notify, 'scrollbarTaken');
               sandbox.restore();
            });
            it('Should not generate scrollbarTaken event if scrollbar not displayed', function() {
               const sandbox = sinon.sandbox.create();
               scroll._displayState = { hasScroll: false };
               sandbox.stub(scroll, '_notify');
               scroll._scrollbarTaken();
               sinon.assert.notCalled(scroll._notify);
               sandbox.restore();
            });
         });

         describe('_mouseenterHandler', function() {
            it('Should show scrollbar and generate scrollbarTaken event on mouseenter', function() {
               const sandbox = sinon.sandbox.create();
               scroll._displayState = { hasScroll: true };
               scroll._options.scrollbarVisible = true;
               sandbox.stub(scroll, '_notify');
               scroll._mouseenterHandler();
               sinon.assert.calledWith(scroll._notify, 'scrollbarTaken');
               assert.isTrue(scroll._scrollbarVisibility());
               sandbox.restore();
            });
            it('Should hide scrollbar and generate scrollbarReleased event on mouseleave', function() {
               const sandbox = sinon.sandbox.create();
               scroll._displayState = { hasScroll: false };
               sandbox.stub(scroll, '_notify');
               scroll._mouseenterHandler();
               scroll._mouseleaveHandler();
               sinon.assert.calledWith(scroll._notify, 'scrollbarReleased');
               assert.isFalse(scroll._scrollbarVisibility());
               sandbox.restore();
            });
         });

         describe('_adjustContentMarginsForBlockRender', function() {
            if (!Env.constants.isBrowserPlatform) {
               return;
            }

            it('should not update the context if the height has not changed', function() {
               sinon.stub(window, 'getComputedStyle').returns({ marginTop: 0, marginRight: 0 });
               scroll._styleHideScrollbar = '';
               scroll._stickyHeaderContext = {
                  top: 0,
                  updateConsumers: sinon.fake()
               };
               scroll._adjustContentMarginsForBlockRender();
               sinon.assert.notCalled(scroll._stickyHeaderContext.updateConsumers);
               sinon.restore();
            });
         });

         describe('Template', function() {
            it('Hiding the native scroll', function() {
               result = scroll._template(scroll);

               assert.equal(result, '<div class="controls-Scroll ws-flexbox ws-flex-column">' +
                                       '<div class="controls-Scroll__content controls-BlockLayout__blockGroup controls-Scroll__content_hideNativeScrollbar controls-Scroll__content_hidden">' +
                                          '<div class="controls-Scroll__userContent">test</div>' +
                                       '</div>' +
                                       '<div></div>' +
                                    '</div>');

               scroll._contentStyles = 'margin-right: -15px;';
               result = scroll._template(scroll);

               assert.equal(result, '<div class="controls-Scroll ws-flexbox ws-flex-column">' +
                                       '<div class="controls-Scroll__content controls-BlockLayout__blockGroup controls-Scroll__content_hideNativeScrollbar controls-Scroll__content_scroll" style="margin-right: -15px;">' +
                                          '<div class="controls-Scroll__userContent">test</div>' +
                                       '</div>' +
                                       '<div></div>' +
                                    '</div>');
            });
         });

         describe('_scrollMoveHandler', function() {
            beforeEach(function() {
               scroll._pagingState = {
                  visible: true
               };
            });
            it('up', function() {
               scroll._scrollMoveHandler({}, {
                  position: 'up'
               });
               assert.equal('disabled', scroll._pagingState.stateUp, 'Wrong paging state');
               assert.equal('normal', scroll._pagingState.stateDown, 'Wrong paging state');
            });
            it('down', function() {
               scroll._scrollMoveHandler({}, {
                  position: 'down'
               });
               assert.equal('normal', scroll._pagingState.stateUp, 'Wrong paging state');
               assert.equal('disabled', scroll._pagingState.stateDown, 'Wrong paging state');
            });
            it('middle', function() {
               scroll._scrollMoveHandler({}, {
                  position: 'middle'
               });
               assert.equal('normal', scroll._pagingState.stateUp, 'Wrong paging state');
               assert.equal('normal', scroll._pagingState.stateDown, 'Wrong paging state');
            });

         });

         describe('_fixedHandler', function() {
            it('Should update scroll style when header fixed', function() {
               scroll._fixedHandler(null, 10, 10);
               assert.strictEqual(scroll._scrollbarStyles, 'top:10px; bottom:10px;');
               assert.strictEqual(scroll._displayState.contentHeight, 30);
            });
            it('Should update scroll style when header unfixed', function() {
               scroll._headersHeight = { top: 10, bottom: 20 };
               scroll._fixedHandler(null, 0, 0);
               assert.strictEqual(scroll._scrollbarStyles, 'top:0px; bottom:0px;');
               assert.strictEqual(scroll._displayState.contentHeight, 50);
            });
         });

         describe('Save/restore scroll position.', function() {
            it('Should restore previous scroll position', function() {
               const
                  addedHeight = 100,
                  oldScrollTop = scroll._children.content.scrollTop;
               scroll._saveScrollPosition({stopPropagation: function(){}});
               scroll._children.content.scrollHeight += addedHeight;
               scroll._restoreScrollPosition({stopPropagation: function(){}}, 0, 'up');
               assert.equal(scroll._children.content.scrollTop, oldScrollTop + addedHeight);
            });
         });
      });

      describe('selectedKeysChanged', function() {
         var instance;
         beforeEach(function() {
            instance = new scrollMod.Container();
         })
         it('should forward event', function() {
            var
               notifyCalled = false,
               event = {
                  propagating: function() {
                     return false;
                  }
               };
            instance._notify = function(eventName, eventArgs) {
               assert.equal(eventName, 'selectedKeysChanged');
               assert.deepEqual(eventArgs, ['1', '2', '3']);
               notifyCalled = true;
            };
            instance.selectedKeysChanged(event, '1', '2', '3');
            assert.isTrue(notifyCalled);
         });

         it('should not forward event', function() {
            var
               notifyCalled = false,
               event = {
                  propagating: function() {
                     return true;
                  }
               };
            instance._notify = function() {
               notifyCalled = true;
            };
            instance.selectedKeysChanged(event, '1', '2', '3');
            assert.isFalse(notifyCalled);
         });
      });

      describe('excludedKeysChanged', function() {
         var instance;
         beforeEach(function() {
            instance = new scrollMod.Container();
         })
         it('should forward event', function() {
            var
               notifyCalled = false,
               event = {
                  propagating: function() {
                     return false;
                  }
               };
            instance._notify = function(eventName, eventArgs) {
               assert.equal(eventName, 'excludedKeysChanged');
               assert.deepEqual(eventArgs, ['1', '2', '3']);
               notifyCalled = true;
            };
            instance.excludedKeysChanged(event, '1', '2', '3');
            assert.isTrue(notifyCalled);
         });

         it('should not forward event', function() {
            var
               notifyCalled = false,
               event = {
                  propagating: function() {
                     return true;
                  }
               };
            instance._notify = function() {
               notifyCalled = true;
            };
            instance.excludedKeysChanged(event, '1', '2', '3');
            assert.isFalse(notifyCalled);
         });
      });

      describe('_scrollHandler', function() {
         let scrollContainer = new scrollMod.Container({});
         scrollContainer._children = {
            content: {
               scrollHeight: 200,
               offsetHeight: 100,
               scrollTop: 0
            },
            scrollDetect: {
               start: function(e, scrollTop) {
                  assert.equal(scrollTop, scrollContainer.__desiredScrollTop)
               }
            },
            __desiredScrollTop: 0
         };
         scrollContainer._scrollTop = 0;
         scrollContainer.__desiredScrollTop = 0;
         let scrollEventCallCount = 0;
         scrollContainer._notify = function(event, args) {
            if (event === 'scroll') {
               scrollEventCallCount++;
            }
         };
         it('scrollTop has not changed. scroll should not fire', function() {
            scrollContainer._scrollHandler({});
            assert.equal(scrollEventCallCount, 0);
         });
         it('scrollTop has changed. scroll should fire', function() {
            scrollContainer._children.content.scrollTop = 10;
            scrollContainer.__desiredScrollTop = 10;
            scrollContainer._scrollHandler({});
            assert.equal(scrollEventCallCount, 1);
         });
      });

      it('restores scroll after scrollbar drag end', () => {
         let scrollContainer = new scrollMod.Container({});
         scrollContainer._children = {
            content: {
               scrollHeight: 200,
               offsetHeight: 100,
               scrollTop: 100
            },
            scrollDetect: {
               start: () => null
            }
         };

         // Dragging scrollbar to 0
         scrollContainer._dragging = true;
         scrollContainer._children.content.scrollTop = 0;
         scrollContainer._scrollTop = 0;
         scrollContainer._scrollHandler({});

         // Scroll position is restored from outside
         scrollContainer._children.content.scrollTop = 50;
         scrollContainer._scrollHandler({});

         assert.strictEqual(scrollContainer._scrollTop, 0,
            'scroll top should not change because scroll bar is being dragged');

         // Dragging stops
         scrollContainer._draggingChangedHandler({}, false);

         assert.strictEqual(scrollContainer._scrollTop, 50,
            'restored scroll top value should be applied after drag end');
      });

      it('does not restore scroll after drag end if it was cancelled by dragging', () => {
         let scrollContainer = new scrollMod.Container({});
         scrollContainer._children = {
            content: {
               scrollHeight: 200,
               offsetHeight: 100,
               scrollTop: 100
            },
            scrollDetect: {
               start: () => null
            }
         };

         // Dragging scrollbar to 0
         scrollContainer._dragging = true;
         scrollContainer._children.content.scrollTop = 0;
         scrollContainer._scrollTop = 0;
         scrollContainer._scrollHandler({});

         // Scroll position is restored from outside
         scrollContainer._children.content.scrollTop = 50;
         scrollContainer._scrollHandler({});

         assert.strictEqual(scrollContainer._scrollTop, 0,
            'scroll top should not change because scroll bar is being dragged');

         // Dragging scrollbar to 100
         scrollContainer._children.content.scrollTop = 100;
         scrollContainer._scrollHandler({});
         scrollContainer._scrollTop = 100;

         // Dragging stops
         scrollContainer._draggingChangedHandler({}, false);

         assert.strictEqual(scrollContainer._scrollTop, 100,
            'restored scroll top value should not be applied after drag end, because it was changed by dragging');
      });

      describe('Controls.Container.Shadow', function() {
         var result;
         describe('calcShadowPosition', function() {
            it('Тень сверху', function() {
               result = scrollMod.Container._private.calcShadowPosition(100, 100, 200);
               assert.equal(result, 'top');
            });
            it('Тень снизу', function() {
               result = scrollMod.Container._private.calcShadowPosition(0, 100, 200);
               assert.equal(result, 'bottom');
            });
            it('Should hide bottom shadow if there is less than 1 pixel to the bottom.', function() {
               // Prevent rounding errors in the scale do not equal 100%
               result = scrollMod.Container._private.calcShadowPosition(99.234, 100, 200);
               assert.notInclude(result, 'bottom');
            });
            it('Тень сверху и снизу', function() {
               result = scrollMod.Container._private.calcShadowPosition(50, 100, 200);
               assert.equal(result, 'topbottom');
            });
         });
         describe('getSizes', function() {
            var container = {
               scrollHeight: 200,
               offsetHeight: 100,
               scrollTop: 0
            };

            it('getScrollHeight', function() {
               result = scrollMod.Container._private.getScrollHeight(container);
               assert.equal(result, 200);
            });
            it('getContainerHeight', function() {
               result = scrollMod.Container._private.getContainerHeight(container);
               assert.equal(result, 100);
            });
            it('getScrollTop', function() {
               result = scrollMod.Container._private.getScrollTop({ _topPlaceholderSize: 0 }, container);
               assert.equal(result, 0);
            });
         });
      });
   }
);
