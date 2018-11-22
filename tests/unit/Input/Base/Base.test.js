define(
   [
      'Core/constants',
      'Core/core-instance',
      'Controls/Input/Base',
      'tests/resources/ProxyCall',
      'tests/resources/TemplateUtil',
      'Core/vdom/Synchronizer/resources/SyntheticEvent'
   ],
   function(constants, instance, Base, ProxyCall, TemplateUtil, SyntheticEvent) {
      'use strict';

      describe('Controls.Input.Base', function() {
         var ctrl, calls;

         beforeEach(function() {
            calls = [];
            ctrl = new Base();
            ctrl._children.input = {
               focus: function() {},
               setSelectionRange: function(start, end) {
                  this.selectionStart = start;
                  this.selectionEnd = end;
               }
            };
         });

         it('getDefault', function() {
            Base.getDefaultTypes();
            Base.getDefaultOptions();
         });
         it('Public method paste.', function() {
            ctrl._notify = ProxyCall.apply(ctrl._notify, 'notify', calls, true);

            ctrl._beforeMount({
               value: ''
            });
            ctrl.paste('test paste');

            assert.deepEqual(calls, [{
               name: 'notify',
               arguments: ['valueChanged', ['test paste', 'test paste']]
            }]);
         });
         it('The model belongs to the "Controls/Input/Base/ViewModel" class.', function() {
            ctrl._beforeMount({
               value: ''
            });

            assert.isTrue(instance.instanceOfModule(ctrl._viewModel, 'Controls/Input/Base/ViewModel'));
         });
         describe('Notify parents when a value changes, if the browser automatically filled the field.', function() {
            beforeEach(function() {
               ctrl._options.readOnly = false;
               ctrl._notify = ProxyCall.apply(ctrl._notify, 'notify', calls, true);
            });
            it('No.', function() {
               ctrl._children.input.value = '';

               ctrl._beforeMount({
                  value: ''
               });
               ctrl._afterMount();

               assert.deepEqual(calls.length, 0);
            });
            it('Yes.', function() {
               ctrl._children.input.value = 'test value';

               ctrl._beforeMount({
                  value: ''
               });
               ctrl._afterMount();

               assert.deepEqual(calls, [{
                  name: 'notify',
                  arguments: ['valueChanged', ['test value', 'test value']]
               }]);
            });
         });
         describe('The _fieldName property value equal the name option value when mounting the control, if it defined.', function() {
            it('No.', function() {
               ctrl._beforeMount({
                  value: ''
               });

               assert.equal(ctrl._fieldName, 'input');
            });
            it('Yes.', function() {
               ctrl._beforeMount({
                  name: 'test name',
                  value: ''
               });

               assert.equal(ctrl._fieldName, 'test name');
            });
         });
         describe('Changing options in model.', function() {
            beforeEach(function() {
               ctrl._getViewModelOptions = function(options) {
                  return {
                     option: options.optionModel
                  };
               };
               ctrl._beforeMount({
                  value: '',
                  optionModel: 'test'
               });
               ctrl._viewModel = ProxyCall.set(ctrl._viewModel, ['options', 'value'], calls, true);
            });
            it('No change.', function() {
               ctrl._beforeUpdate({
                  value: '',
                  optionModel: 'test'
               });

               assert.equal(calls.length, 0);
            });

            it('There are changes.', function() {
               ctrl._beforeUpdate({
                  value: 'test value',
                  optionModel: 'test option'
               });

               assert.deepEqual(calls, [{
                  name: 'options',
                  value: {
                     option: 'test option'
                  }
               }, {
                  name: 'value',
                  value: 'test value'
               }]);
            });
         });
         describe('MouseEnter', function() {
            describe('Tooltip', function() {
               beforeEach(function() {
                  ctrl._beforeMount({
                     value: 'test value'
                  });
               });
               it('The value fits in the field.', function() {
                  ctrl._hasHorizontalScroll = function() {
                     return false;
                  };

                  ctrl._mouseEnterHandler();

                  assert.equal(ctrl._tooltip, '');
               });
               it('The value no fits in the field.', function() {
                  ctrl._hasHorizontalScroll = function() {
                     return true;
                  };

                  ctrl._mouseEnterHandler();

                  assert.equal(ctrl._tooltip, 'test value');
               });
            });
         });
         describe('User input.', function() {
            it('The field does not change, but the model changes.', function() {
               ctrl._beforeMount({
                  value: ''
               });
               ctrl._children.input.value = 'text';
               ctrl._children.input.selectionStart = 4;
               ctrl._children.input.selectionEnd = 4;
               ctrl._inputHandler(new SyntheticEvent({}));

               assert.equal(ctrl._children.input.value, '');
               assert.equal(ctrl._children.input.selectionStart, 0);
               assert.equal(ctrl._children.input.selectionEnd, 0);
               assert.equal(ctrl._viewModel.value, 'text');
               assert.deepEqual(ctrl._viewModel.selection, {
                  start: 4,
                  end: 4
               });
            });
         });
         describe('Synchronize the field with the model.', function() {
            describe('Scroll left in the field, depending on the cursor position.', function() {
               beforeEach(function() {
                  ctrl._getTextWidth = function(value) {
                     return 10 * value.length;
                  };
                  ctrl._getActiveElement = function() {
                     return ctrl._children.input;
                  };
                  ctrl._beforeMount({

                     // length = 20, width = 200;
                     value: '01234567890123456789'
                  });
                  ctrl._children.input.clientWidth = 100;
               });
               it('The cursor is behind the left edge.', function() {
                  ctrl._children.input.scrollLeft = 100;

                  ctrl._children.input.selectionStart = 10;
                  ctrl._children.input.selectionEnd = 10;
                  ctrl._clickHandler();
                  ctrl._children.input.value = '0123456780123456789';
                  ctrl._children.input.selectionStart = 9;
                  ctrl._children.input.selectionEnd = 9;
                  ctrl._inputHandler(new SyntheticEvent({}));
                  ctrl._template(ctrl);

                  assert.equal(ctrl._children.input.scrollLeft, 41);
               });
               it('The cursor between the edges.', function() {
                  ctrl._children.input.scrollLeft = 50;

                  ctrl._children.input.selectionStart = 10;
                  ctrl._children.input.selectionEnd = 10;
                  ctrl._clickHandler();
                  ctrl._children.input.value = '0123456789t0123456789';
                  ctrl._children.input.selectionStart = 11;
                  ctrl._children.input.selectionEnd = 11;
                  ctrl._inputHandler(new SyntheticEvent({}));
                  ctrl._template(ctrl);

                  assert.equal(ctrl._children.input.scrollLeft, 50);
               });
               it('The cursor is behind the right edge.', function() {
                  ctrl._children.input.scrollLeft = 0;

                  ctrl._children.input.selectionStart = 10;
                  ctrl._children.input.selectionEnd = 10;
                  ctrl._clickHandler();
                  ctrl._children.input.value = '0123456789a0123456789';
                  ctrl._children.input.selectionStart = 11;
                  ctrl._children.input.selectionEnd = 11;
                  ctrl._inputHandler(new SyntheticEvent({}));
                  ctrl._template(ctrl);

                  assert.equal(ctrl._children.input.scrollLeft, 61);
               });
            });
         });
         describe('Change event', function() {
            it('Notification when input is complete.', function() {
               ctrl._notify = ProxyCall.apply(ctrl._notify, 'notify', calls, true);

               ctrl._beforeMount({
                  value: 'test value'
               });
               ctrl._changeHandler();

               assert.deepEqual(calls, [{
                  name: 'notify',
                  arguments: ['inputCompleted', ['test value', 'test value']]
               }]);
            });
         });
         describe('Click event', function() {
            it('The selection is saved to the model.', function() {
               ctrl._beforeMount({
                  value: '1234567890'
               });

               ctrl._viewModel = ProxyCall.set(ctrl._viewModel, ['selection'], calls, true);

               ctrl._children.input.selectionStart = 10;
               ctrl._children.input.selectionEnd = 10;
               ctrl._clickHandler();

               assert.deepEqual(calls, [{
                  name: 'selection',
                  value: {
                     start: 10,
                     end: 10
                  }
               }]);
            });
         });
         describe('Select event', function() {
            beforeEach(function() {
               ctrl._beforeMount({
                  value: '1234567890'
               });
               ctrl._viewModel = ProxyCall.set(ctrl._viewModel, ['selection'], calls, true);
            });
            it('The selection is saved to the model after user select.', function() {
               ctrl._children.input.selectionStart = 0;
               ctrl._children.input.selectionEnd = 10;
               ctrl._selectHandler();

               assert.deepEqual(calls, [{
                  name: 'selection',
                  value: {
                     start: 0,
                     end: 10
                  }
               }]);
            });
            it('The selection is not saved to the model after script actions', function() {
               ctrl._children.input.value = '';
               ctrl._children.input.selectionStart = 0;
               ctrl._children.input.selectionEnd = 0;
               ctrl._inputHandler(new SyntheticEvent({}));
               ctrl._selectHandler();

               assert.equal(calls.length, 0);
            });
         });
         describe('Focus out event', function() {
            it('Scroll to start.', function() {
               ctrl._children.input.scrollLeft = 100;
               ctrl._focusOutHandler();

               assert.equal(ctrl._children.input.scrollLeft, 0);
            });
         });
         describe('Click event on the placeholder.', function() {
            beforeEach(function() {
               ctrl._children.input.focus = ProxyCall.apply(ctrl._notify, 'focus', calls, true);
            });
            it('Focus the field through a script in ie browser version 10.', function() {
               ctrl._ieVersion = 10;

               ctrl._placeholderClickHandler();

               assert.deepEqual(calls, [{
                  name: 'focus',
                  arguments: []
               }]);
            });
            it('Not focus the field through a script in ie browser version 12.', function() {
               ctrl._ieVersion = 12;

               ctrl._placeholderClickHandler();

               assert.equal(calls.length, 0);
            });
         });
         describe('KeyUp', function() {
            beforeEach(function() {
               ctrl._beforeMount({
                  value: '',
                  optionModel: 'test'
               });
               ctrl._viewModel = ProxyCall.set(ctrl._viewModel, ['selection'], calls, true);
               ctrl._children.input.selectionStart = 10;
               ctrl._children.input.selectionEnd = 10;
            });
            it('Pressing the up arrow', function() {
               ctrl._keyUpHandler(new SyntheticEvent({
                  keyCode: constants.key.up
               }));

               assert.deepEqual(calls, [{
                  name: 'selection',
                  value: {
                     start: 10,
                     end: 10
                  }
               }]);
            });
            it('Pressing the right arrow', function() {
               ctrl._keyUpHandler(new SyntheticEvent({
                  keyCode: constants.key.right
               }));

               assert.deepEqual(calls, [{
                  name: 'selection',
                  value: {
                     start: 10,
                     end: 10
                  }
               }]);
            });
            it('Pressing the down arrow', function() {
               ctrl._keyUpHandler(new SyntheticEvent({
                  keyCode: constants.key.down
               }));

               assert.deepEqual(calls, [{
                  name: 'selection',
                  value: {
                     start: 10,
                     end: 10
                  }
               }]);
            });
            it('Pressing the left arrow', function() {
               ctrl._keyUpHandler(new SyntheticEvent({
                  keyCode: constants.key.left
               }));

               assert.deepEqual(calls, [{
                  name: 'selection',
                  value: {
                     start: 10,
                     end: 10
                  }
               }]);
            });
            it('Pressing the key end', function() {
               ctrl._keyUpHandler(new SyntheticEvent({
                  keyCode: constants.key.end
               }));

               assert.deepEqual(calls, [{
                  name: 'selection',
                  value: {
                     start: 10,
                     end: 10
                  }
               }]);
            });
            it('Pressing the key home', function() {
               ctrl._keyUpHandler(new SyntheticEvent({
                  keyCode: constants.key.home
               }));

               assert.deepEqual(calls, [{
                  name: 'selection',
                  value: {
                     start: 10,
                     end: 10
                  }
               }]);
            });
            it('Pressing the key which no changed selection', function() {
               ctrl._keyUpHandler(new SyntheticEvent({
                  keyCode: constants.key.b
               }));

               assert.equal(calls.length, 0);
            });
         });
      });
   }
);
