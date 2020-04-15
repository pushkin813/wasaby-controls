import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/ColumnSeparator/ColumnSeparator';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: unknown[] = getCountriesStats().getColumnsWithFixedWidths().splice(2, 3);

    private _rowSeparator1: boolean = false;
    private _columnSeparator1: boolean = false;

    private _rowSeparator2: boolean = true;
    private _columnSeparator2: boolean = false;

    private _rowSeparator3: boolean = true;
    private _columnSeparator3: boolean = false;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData().splice(0, 5)
        });
    }
}
