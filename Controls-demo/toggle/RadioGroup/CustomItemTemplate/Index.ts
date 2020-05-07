import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from "Types/source";
import Template = require('wml!Controls-demo/toggle/RadioGroup/CustomItemTemplate/Template');
import itemTemplate = require('wml!Controls-demo/toggle/RadioGroup/CustomItemTemplate/resources/SingleItemTemplate');

class CustomItemTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _itemTemplate: TemplateFunction = itemTemplate;
    protected _selectedKey: string = '1';
    protected _selectedKey2: string = '1';
    protected _source: Memory;
    protected _displayProperty: string = 'caption';

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            displayProperty: 'caption',
            data: [{
                id: '1',
                title: 'State1',
                caption: 'Additional caption1'
            }, {
                id: '2',
                title: 'State2',
                caption: 'Additional caption2',
                templateTwo: 'wml!Controls-demo/toggle/RadioGroup/CustomItemTemplate/resources/SingleItemTemplate'
            }, {
                id: '3',
                title: 'State3',
                caption: 'Additional caption3'
            }]
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default CustomItemTemplate;
