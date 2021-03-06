import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/EmptyList/Default/Default"
import {Memory} from "Types/source"


export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: []
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
