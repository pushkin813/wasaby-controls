/**
 * @author Коновалова А.И.
 */
define('js!SBIS3.CONTROLS.Demo.SelectorDataFieldLink', 
   [
      'js!SBIS3.CONTROLS.SelectorController', 
      'html!SBIS3.CONTROLS.Demo.SelectorDataFieldLink',
      'js!WS.Data/Source/Memory',
      'js!SBIS3.CONTROLS.TreeDataGridView', 
      'js!SBIS3.CONTROLS.SelectorWrapper', 
      'js!SBIS3.CONTROLS.Button'
   ], function(
      SelectorController, 
      dotTplFn,
      MemorySource
   ) {
   var SelectorDataFieldLink = SelectorController.extend({
      _dotTplFn: dotTplFn,

      init: function() {
         SelectorDataFieldLink.superclass.init.apply(this, arguments);
         
         var memorySource = new MemorySource({
            data: [
               {'книга': 1, 'автор': 'Сергей Лукьяненко', 'Раздел': null, 'Раздел@': true},
               {'книга': 1.0, 'автор': 'Сергей Лукьяненко', 'произведение': 'Джамп', 'Раздел': '1', 'Раздел@': null},
               {'книга': 1.1, 'автор': 'Сергей Лукьяненко', 'произведение': 'Рыцари сорока островов', 'Раздел': '1', 'Раздел@': null},
               {'книга': 1.3, 'автор': 'Сергей Лукьяненко', 'произведение': 'Лабиринт отражений', 'Раздел': '1', 'Раздел@': null},
               {'книга': 1.4, 'автор': 'Сергей Лукьяненко', 'произведение': 'Фальшивые зеркала', 'Раздел': '1', 'Раздел@': null},
               {'книга': 1.5, 'автор': 'Сергей Лукьяненко', 'произведение': 'Прозрачные витражи', 'Раздел': '1', 'Раздел@': null},
               {'книга': 1.6, 'автор': 'Сергей Лукьяненко', 'произведение': 'Спектр', 'Раздел': '1', 'Раздел@': null},
               {'книга': 2, 'автор': 'Аркадий и Борис Стругацкие', 'Раздел': null, 'Раздел@': true},
               {'книга': 2.0, 'автор': 'Аркадий и Борис Стругацкие', 'произведение': 'Жук в муравейнике', 'Раздел': '2', 'Раздел@': null},
               {'книга': 2.1, 'автор': 'Аркадий и Борис Стругацкие', 'произведение': 'Улитка на склоне', 'Раздел': '2', 'Раздел@': null},
               {'книга': 2.2, 'автор': 'Аркадий и Борис Стругацкие', 'произведение': 'Трудно быть богом', 'Раздел': '2', 'Раздел@': null},
               {'книга': 3, 'автор': 'Стивен Кинг', 'Раздел': null, 'Раздел@': true},
               {'книга': 3.0, 'автор': 'Стивен Кинг', 'произведение': 'Лангольеры', 'Раздел': '3', 'Раздел@': null},
               {'книга': 3.1, 'автор': 'Стивен Кинг', 'произведение': 'Мобильник', 'Раздел': '3', 'Раздел@': null},
               {'книга': 3.2, 'автор': 'Стивен Кинг', 'произведение': 'Сияние', 'Раздел': '3', 'Раздел@': null},
               {'книга': 4, 'автор': 'Андрей Белянин', 'произведение': 'Меч без имени', 'Раздел': null, 'Раздел@': null},
               {'книга': 5, 'автор': 'Джордж Мартин', 'произведение': 'Песнь льда и пламени', 'Раздел': null, 'Раздел@': null},
               {'книга': 6, 'автор': 'Евгений Гуляковский', 'произведение': 'Обратная сторона времени', 'Раздел': null, 'Раздел@': null},
               {'книга': 7, 'автор': 'Сергей Волков', 'произведение': 'Стража последнего рубежа', 'Раздел': null, 'Раздел@': null},
               {'книга': 8, 'автор': 'Сергей Бадей', 'произведение': 'Свободный полет', 'Раздел': null, 'Раздел@': null},
               {'книга': 9, 'автор': 'Андрей Ливадный', 'произведение': 'Грань реальности', 'Раздел': null, 'Раздел@': null},
               {'книга': 10, 'автор': 'Джордж Оруэлл', 'произведение': '1984', 'Раздел': null, 'Раздел@': null}
            ],
            idProperty: 'книга'
         });
         
             var mydataGrid = this.getChildControlByName('DataGrid');
             mydataGrid.setDataSource(memorySource);
         
      }
   });

   return SelectorDataFieldLink;
});
