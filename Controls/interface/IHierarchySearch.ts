/**
 * Интерфейс для контролов, реализующих поиск в иерархических списках.
 *
 * @interface Controls/interface/IHierarchySearch
 * @public
 * @author Герасимов Александр Максимович
 */
interface IHierarchySearch {
    readonly _options: {
        /**
         * @name Controls/interface/ISearch#searchMode
         * @cfg {String} Режим поиска в иерархическом списке.
         * @variant root Поиск происходит в корне
         * @variant current Поиск происходит в текущем резделе
         * @default root
         * @example
         * В приведённом примере поиск будет происходить в корне.
         *
         * JS:
         * <pre>
         *      import {HierarchicalMemory} from 'Types/source';
         *
         *      _source: null,
         *      _beforeMount: function() {
         *          this._source = new HierarchicalMemory({
         *              //hierarchy data
         *          })
         *      }
         * </pre>
         *
         * WML:
         * <pre>
         *    <Layout.Browser parentProperty='Раздел' searchMode='root' searchParam='city' source='_source'>
         *        <ws:search>
         *            <Controls.search:Input/>
         *        </ws:search>
         *        <ws:content>
         *            <Controls.explorer:View>
         *                ...
         *            </Controls.explorer:View>
         *        <ws:content>
         *    </Layout.Browser>
         * </pre>
         */
        searchMode: string;
    };
}

export default IHierarchySearch;
