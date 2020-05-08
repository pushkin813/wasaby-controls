import {Control} from 'UI/Base';
import {Memory} from 'Types/source';
import {isEqual} from 'Types/object';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import {TItemKey, ISwipeConfig, ANIMATION_STATE} from 'Controls/display';
import {
    IItemActionsCollection,
    TItemActionVisibilityCallback,
    IItemActionsItem,
    IItemActionsTemplateOptions,
    IItemActionsContainer,
    IMenuTemplateOptions,
    IMenuConfig,
    TItemActionShowType,
    IItemAction
} from './interface/IItemActions';
import {Utils} from './Utils';

const DEFAULT_ACTION_ALIGNMENT = 'horizontal';

const DEFAULT_ACTION_CAPTION_POSITION = 'none';

const DEFAULT_ACTION_POSITION = 'inside';

const DEFAULT_ACTION_SIZE = 'm';

export interface IItemActionsControllerOptions {
    /**
     * Коллекция элементов, содержащих операции с записью
     */
    collection: IItemActionsCollection;
    /**
     * Действия с записью
     */
    itemActions: IItemAction[];
    /**
     * Размер иконок операций с записью
     * варианты 's'|'m'
     */
    iconSize: string;
    /**
     * @param theme Название текущей темы
     */
    theme: string;
    /**
     * Свойство элемента коллекции, по которому из элемента можно достать настроенные для него операции
     */
    itemActionsProperty?: string;
    /**
     * Callback для определения видимости операции
     */
    visibilityCallback?: TItemActionVisibilityCallback;
    /**
     * Должна ли быть видна панель с кнопками для редактирования
     */
    editingToolbarVisibility?: boolean;
    itemActionsPosition?: string;
    style?: string;
    itemActionsClass?: string;
    actionAlignment?: string;
    actionCaptionPosition?: 'right'|'bottom'|'none';
}

/**
 * Контроллер, управляющий состоянием ItemActions в коллекции
 * @Author Пуханов В, Аверкиев П.А
 */
export class Controller {
    private _collection: IItemActionsCollection;
    private _commonItemActions: IItemAction[];
    private _itemActionsProperty: string;
    private _visibilityCallback: TItemActionVisibilityCallback;
    private _theme: string;

    /**
     * Метод инициализации и обновления параметров.
     * Для старой модели listViewModel возвращает массив id изменённых значений
     * TODO Когда мы перестанем использовать старую listViewModel,
     *  необходимо будет вычистить return методов update() и _assignActions(). Эти методы будут void
     * @param options
     */
    update(options: IItemActionsControllerOptions): Array<number | string> {
        let result: Array<number | string> = [];
        this._theme = options.theme;
        if (!options.itemActions ||
            !isEqual(this._commonItemActions, options.itemActions) ||
            this._itemActionsProperty !== options.itemActionsProperty ||
            this._visibilityCallback !== options.visibilityCallback
        ) {
            this._collection = options.collection;
            this._commonItemActions = options.itemActions;
            this._itemActionsProperty = options.itemActionsProperty;
            this._visibilityCallback = options.visibilityCallback || ((action: IItemAction, item: unknown) => true);
            // this._collection.setActionsAssigned(false);
        }
        // Возможно, стоит проверять версию модели, если она меняется при раскрытии веток дерева
        // !this._collection.isActionsAssigned() &&
        if (this._commonItemActions || this._itemActionsProperty) {
            result = this._assignActions();
        }
        this._calculateActionsTemplateConfig({
            itemActionsPosition: options.itemActionsPosition || DEFAULT_ACTION_POSITION,
            style: options.style,
            size: options.iconSize || DEFAULT_ACTION_SIZE,
            toolbarVisibility: options.editingToolbarVisibility,
            actionAlignment: options.actionAlignment || DEFAULT_ACTION_ALIGNMENT,
            actionCaptionPosition: options.actionCaptionPosition || DEFAULT_ACTION_CAPTION_POSITION,
            itemActionsClass: options.itemActionsClass
        });
        return result;
    }

    /**
     * Активирует Swipe для меню операций с записью
     * @param itemKey Ключ элемента коллекции, для которого выполняется действие
     * @param actionsContainerHeight высота контейнера для отображения операций с записью
     */
    activateSwipe(itemKey: TItemKey, actionsContainerHeight: number): void {
        this._setSwipeItem(itemKey);
        const item = this._collection.getItemBySourceKey(itemKey);
        this._collection.setActiveItem(item);

        if (this._collection.getActionsTemplateConfig().itemActionsPosition !== 'outside') {
            this._updateSwipeConfig(actionsContainerHeight);
        }

        this._collection.setSwipeAnimation(ANIMATION_STATE.OPEN);
    }

