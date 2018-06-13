define('Controls-demo/Previewer/Previewer',
   [
      'Core/Control',
      'tmpl!Controls-demo/Previewer/Previewer'
   ],
   function(Control, template) {

      'use strcit';

      var Previewer = Control.extend({
         _template: template
      });

      Previewer.getDefaultOptions = function() {
         return {
            imgRoot: '/'
         };
      };

      return Previewer;
   }
);