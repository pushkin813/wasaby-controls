import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_grid/ScrollWrapperTemplate';
import Scrollbar from 'Controls/_scroll/Scroll/Scrollbar';
import {SyntheticEvent} from 'Vdom/Vdom';
import {isFullGridSupport} from './utils/GridLayoutUtil';
import {Logger} from 'UI/Utils';

export interface IHorizontalScrollWrapperOptions extends IControlOptions {
    positionChangeHandler: (e: SyntheticEvent<null>, position: number) => void;
    topOffset: number;
    scrollWidth: number;
    listModel: IGridViewModel;
    gridSupport: 'no' | 'full' | 'partial';

    /**
     * Стиль background в случае sticky header
     */
    backgroundStyle: string;
}

export default class HorizontalScrollWrapper extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    private _gridStyle: string = null;
    protected _localPositionHandler: IHorizontalScrollWrapperOptions['positionChangeHandler'];
    private _needNotifyResize: boolean = false;
    private _shouldSetMarginTop: boolean = false;

    protected _beforeMount(options: IHorizontalScrollWrapperOptions): void {
        this._localPositionHandler = options.positionChangeHandler;
        this._gridStyle = this._getGridStyles(options);
        const listModel = options.listModel;
        const hasHeaderOrResults = listModel.getHeader() || (listModel.getResultsPosition() && listModel.getResults());
        this._shouldSetMarginTop = !!(options.gridSupport === 'full' && hasHeaderOrResults);
        if (!hasHeaderOrResults) {
            Logger.warn("ScrollWrapper: Don't use columnScroll without header or results rows");
        }
    }

    protected _afterRender(): void {
        if (this._needNotifyResize) {
            (this._children.columnScrollbar as Scrollbar).recalcSizes();
            this._needNotifyResize = false;
        }
    }

    _beforeUpdate(options: IHorizontalScrollWrapperOptions): void {
        const newStyle = this._getGridStyles(options);
        if (this._gridStyle !== newStyle) {
            this._gridStyle = newStyle;
            this._needNotifyResize = true;
        }
    }

    private _getGridStyles(options: IHorizontalScrollWrapperOptions): string {
        if (!isFullGridSupport()) {
            return '';
        }
        let style = '';
        let offset = 0;
        let lastCellOffset = 1;
        const listModel = options.listModel;
        // Учёт колонки с чекбоксами для выбора записей
        if (listModel.getMultiSelectVisibility() !== 'hidden') {
            offset += 1;
        }
        // Учёт колонки с лесенкой
        if (listModel.shouldAddStickyLadderCell()) {
            offset += 1;
        }
        if (listModel._shouldAddActionsCell()) {
            lastCellOffset += 1;
        }
        const stickyColumnsCount = listModel.getStickyColumnsCount();
        const columns = listModel.getColumns();
        // В случае !multiHeader добавление offset к grid-column-end не нужно, т.к. оно уже учтено в maxEndColumn
        style += `grid-column: ${stickyColumnsCount + 1 + offset} / ${(columns.length + lastCellOffset) + offset};`;
        style += `width: ${options.scrollWidth}px`;
        return style;
    }
}
