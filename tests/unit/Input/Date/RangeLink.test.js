define([
   'Core/core-clone',
   'Core/core-merge',
   'Controls/dateRange',
   'Controls/Date/model/DateRange',
   'unit/Calendar/Utils'
], function(
   cClone,
   cMerge,
   dateRange,
   DateRange,
   calendarTestUtils
) {
   'use strict';

   const options = {
      rangeModel: new DateRange(),
      mask: 'DD.MM.YYYY',
      value: new Date(2018, 0, 1),
      replacer: ' ',
   };

   describe('Controls/Input/Date/RangeLink', function() {
      describe('_openDialog', function() {
         it('should open opener with default options', function() {
            const component = calendarTestUtils.createComponent(dateRange.Selector, options);
            component._children.opener = {
               open: sinon.fake()
            };
            component._openDialog();
            sinon.assert.called(component._children.opener.open);
            sinon.assert.calledWith(component._children.opener.open, sinon.match({ templateOptions: {minQuantum: 'day'} }));
         });

         it('should open dialog with passed dialog options', function() {
            const
               extOptions = {
                  minRange: 'month',
                  captionFormatter: function(){}
               },
               component = calendarTestUtils.createComponent(dateRange.Selector, cMerge(cClone(extOptions), options));
            component._children.opener = {
               open: sinon.fake()
            };
            component._openDialog();
            sinon.assert.calledWith(component._children.opener.open, sinon.match({ templateOptions: {
                  minQuantum: extOptions.minRange,
                  captionFormatter: extOptions.captionFormatter
               }}));
         });
      });

      describe('_onResult', function() {
         it('should generate valueChangedEvent and close opener', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(dateRange.Selector, options),
               startValue = new Date(2018, 11, 10),
               endValue = new Date(2018, 11, 13);

            component._children.opener = {
               close: sinon.fake()
            };
            sandbox.stub(component, '_notify');

            component._onResult(startValue, endValue);

            sinon.assert.calledWith(component._notify, 'startValueChanged');
            sinon.assert.calledWith(component._notify, 'endValueChanged');
            sinon.assert.called(component._children.opener.close);
            sandbox.restore();
         });
      });

      describe('_onResultWS3', function() {
         it('should generate valueChangedEvent and close opener', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(dateRange.Selector, options),
               startValue = new Date(2018, 11, 10),
               endValue = new Date(2018, 11, 13);

            component._children.opener = {
               close: sinon.fake()
            };
            sandbox.stub(component, '_notify');

            component._onResultWS3(null, startValue, endValue);

            sinon.assert.calledWith(component._notify, 'startValueChanged');
            sinon.assert.calledWith(component._notify, 'endValueChanged');
            sinon.assert.called(component._children.opener.close);
            sandbox.restore();
         });
      });

      describe('_rangeChangedHandler', function() {
         it('should set range on model', function() {
            const
               sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(dateRange.Selector, options),
               startValue = new Date(2018, 11, 10),
               endValue = new Date(2018, 11, 13);

            sandbox.stub(component, '_notify');

            component._rangeChangedHandler(null, startValue, endValue);

            sinon.assert.calledWith(component._notify, 'startValueChanged');
            sinon.assert.calledWith(component._notify, 'endValueChanged');
            sinon.assert.calledWith(component._notify, 'rangeChanged');
            sinon.assert.callCount(component._notify, 3);
            sandbox.restore();
         });
      });
   });
});
