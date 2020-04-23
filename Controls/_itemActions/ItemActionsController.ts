import {TItemKey, ISwipeConfig, ANIMATION_STATE} from 'Controls/display';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Memory} from 'Types/source';
import {Control} from 'UI/Base';
import {isEqual} from 'Types/object';
import {
    IItemActionsCollection,
    TItemActionVisibilityCallback,
    IItemActionsItem,
    IItemActionsTemplateOptions,
    IItemActionsContainer,
    IDropdownTemplateOptions,
    IDropdownConfig,
    IItemAction
} from './interafce/IItemActions';

// FIXME: https://online.sbis.ru/opendoc.html?guid=380045b2-1cd8-4868-8c3f-545cc5c1732f
const showType = {
    MENU: 0,
    MENU_TOOLBAR: 1,
    TOOLBAR: 2
};

const ITEM_ACTION_ICON_CLASS = 'controls-itemActionsV__action_icon icon-size';

const DEFAULT_ACTION_ALIGNMENT = 'horizontal';

const DEFAULT_ACTION_CAPTION_POSITION = 'none';

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
     * Свойство элемента коллекции, по которому из элемента можно достать настроенные для него операции
     */
    itemActionsProperty?: string;
    /**
     * Callback для определения видимости операции
     */
    visibilityCallback?: TItemActionVisibilityCallback;
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
export class ItemActionsController {
    private _collection: IItemActionsCollection;
    private _commonItemActions: IItemAction[];
    private _itemActionsProperty: string;
    private _visibilityCallback: TItemActionVisibilityCallback;

    update(options: IItemActionsControllerOptions): void {
        if (!isEqual(this._commonItemActions, options.itemActions) ||
            this._itemActionsProperty !== options.itemActionsProperty ||
            this._visibilityCallback !== options.visibilityCallback
        ) {
            this._collection = options.collection;
            this._commonItemActions = options.itemActions;
            this._itemActionsProperty = options.itemActionsProperty;
            this._visibilityCallback = options.visibilityCallback || ((action: IItemAction, item: unknown) => true);
            this._collection.setActionsAssigned(false);
        }
        if (!this._collection.areActionsAssigned()) {
            this._assignActions();
            this._calculateActionsTemplateConfig({
                itemActionsPosition: options.itemActionsPosition,
                style: options.style,
                actionAlignment: options.actionAlignment || DEFAULT_ACTION_ALIGNMENT,
                actionCaptionPosition: options.actionCaptionPosition || DEFAULT_ACTION_CAPTION_POSITION,
                itemActionsClass: options.itemActionsClass
            });
        }
    }

    /**
     * Обновляет операции с записью элемента коллекции по его ключу
     * @param key TItemKey
     */
    updateActionsForItem(key: TItemKey): void {
        const item = this._collection.getItemBySourceKey(key);
        if (item) {
            const itemActions = this._collectActionsForItem(item);
            ItemActionsController._setItemActions(item, this._wrapActionsInContainer(itemActions));
            this._collection.nextVersion();
        }
    }

    /**
     * Устанавливает флаг активности элементу коллекции по его ключу
     * @param collection Коллекция элементов, содержащих операции с записью
     * @param key Ключ элемента коллекции, для которого нужно обновить операции с записью
     */
    setActiveItem(
        collection: IItemActionsCollection,
        key: TItemKey
    ): void {
        const oldActiveItem = this.getActiveItem();
        const newActiveItem = this._collection.getItemBySourceKey(key);

        if (oldActiveItem) {
            oldActiveItem.setActive(false);
        }
        if (newActiveItem) {
            newActiveItem.setActive(true);
        }

        this._collection.nextVersion();
    }

    /**
     * Активирует Swipe для меню операций с записью
     * @param collection Коллекция элементов, содержащих операции с записью
     * @param itemKey Ключ элемента коллекции, для которого выполняется действие
     * @param actionsContainerHeight высота контейнера для отображения операций с записью
     */
    activateSwipe(
        collection: IItemActionsCollection,
        itemKey: TItemKey,
        actionsContainerHeight: number
    ): void {
        this._setSwipeItem(this._collection, itemKey);
        this.setActiveItem(this._collection, itemKey);

        if (this._collection.getActionsTemplateConfig().itemActionsPosition !== 'outside') {
            this._updateSwipeConfig(actionsContainerHeight);
        }

        this._collection.setSwipeAnimation(ANIMATION_STATE.OPEN);
        this._collection.nextVersion();
    }

    /**
     * Деактивирует Swipe для меню операций с записью
     * @param collection Коллекция элементов, содержащих операции с записью
     */
    deactivateSwipe(collection: IItemActionsCollection): void {
        this._setSwipeItem(this._collection, null);
        this.setActiveItem(this._collection, null);
        this._collection.setSwipeConfig(null);
        this._collection.nextVersion();
    }