    /**
     * Деактивирует Swipe для меню операций с записью
     */
    deactivateSwipe(): void {
        this._setSwipeItem(null);
        this._collection.setActiveItem(null);
        this._collection.setSwipeConfig(null);
    }

    /**
     * Получает последний swiped элемент
     */
    getSwipeItem(): IItemActionsItem {
        return this._collection.find((item) => item.isSwiped());
    }

    /**
     * Собирает конфиг выпадающего меню операций
     * @param itemKey Ключ элемента коллекции, для которого выполняется действие
     * @param clickEvent событие клика
     * @param parentAction Родительская операция с записью
     * @param opener: контрол или элемент - опенер для работы системы автофокусов
     * @param isContextMenu Флаг, указывающий на то, что расчёты производятся для контекстного меню
     */
    prepareActionsMenuConfig(
        itemKey: TItemKey,
        clickEvent: SyntheticEvent<MouseEvent>,
        parentAction: IItemAction,
        opener: Element | Control<object, unknown>,
        isContextMenu: boolean
    ): IMenuConfig {
        const item = this._collection.getItemBySourceKey(itemKey);
        if (!item) {
            return;
        }

        const menuActions = this._getMenuActions(item, parentAction);

        if (!menuActions || menuActions.length === 0) {
            return;
        }

        // there was a fake target before, check if it is needed
        const target = isContextMenu ? null : this._getFakeMenuTarget(clickEvent.target as HTMLElement);
        const source = new Memory({
            data: menuActions,
            keyProperty: 'id'
        });
        const showHeader = parentAction !== null && parentAction !== undefined && !parentAction._isMenu;
        const headConfig = showHeader ? {
            caption: parentAction.title,
            icon: parentAction.icon
        } : null;
        // Не реализовано в модели
        // const contextMenuConfig = this._collection.getContextMenuConfig();
        // ...contextMenuConfig,
        const templateOptions: IMenuTemplateOptions = {
            source,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'parent@',
            dropdownClassName: 'controls-itemActionsV__popup',
            closeButtonVisibility: true,
            root: parentAction && parentAction.id,
            showHeader,
            headConfig
        };
        return {
            opener,
            template: 'Controls/menu:Popup',
            actionOnScroll: 'close',
            target,
            templateOptions,
            closeOnOutsideClick: true,
            targetPoint: {
                vertical: 'top',
                horizontal: 'right'
            },
            direction: {
                horizontal: isContextMenu ? 'right' : 'left'
            },
            className: `controls-DropdownList__margin-head controls-ItemActions__popup__list_theme-${this._theme}`,
            nativeEvent: isContextMenu ? clickEvent.nativeEvent : null,
            autofocus: false
        };
    }

    /**
     * Вычисляет операции над записью для каждого элемента коллекции
     * Для старой модели listViewModel возвращает массив id изменённых значений
     * TODO Когда мы перестанем использовать старую listViewModel,
     *  необходимо будет вычистить return методов update() и _assignActions(). Эти методы будут void
     * @private
     */
    private _assignActions(): Array<number | string> {
        const supportsEventRaising = typeof this._collection.setEventRaising === 'function';
        let hasChanges = false;
        const changedItemsIds: Array<number | string> = [];

        if (supportsEventRaising) {
            this._collection.setEventRaising(false, true);
        }

        this._collection.each((item) => {
            if (!item.isActive() && !item['[Controls/_display/GroupItem]']) {
                let contents = item.getContents();
                if (item['[Controls/_display/BreadcrumbsItem]']) {
                    contents = contents[contents.length - 1];
                }
                const actionsForItem = this._collectActionsForContents(contents);
                const itemChanged = Controller._setItemActions(item, this._wrapActionsInContainer(actionsForItem));
                hasChanges = hasChanges || itemChanged;
                if (itemChanged) {
                    changedItemsIds.push(contents.getKey());
                }
            }
        });

        if (supportsEventRaising) {
            this._collection.setEventRaising(true, true);
        }

        this._collection.setActionsAssigned(true);

        if (hasChanges) {
            this._collection.nextVersion();
        }

        return changedItemsIds;
    }

