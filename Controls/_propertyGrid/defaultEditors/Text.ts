import template = require('wml!Controls/_propertyGrid/defaultEditors/Text');
import StringEditor = require('Controls/_propertyGrid/defaultEditors/String');

/**
 * Редактор для многотрочного типа данных.
 * @class Controls/_propertyGrid/defaultEditors/Text
 * @extends Core/Control
 * @mixes Controls/_propertyGrid/IEditor
 * @control
 * @public
 * @author Герасимов А.М.
 */

/*
 * Editor for multiline string type.
 * @class Controls/_propertyGrid/defaultEditors/Text
 * @extends Core/Control
 * @mixes Controls/_propertyGrid/IEditor
 * @control
 * @public
 * @author Герасимов А.М.
 */

// @ts-ignore
class TextEditor extends StringEditor {
    protected _template: Function = template;
}

export = TextEditor;
