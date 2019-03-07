define(
   [
      'Env/Env',
      'Controls/Input/Render',
      'unit/resources/TemplateUtil',
      'wml!unit/Input/Render/Content',
      'wml!unit/Input/Render/PlaceholderTest'
   ],
   function(Env, Render, TemplateUtil, Content, placeholderTest) {
      'use strict';

      describe('Controls.Input.Render', function() {
         var ctrl;

         beforeEach(function() {
            ctrl = new Render();
         });

         describe('Behavior', function() {
            describe('_getState', function() {
               it('Control in read mode.', function() {
                  ctrl._options.readOnly = true;

                  assert.equal(ctrl._getState(), '_readOnly');
               });
               it('Control in active mode.', function() {
                  ctrl._options.readOnly = false;
                  ctrl._contentActive = true;
                  if (Env.detection.isIE) {
                     assert.equal(ctrl._getState(), '_active');
                  } else {
                     assert.equal(ctrl._getState(), '');
                  }
               });
               it('Control in inactive mode.', function() {
                  ctrl._options.readOnly = false;
                  ctrl._contentActive = false;

                  assert.equal(ctrl._getState(), '');
               });
            });
         });
         describe('Template', function() {
            var template = TemplateUtil.clearTemplate(new Render({})._template);

            beforeEach(function() {
               ctrl._options = {
                  content: Content,
                  size: 'm',
                  fontStyle: 'default',
                  textAlign: 'left',
                  style: 'info',
                  theme: 'default'
               };
            });
            it('In the content template passed the placeholder template', function() {
               ctrl._options.placeholder = 'test placeholder';

               assert.equal(template(ctrl), placeholderTest({}));
            });
         });
      });
   }
);