    /**
     * Получает список операций с записью для указанного элемента коллекции,
     * отфильтрованных по признаку "Должны отображаться в подменю".
     * Если указан parentAction, то операции дополнительно фильтруются по признаку
     * "дочерние по отношению к указанной операции".
     * Если у parentAction отсутствует id (напр, кнопка "Показать меню" ("Шеврон")),
     * будут показаны все элементы не-первого уровня, вне зависимости от того, какой у них родитель.
     * @param item
     * @param parentAction
     */
    private _getMenuActions(item: IItemActionsItem, parentAction: IItemAction): IItemAction[] {
        const actions = item.getActions();
        const allActions = actions && actions.all;
        if (allActions) {
            return allActions.filter((action) => (
                action.showType !== TItemActionShowType.TOOLBAR &&
                (parentAction && !!parentAction.id ? action.parent === parentAction.id : true)
            ));
        }
        return [];
    }

    /**
     * Устанавливает текущий swiped элемент
     * @param key Ключ элемента коллекции, на котором был выполнен swipe
     */
    private _setSwipeItem(key: TItemKey): void {
        const oldSwipeItem = this.getSwipeItem();
        const newSwipeItem = this._collection.getItemBySourceKey(key);

        if (oldSwipeItem) {
            oldSwipeItem.setSwiped(false);
        }
        if (newSwipeItem) {
            newSwipeItem.setSwiped(true);
        }
    }

    /**
     * Запоминает измерения для HTML элемента, к которому привязано выпадающее меню
     * @param realTarget
     */
    private _getFakeMenuTarget(realTarget: HTMLElement): {
        getBoundingClientRect(): ClientRect;
    } {
        const rect = realTarget.getBoundingClientRect();
        return {
            getBoundingClientRect(): ClientRect {
                return rect;
            }
        };
    }

    /**
     * Вычисляет конфигурацию, которая используется в качестве scope у itemActionsTemplate
     */
    private _calculateActionsTemplateConfig(options: IItemActionsTemplateOptions): void {
        this._collection.setActionsTemplateConfig({
            toolbarVisibility: options.toolbarVisibility,
            style: options.style,
            size: options.size,
            itemActionsPosition: options.itemActionsPosition,
            actionAlignment: options.actionAlignment,
            actionCaptionPosition: options.actionCaptionPosition,
            itemActionsClass: options.itemActionsClass
        });
    }

    /**
     * Набирает операции с записью для указанного элемента коллекции
     * @param contents Types/entity:Model
     * @private
     */
    private _collectActionsForContents(contents: Model): IItemAction[] {
        const itemActions: IItemAction[] = this._itemActionsProperty
                ? contents.get(this._itemActionsProperty)
                : this._commonItemActions;
        const fixedActions = itemActions.map((action) => (
            Controller._fixActionIcon(Controller._fixActionStyle(action), this._theme)
        ));
        return fixedActions.filter((action) =>
            this._visibilityCallback(action, contents)
        );
    }

    private _updateSwipeConfig(actionsContainerHeight: number): void {
        const item = this.getSwipeItem();
        if (!item) {
            return;
        }

        const actions = item.getActions().all;
        const actionsTemplateConfig = this._collection.getActionsTemplateConfig();

        let swipeConfig = Controller._calculateSwipeConfig(
            actions,
            actionsTemplateConfig.actionAlignment,
            actionsContainerHeight,
            actionsTemplateConfig.actionCaptionPosition
        );

        if (
            actionsTemplateConfig.actionAlignment !== 'horizontal' &&
            Controller._needsHorizontalMeasurement(swipeConfig)
        ) {
            swipeConfig = Controller._calculateSwipeConfig(
                actions,
                'horizontal',
                actionsContainerHeight,
                actionsTemplateConfig.actionCaptionPosition
            );
        }

        Controller._setItemActions(item, swipeConfig.itemActions);

        if (swipeConfig.twoColumns) {
            const visibleActions = swipeConfig.itemActions.showed;
            swipeConfig.twoColumnsActions = [
                [visibleActions[0], visibleActions[1]],
                [visibleActions[2], visibleActions[3]]
            ];
        }

        this._collection.setSwipeConfig(swipeConfig);
    }

