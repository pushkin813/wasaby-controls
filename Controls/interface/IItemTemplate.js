/* eslint-disable */
define('Controls/interface/IItemTemplate', [
], function() {

   /**
    * Интерфейс для контролов с возможностью настройки отображения элементов.
    *
    * @interface Controls/interface/IItemTemplate
    * @public
    * @author Авраменко А.С.
    */

   /*
    * Interface for components with customizable display of elements.
    *
    * @interface Controls/interface/IItemTemplate
    * @public
    * @author Авраменко А.С.
    */

   /**
    * @name Controls/interface/IItemTemplate#itemTemplate
    * @cfg {String|Function} Шаблон отображения элемента.
    * @default undefined
    * @demo Controls-demo/list_new/ItemTemplate/CustomContent/Index
    * @remark
    * Позволяет установить прикладной шаблон отображения элемента (**именно шаблон**, а не контрол!). При установке прикладного шаблона **ОБЯЗАТЕЛЕН** вызов базового шаблона {@link Controls/list:ItemTemplate}.
    * 
    * По умолчанию Controls/list:ItemTemplate отображает значение поля, имя которого задано в опции {@link Controls/list:ItemTemplate#displayProperty displayProperty}. Об этом следует помнить при настройке источника данных контрола. Также шаблон Controls/list:ItemTemplate поддерживает {@link Controls/list:ItemTemplate параметры}, с помощью которых можно изменить отображение элемента.
    * 
    * В разделе "Примеры" показано как с помощью директивы {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial} задать прикладной шаблон Controls/list:ItemTemplate. Также в опцию itemTemplate можно передавать и более сложные шаблоны, которые содержат иные директивы, например {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-if ws:if}. В этом случае каждая ветка вычисления шаблона должна заканчиваться директивой ws:partial, которая встраивает Controls/list:ItemTemplate.
    * 
    * Дополнительно о работе с шаблоном вы можете прочитать в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/templates/item/ руководстве разработчика}.
    * @example
    * <pre class="brush: html">
    * <Controls.list:View>
    *    <ws:itemTemplate>
    *       <ws:partial template="Controls/list:ItemTemplate" marker="{{false}}" scope="{{itemTemplate}}"> 
    *          <ws:contentTemplate>
    *             {{contentTemplate.itemData.item.title}}
    *          </ws:contentTemplate>
    *       </ws:partial>
    *    </ws:itemTemplate>
    * </Controls.list:View>
    * </pre>
    * @see Controls/interface/IItemTemplate#itemTemplateProperty
    * @see Controls/list:ItemTemplate
    */

   /*
    * @name Controls/interface/IItemTemplate#itemTemplate
    * @cfg {Function} Template for item render.
    * @demo Controls-demo/list_new/ItemTemplate/CustomContent/Index
    * @remark
    * Base itemTemplate for Controls.list:View: "Controls/list:ItemTemplate".
    * Inside the template scope, object itemData is available, allowing you to access the render data (for example: item, key, etc.).
    * Base itemTemplate supports these parameters:
    * <ul>
    *    <li>contentTemplate {Function} - Template for render item content.</li>
    *    <li>highlightOnHover {Boolean} - Enable highlighting item by hover.</li>
    *    <li>clickable {Boolean} - Cursor type (false - default or true - pointer) By default: true.</li>
    * </ul>
    * @example
    * Using custom template for item rendering:
    * <pre>
    *    <Controls.list:View>
    *       <ws:itemTemplate>
    *          <ws:partial template="Controls/list:ItemTemplate" scope="{{itemTemplate}}"> 
    *             <ws:contentTemplate>
    *                <span>{{contentTemplate.itemData.item.description}}</span>
    *             </ws:contentTemplate>
    *          </ws:partial>
    *       </ws:itemTemplate>
    *    </Controls.list:View>
    * </pre>
    */

   /**
    * @name Controls/interface/IItemTemplate#itemTemplateProperty
    * @cfg {String|undefined} Имя поля элемента, где содержится имя шаблона отображения элемента. С помощью этой настройки отдельным элементам можно задать собственный шаблон отображения.
    * @demo Controls-demo/list_new/ItemTemplate/ItemTemplateProperty/Index
    * @remark
    * Если не задано значение в опции itemTemplateProperty или в свойстве элемента, то используется шаблон из {@link Controls/interface/IItemTemplate#itemTemplate itemTemplate}.
    * @see Controls/interface/IItemTemplate#itemTemplate
    */

   /*
    * @name Controls/interface/IItemTemplate#itemTemplateProperty
    * @cfg {String} Name of the item property that contains template for item render. If not set, itemTemplate is used instead.
    * @demo Controls-demo/list_new/ItemTemplate/ItemTemplateProperty/Index
    */
});
