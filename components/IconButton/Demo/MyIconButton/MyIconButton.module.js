define('js!SBIS3.Controls.Demo.MyIconButton',
    ['js!SBIS3.CORE.CompoundControl',
     'html!SBIS3.Controls.Demo.MyIconButton',
     'css!SBIS3.Controls.Demo.MyIconButton',
     'js!SBIS3.CONTROLS.IconButton'],
    function(CompoundControl, dotTplFn) {
   /**
    * SBIS3.Controls.Demo.MyIconButton
    * @class SBIS3.Controls.Demo.MyIconButton
    * @extends $ws.proto.CompoundControl
    * @control
    */
   var moduleClass = CompoundControl.extend(/** @lends SBIS3.Controls.Demo.MyIconButton.prototype */{
      _dotTplFn: dotTplFn,
      $protected: {
         _options: {
            
         }
      },
      $constructor: function() {
      },

      init: function() {
         moduleClass.superclass.init.call(this);
         this.getChildControlByName("IconButton").subscribe("onActivated", function() {
            $ws.helpers.question("Действительно хотите в отпуск?"); 
         });
      }
   });
   return moduleClass;
});