    /**
     * Ищет операции, которые должны быть показаны только в тулбаре или в тулбаре и в меню и возвращает
     * массив {showed, all}
     * @param actions
     * @private
     */
    private _wrapActionsInContainer(
        actions: IItemAction[]
    ): IItemActionsContainer {
        const showed = actions.filter(
            (action) =>
                !action.parent &&
                (action.showType === TItemActionShowType.TOOLBAR ||
                action.showType === TItemActionShowType.MENU_TOOLBAR)
        );
        if (this._isMenuButtonRequired(actions)) {
            showed.push({
                id: null,
                icon: `icon-ExpandDown ${Controller.resolveItemActionClass(this._theme)}`,
                style: 'secondary',
                iconStyle: 'secondary',
                _isMenu: true
            });
        }
        return {
            all: actions,
            showed
        };
    }

    /**
     * Ищет операции, которые должны отображаться только в меню или в меню и тулбаре,
     * и у которых нет родительской операции
     * @param actions
     * @private
     */
    private _isMenuButtonRequired(actions: IItemAction[]): boolean {
        return actions.some(
            (action) =>
                !action.parent &&
                (!action.showType ||
                    action.showType === TItemActionShowType.MENU ||
                    action.showType === TItemActionShowType.MENU_TOOLBAR)
        );
    }

    private static _setItemActions(
        item: IItemActionsItem,
        actions: IItemActionsContainer
    ): boolean {
        const oldActions = item.getActions();
        if (!oldActions || (actions && !Controller._isMatchingActions(oldActions, actions))) {
            item.setActions(actions, true);
            return true;
        }
        return false;
    }

    private static _isMatchingActions(
        oldContainer: IItemActionsContainer,
        newContainer: IItemActionsContainer
    ): boolean {
        return (
            Controller._isMatchingActionLists(oldContainer.all, newContainer.all) &&
            Controller._isMatchingActionLists(oldContainer.showed, newContainer.showed)
        );
    }

    private static _calculateSwipeConfig(
        actions: IItemAction[],
        actionAlignment: string,
        actionsContainerHeight: number,
        actionCaptionPosition: 'right'|'bottom'|'none'
    ): ISwipeConfig {
        // FIXME: https://online.sbis.ru/opendoc.html?guid=380045b2-1cd8-4868-8c3f-545cc5c1732f
        // TODO Move these measurers to listRender, maybe rewrite them
        const {SwipeVerticalMeasurer, SwipeHorizontalMeasurer} = require('Controls/list');

        const measurer =
            actionAlignment === 'vertical'
                ? SwipeVerticalMeasurer.default
                : SwipeHorizontalMeasurer.default;
        const config: ISwipeConfig = measurer.getSwipeConfig(
            actions,
            actionsContainerHeight,
            actionCaptionPosition
        );
        config.needTitle = measurer.needTitle;
        config.needIcon = measurer.needIcon;
        return config;
    }

    private static _needsHorizontalMeasurement(config: ISwipeConfig): boolean {
        const actions = config.itemActions;
        return (
            actions &&
            actions.showed?.length === 1 &&
            actions.all?.length > 1
        );
    }

    /**
     * Добавляет совместимость старых и новых названий стилей через Utils.getStyle()
     * @param action
     * @private
     */
    private static _fixActionStyle(action: IItemAction): IItemAction {
        action.style = Utils.getStyle(action.style, 'itemActions/Controller');
        action.iconStyle = Utils.getStyle(action.iconStyle, 'itemActions/Controller');
        return action;
    }

    // todo скорее всего, переедет в шаблон
    private static _fixActionIcon(action: IItemAction, theme: string): IItemAction {
        if (!action.icon || action.icon.includes(Controller.resolveItemActionClass(theme))) {
            return action;
        }
        return {
            ...action,
            icon: `${action.icon} ${Controller.resolveItemActionClass(theme)}`
        };
    }

    // todo скорее всего, переедет в шаблон
    private static resolveItemActionClass(theme: string): string {
        return `controls-itemActionsV__action_icon_theme-${theme} icon-size_theme-${theme}`;
    }

    private static _isMatchingActionLists(
        aActions: IItemAction[],
        bActions: IItemAction[]
    ): boolean {
        if (!aActions || !bActions) {
            return false;
        }
        const length = aActions.length;
        if (length !== bActions.length) {
            return false;
        }
        for (let i = 0; i < length; i++) {
            if (
                aActions[i].id !== bActions[i].id ||
                aActions[i].icon !== bActions[i].icon
            ) {
                return false;
            }
        }
        return true;
    }
}