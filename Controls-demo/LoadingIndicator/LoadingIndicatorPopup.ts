import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/LoadingIndicator/LoadingIndicatorPopup');

class LoadingIndicatorPopup extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    static _theme: string[] = ['Controls/Classes'];
    protected _load(): void {
        this._children.dialog.open();
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default LoadingIndicatorPopup;