    /**
     * Получает текущий активный элемент коллекции
     */
    getActiveItem(): IItemActionsItem {
        return this._collection.find((item) => item.isActive());
    }

    /**
     * Получает последний swiped элемент
     * @param collection Коллекция элементов, содержащих операции с записью
     */
    getSwipeItem(collection: IItemActionsCollection): IItemActionsItem {
        return this._collection.find((item) => item.isSwiped());
    }

    /**
     * Метод, который должен отработать после закрытия меню
     * @private
     */
    afterCloseActionsMenu(): void {
        this.setActiveItem(this._collection, null);
        this.deactivateSwipe(this._collection);
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
    ): IDropdownConfig {
        const item = this._collection.getItemBySourceKey(itemKey);
        if (!item) {
            return;
        }

        const hasParentAction = parentAction !== null && parentAction !== undefined;
        const menuActions = hasParentAction
            ? this._getChildActions(item, parentAction.id)
            : this._getMenuActions(item);

        if (!menuActions || menuActions.length === 0) {
            return;
        }

        // there was a fake target before, check if it is needed
        const menuTarget = isContextMenu ? null : this._getFakeMenuTarget(clickEvent.target as HTMLElement);
        const menuSource = new Memory({
            data: menuActions,
            keyProperty: 'id'
        });
        const headConfig = hasParentAction ? {
            caption: parentAction.title,
            icon: parentAction.icon
        } : null;
        // Не реализовано в модели
        // const contextMenuConfig = this._collection.getContextMenuConfig();
        // ...contextMenuConfig,
        const menuConfig: IDropdownTemplateOptions = {
            source: menuSource,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'parent@',
            dropdownClassName: 'controls-itemActionsV__popup',
            closeButtonVisibility: true,
            root: parentAction && parentAction.id,
            showHeader: hasParentAction,
            headConfig
        };
        return {
            opener,
            template: 'Controls/menu:Popup',
            actionOnScroll: 'close',
            target: menuTarget,
            templateOptions: menuConfig,
            closeOnOutsideClick: true,
            targetPoint: {
                vertical: 'top',
                horizontal: 'right'
            },
            direction: {
                horizontal: isContextMenu ? 'right' : 'left'
            },
            className: 'controls-DropdownList__margin-head controls-ItemActions__popup__list',
            nativeEvent: isContextMenu ? clickEvent.nativeEvent : null,
            autofocus: false
        };
    }

    // Оставил на случай, если придётся откатиться к варианту работы с popup из Render
    // resetItemActionsConfig() {
    //     // afterCloseActionsMenu();
    //     this.setActiveItem(this._collection, null);
    //     this.deactivateSwipe(this._collection);
    //     this._collection.setActionsMenuConfig(null);
    //     this._collection.nextVersion();
    // }

    // Оставил на случай, если придётся откатиться к варианту работы с popup из Render
    // updateItemActionsConfig(contents: Model,
    //                         action: IItemAction,
    //                         clickEvent: SyntheticEvent<MouseEvent>,
    //                         isContextMenu: boolean): void {
    //     const itemKey = contents?.getKey();
    //     const menuConfig = this.prepareActionsMenuConfig(itemKey, clickEvent, action, opener, isContextMenu);
    //     this.setActiveItem(this._collection, itemKey);
    //     this._collection.setActionsMenuConfig(menuConfig);
    //     this._collection.nextVersion();
    // }

    /**
     * Получает список операций с записью для указанного элемента коллекции,
     * дочерних по отношению операции, для которой передан строковый ключ
     * @param item
     * @param parentActionKey
     */
    private _getChildActions(
        item: IItemActionsItem,
        parentActionKey: IItemAction
    ): IItemAction[] {
        const actions = item.getActions();
        const allActions = actions && actions.all;
        if (allActions) {
            return allActions.filter((action) => action.parent === parentActionKey);
        }
        return [];
    }

    /**
     * Вычисляет операции над записью для каждого элемента коллекции
     */
    private _assignActions(): void {
        const supportsEventRaising = typeof this._collection.setEventRaising === 'function';
        let hasChanges = false;

        if (supportsEventRaising) {
            this._collection.setEventRaising(false, true);
        }

        this._collection.each((item) => {
            if (!item.isActive()) {
                const actionsForItem = this._collectActionsForItem(item);
                const itemChanged = ItemActionsController._setItemActions(item, this._wrapActionsInContainer(actionsForItem));
                hasChanges = hasChanges || itemChanged;
            }
        });

        if (supportsEventRaising) {
            this._collection.setEventRaising(true, true);
        }

        this._collection.setActionsAssigned(true);

        if (hasChanges) {
            this._collection.nextVersion();
        }
    }

    /**
     * Получает список операций с записью для указанного элемента коллекции
     * @param item
     */
    private _getMenuActions(item: IItemActionsItem): IItemAction[] {
        const actions = item.getActions();
        return (
            actions &&
            actions.all &&
            actions.all.filter((action) => action.showType !== showType.TOOLBAR)
        );
    }

