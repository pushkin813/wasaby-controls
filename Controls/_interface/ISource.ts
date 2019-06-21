import {ICrudPlus} from 'Types/source';
export interface ISourceOptions {
   source?: ICrudPlus;
   keyProperty: string;
}

/**
 * Interface for components that use data source.
 *
 * @interface Controls/_interface/ISource
 * @public
 * @author Крайнов Д.О.
 */
export default interface ISource {
   readonly '[Controls/_interface/ISource]': boolean;
}
/**
 * @name Controls/_interface/ISource#source
 * @cfg {Types/source:ICrud} Объект реализующий интерфейс {@link Types/source:ICrud}, необходимый для работы с источником данных.
 * Более подробно об источниках данных вы можете почитать <a href='/doc/platform/developmentapl/interface-development/data-sources/'>здесь</a>.
 * @example
 * В приведённом примере для контрола {@link Controls/list:View} в опцию source передаётся {@link Types/source:Memory} источник.
 * Контрол получит данные из источника и выведет их.
 *
 * WML:
 * <pre>
 *    <Controls.list:View source="{{_source}}" keyProperty="key">
 *        <ws:itemTemplate>
 *            <ws:partial template="Controls/list:ItemTemplate">
 *                <ws:contentTemplate>
 *                    <span>{{contentTemplate.itemData.item.title}}</span>
 *                </ws:contentTemplate>
 *            </ws:partial>
 *        </ws:itemTemplate>
 *    </Controls.list:View>
 * </pre>
 *
 * JS:
 * <pre>
 *     import {Memory} from "Types/source";
 *
 *     _source: null,
 *     _beforeMount: function() {
 *         this._source = new Memory({
 *             idProperty: 'key',
 *             data: [
 *                {
 *                   key: '1',
 *                   title: 'Yaroslavl'
 *                },
 *                {
 *                   key: '2',
 *                   title: 'Moscow'
 *                },
 *                {
 *                   key: '3',
 *                   title: 'St-Petersburg'
 *                }
 *             ]
 *          })
 *     }
 * </pre>
 * @see https://wi.sbis.ru/docs/js/Types/source/ICrudPlus/
 * @see https://wi.sbis.ru/docs/js/Types/source/ICrud/
 * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/data-sources/
 */
/*
 * @name Controls/_interface/ISource#source
 * @cfg {Types/source:ICrud} Object that implements {@link Types/source:ICrud} interface for working with data.
 * More information about sources you can read <a href='doc/platform/developmentapl/interface-development/data-sources/'>here</a>.
 * @example
 * The list will be rendered data from _source
 *
 * WML:
 * <pre>
 *    <Controls.list:View source="{{_source}}" keyProperty="key">
 *        <ws:itemTemplate>
 *            <ws:partial template="Controls/list:ItemTemplate">
 *                <ws:contentTemplate>
 *                    <span>{{contentTemplate.itemData.item.title}}</span>
 *                </ws:contentTemplate>
 *            </ws:partial>
 *        </ws:itemTemplate>
 *    </Controls.list:View>
 * </pre>
 *
 * JS:
 * <pre>
 *     import {Memory} from "Types/source";
 *
 *     _source: null,
 *     _beforeMount: function() {
 *         this._source = new Memory({
 *             idProperty: 'key',
 *             data: [
 *                {
 *                   key: '1',
 *                   title: 'Yaroslavl'
 *                },
 *                {
 *                   key: '2',
 *                   title: 'Moscow'
 *                },
 *                {
 *                   key: '3',
 *                   title: 'St-Petersburg'
 *                }
 *             ]
 *          })
 *     }
 * </pre>
 * @see https://wi.sbis.ru/docs/js/Types/source/ICrudPlus/
 * @see https://wi.sbis.ru/docs/js/Types/source/ICrud/
 * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/data-sources/
 */

/**
 * @name Controls/_interface/ISource#keyProperty
 * @cfg {String} Name of the item property that uniquely identifies collection item.
 * @remark For example, the identifier may be the primary key of the record in the database.
 * @example
 * <pre>
 *    <Controls.list:View
 *       source = "{{_source}}"
 *       keyProperty="key">
 *    </Controls.list:View>
 * </pre>
 * <pre>
 *    _source: new Memory({
 *       idProperty: 'key',
 *       data: [
 *       {
 *          key: '1',
 *          title: 'Yaroslavl'
 *       },
 *       {
 *          key: '2',
 *          title: 'Moscow'
 *       },
 *       {
 *          key: '3',
 *          title: 'St-Petersburg'
 *       }
 *       ]
 *    })
 * </pre>
 *
 */
