import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Decorator/Number/UseGrouping/UseGrouping');

class UseGrouping extends Control<IControlOptions> {
    protected _value = '12345.67890';

    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default UseGrouping;