    /**
     * Устанавливает текущий swiped элемент
     * @param collection Коллекция элементов, содержащих операции с записью
     * @param key Ключ элемента коллекции, на котором был выполнен swipe
     */
    private _setSwipeItem(
        collection: IItemActionsCollection,
        key: TItemKey
    ): void {
        const oldSwipeItem = this.getSwipeItem(this._collection);
        const newSwipeItem = this._collection.getItemBySourceKey(key);

        if (oldSwipeItem) {
            oldSwipeItem.setSwiped(false);
        }
        if (newSwipeItem) {
            newSwipeItem.setSwiped(true);
        }

        this._collection.nextVersion();
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
        const editingConfig = this._collection.getEditingConfig();
        this._collection.setActionsTemplateConfig({
            toolbarVisibility: editingConfig?.toolbarVisibility,
            style: options.style,
            size: editingConfig ? 's' : 'm',
            itemActionsPosition: options.itemActionsPosition,
            actionAlignment: options.actionAlignment,
            actionCaptionPosition: options.actionCaptionPosition,
            itemActionsClass: options.itemActionsClass
        });
    }

    /**
     * Набирает операции с записью для указанного элемента коллекции
     * @param item IItemActionsItem
     * @private
     */
    private _collectActionsForItem(item: IItemActionsItem): IItemAction[] {
        const itemActions: IItemAction[] = this._itemActionsProperty
                ? item.getContents().get(this._itemActionsProperty)
                : this._commonItemActions;
        const fixedActions = itemActions.map(ItemActionsController._fixActionIcon);
        return fixedActions.filter((action) =>
            this._visibilityCallback(action, item.getContents())
        );
    }

    private _updateSwipeConfig(actionsContainerHeight: number): void {
        const item = this.getSwipeItem(this._collection);
        if (!item) {
            return;
        }

        const actions = item.getActions().all;
        const actionsTemplateConfig = this._collection.getActionsTemplateConfig();

        let swipeConfig = ItemActionsController._calculateSwipeConfig(
            actions,
            actionsTemplateConfig.actionAlignment,
            actionsContainerHeight,
            actionsTemplateConfig.actionCaptionPosition
        );

        if (
            actionsTemplateConfig.actionAlignment !== 'horizontal' &&
            ItemActionsController._needsHorizontalMeasurement(swipeConfig)
        ) {
            swipeConfig = ItemActionsController._calculateSwipeConfig(
                actions,
                'horizontal',
                actionsContainerHeight,
                actionsTemplateConfig.actionCaptionPosition
            );
        }

        ItemActionsController._setItemActions(item, swipeConfig.itemActions);

        if (swipeConfig.twoColumns) {
            const visibleActions = swipeConfig.itemActions.showed;
            swipeConfig.twoColumnsActions = [
                [visibleActions[0], visibleActions[1]],
                [visibleActions[2], visibleActions[3]]
            ];
        }

        this._collection.setSwipeConfig(swipeConfig);
    }

    private _wrapActionsInContainer(
        actions: IItemAction[]
    ): IItemActionsContainer {
        let showed = actions;
        if (showed.length > 1) {
            showed = showed.filter(
                (action) =>
                    action.showType === showType.TOOLBAR ||
                    action.showType === showType.MENU_TOOLBAR
            );
            if (this._isMenuButtonRequired(actions)) {
                showed.push({
                    icon: `icon-ExpandDown ${ITEM_ACTION_ICON_CLASS}`,
                    style: 'secondary',
                    iconStyle: 'secondary',
                    _isMenu: true
                });
            }
        }
        return {
            all: actions,
            showed
        };
    }

    private _isMenuButtonRequired(actions: IItemAction[]): boolean {
        return actions.some(
            (action) =>
                !action.parent &&
                (!action.showType ||
                    action.showType === showType.MENU ||
                    action.showType === showType.MENU_TOOLBAR)
        );
    }

    private static _setItemActions(
        item: IItemActionsItem,
        actions: IItemActionsContainer
    ): boolean {
        const oldActions = item.getActions();
        if (!oldActions || (actions && !ItemActionsController._isMatchingActions(oldActions, actions))) {
            item.setActions(actions);
            return true;
        }
        return false;
    }

    private static _isMatchingActions(
        oldContainer: IItemActionsContainer,
        newContainer: IItemActionsContainer
    ): boolean {
        return (
            ItemActionsController._isMatchingActionLists(oldContainer.all, newContainer.all) &&
            ItemActionsController._isMatchingActionLists(oldContainer.showed, newContainer.showed)
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

    private static _fixActionIcon(action: IItemAction): IItemAction {
        if (!action.icon || action.icon.includes(ITEM_ACTION_ICON_CLASS)) {
            return action;
        }
        return {
            ...action,
            icon: `${action.icon} ${ITEM_ACTION_ICON_CLASS}`
        };
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