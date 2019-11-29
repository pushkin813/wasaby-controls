import Control = require('Core/Control');
import BreadCrumbsUtil from './Utils';
import getWidthUtil = require('Controls/Utils/getWidth');
import {ItemsUtil} from 'Controls/list';
import FontLoadUtil = require('Controls/Utils/FontLoadUtil');
import tmplNotify = require('Controls/Utils/tmplNotify');
import applyHighlighter = require('Controls/Utils/applyHighlighter');
import template = require('wml!Controls/_breadcrumbs/HeadingPath/HeadingPath');
import backButtonTemplate = require('wml!Controls/_breadcrumbs/HeadingPath/Back');
import Common from './HeadingPath/Common';
import 'Controls/heading';

var _private = {
   DrawItems: function (self, options) {
        self._backButtonCaption = ItemsUtil.getPropertyValue(options.items[options.items.length - 1], self._options.displayProperty);

        //containerWidth is equal to 0, if path is inside hidden node. (for example switchableArea)
        if (options.items.length > 1) {
            self._breadCrumbsItems = options.items.slice(0, options.items.length - 1);
            BreadCrumbsUtil.DrawBreadCrumbs(self, self._breadCrumbsItems);
            self._breadCrumbsClass = 'controls-BreadCrumbsPath__breadCrumbs_short';

        } else {
            self._visibleItems = null;
            self._breadCrumbsItems = null;
            self._backButtonClass = '';
            self._breadCrumbsClass = '';
        }
        self._viewUpdated = true;
    }
};

/**
 * Хлебные крошки с кнопкой "Назад".
 * <a href="/materials/demo-ws4-breadcrumbs">Демо-пример</a>.
 *
 * @class Controls/_breadcrumbs/HeadingPath
 * @extends Core/Control
 * @mixes Controls/interface/IBreadCrumbs
 * @mixes Controls/interface/IHighlighter
 * @control
 * @public
 * @author Авраменко А.С.
 *
 * @demo Controls-demo/BreadCrumbs/PathPG
 */

/*
 * Breadcrumbs with back button.
 * <a href="/materials/demo-ws4-breadcrumbs">Demo</a>.
 *
 * @class Controls/_breadcrumbs/HeadingPath
 * @extends Core/Control
 * @mixes Controls/interface/IBreadCrumbs
 * @mixes Controls/interface/IHighlighter
 * @control
 * @public
 * @author Авраменко А.С.
 *
 * @demo Controls-demo/BreadCrumbs/PathPG
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#backButtonStyle
 * @cfg {String} Стиль отображения кнопки "Назад".
 * @variant primary
 * @variant secondary
 * @default secondary
 * @see Controls/_heading/Back#style
 */

/*
 * @name Controls/_breadcrumbs/HeadingPath#backButtonStyle
 * @cfg {String} Back heading display style.
 * @variant primary
 * @variant secondary
 * @default secondary
 * @see Controls/_heading/Back#style
 */

/**
 * @event Controls/_breadcrumbs/HeadingPath#arrowActivated Происходит при клике на кнопку "Просмотр записи".
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 */

/*
 * @event Controls/_breadcrumbs/HeadingPath#arrowActivated Happens after clicking the button "View Model".
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#showActionButton
 * @cfg {Boolean} Определяет, должна ли отображаться стрелка рядом с кнопкой "Назад".
 * @default
 * true
 */

/*
 * @name Controls/_breadcrumbs/HeadingPath#showActionButton
 * @cfg {Boolean} Determines whether the arrow near "back" button should be shown.
 * @default
 * true
 */

/**
 * @name Controls/_breadcrumbs/HeadingPath#afterBackButtonTemplate
 * @cfg {Function|string} Шаблон, который расположен между кнопкой назад и хлебными крошками
 * @example
 * <pre>
 *    <Controls.breadcrumbs:HeadingPath
 *          items="{{_items}}"
 *          parentProperty="parent"
 *          keyProperty="id"
 *          on:itemClick="_onItemClick()">
 *       <ws:afterBackButtonTemplate>
 *          <h3>Custom content</h3>
 *       </ws:afterBackButtonTemplate>
 *    </Controls.breadcrumbs:HeadingPath>
 * </pre>
 */

var BreadCrumbsPath = Control.extend({
    _template: template,
    _backButtonCaption: '',
    _visibleItems: null,
    _breadCrumbsItems: null,
    _backButtonClass: '',
    _breadCrumbsClass: '',
    _viewUpdated: false,

    _afterMount: function () {
        if (this._options.items && this._options.items.length > 0) {
            FontLoadUtil.waitForFontLoad('controls-BreadCrumbsView__crumbMeasurer').addCallback(function () {
                FontLoadUtil.waitForFontLoad('controls-BreadCrumbsPath__backButtonMeasurer').addCallback(function () {
                    _private.DrawItems(this, this._options);
                }.bind(this));
            }.bind(this));
        }
    },

    _notifyHandler: tmplNotify,
    _applyHighlighter: applyHighlighter,
    _getRootModel: Common.getRootModel,

    _onBackButtonClick: function (e: Event) {
        Common.onBackButtonClick.call(this, e);
    },
    _onHomeClick: function () {
       /**
        * TODO: _options.root is actually current root, so it's wrong to use it. For now, we can take root from the first item. Revert this commit after:
        * https://online.sbis.ru/opendoc.html?guid=93986788-48e1-48df-9595-be9d8fb99e81
        */
       this._notify('itemClick', [this._getRootModel(this._options.items[0].get(this._options.parentProperty), this._options.keyProperty)]);
    },

   _getCounterCaption: function(items) {
      return items[items.length - 1].get('counterCaption');
   }
});

BreadCrumbsPath.getDefaultOptions = function () {
    return {
        displayProperty: 'title',
        root: null,
        backButtonStyle: 'secondary',
        showActionButton: true
    };
};

BreadCrumbsPath._theme = ['Controls/crumbs', 'Controls/heading'];
BreadCrumbsPath._styles = ['Controls/Utils/FontLoadUtil'];
BreadCrumbsPath._private = _private;

export default BreadCrumbsPath;
