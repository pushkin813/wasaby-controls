/**
 * Created by am.gerasimov on 27.06.2017.
 */
/**
 * Created by cheremushkin iv on 19.01.2015.
 */
define('js!SBIS3.CONTROLS.Utils.SearchMixin', [], function() {
      
      /**
       * Утилита для поиска
       * @author Герасимов Александр Максимович
       */

      var prepText = function (text) {
            return (text || '').replace(/^([<|>][\s])|([\s][<|>][\s])|([\s][<|>])$/g, '');
         },
         hasStartCharacter = function(startCharacter) {
            return startCharacter !== null;
         };
      
      return {
         prepareText: prepText,
         
         needSearch: function(text, startCharacter, force) {
            var textTrimLength = prepText(text).trim().length;
            
            return hasStartCharacter(startCharacter) && textTrimLength >= startCharacter || (force && textTrimLength);
         },
         
         needReset: function(text, startCharacter, force) {
            var startCharacter = hasStartCharacter(startCharacter),
                textTrimLength = prepText(text).trim().length;
            
            return startCharacter || (!startCharacter && !textTrimLength) || force
         }
      };
      
   });