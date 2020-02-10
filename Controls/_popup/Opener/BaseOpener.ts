import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
import { IOpener, IBaseOpener, IBasePopupOptions } from 'Controls/_popup/interface/IBaseOpener';
import * as CoreMerge from 'Core/core-merge';
import * as cInstance from 'Core/core-instance';
import * as randomId from 'Core/helpers/Number/randomId';
import * as Deferred from 'Core/Deferred';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {parse as parserLib, load} from 'Core/library';
import {Logger} from 'UI/Utils';
import { DefaultOpenerFinder } from 'UI/Focus';
import * as isEmpty from 'Core/helpers/Object/isEmpty';
import rk = require('i18n!Controls');
import Template = require('wml!Controls/_popup/Opener/BaseOpener');

/**
 * Base Popup opener
 * @category Popup
 * @class Controls/_popup/Opener/BaseOpener
 * @mixes Controls/_popup/interface/IBaseOpener
 * @control
 * @private
 * @author Красильников А.С.
 */

export interface ILoadDependencies {
    template: Control;
    controller: Control;
}

export interface IBaseOpenerOptions extends IBasePopupOptions, IControlOptions {
    id?: string;
    closePopupBeforeUnmount?: boolean;
}

const OPEN_POPUP_DEBOUNCE_DELAY: number = 10;
let ManagerWrapperCreatingPromise; // TODO: Compatible

class BaseOpener<TBaseOpenerOptions extends IBaseOpenerOptions = {}>
    extends Control<TBaseOpenerOptions> implements IOpener, IBaseOpener {

    readonly '[Controls/_popup/interface/IBaseOpener]': boolean;
    protected _template: TemplateFunction = Template;
    private _actionOnScroll: string = 'none';
    private _popupId: string = '';
    private _indicatorId: string = '';
    private _loadModulesPromise: Promise<ILoadDependencies|Error>;
    private _openerUpdateCallback: Function;
    private _openPopupTimerId: number;
    private _vdomOnOldPage: boolean;
    private _action: any; // compatible

    protected _afterMount(): void {
        this._openerUpdateCallback = this._updatePopup.bind(this);
        this._notify('registerOpenerUpdateCallback', [this._openerUpdateCallback], {bubbling: true});
    }

    protected _beforeUnmount(): void {
        this._notify('unregisterOpenerUpdateCallback', [this._openerUpdateCallback], {bubbling: true});
        this._toggleIndicator(false);
        if (this._options.closePopupBeforeUnmount) {
            if (this._openPopupTimerId) {
                clearTimeout(this._openPopupTimerId);
                this._openPopupTimerId = null;
            }
            if (this._useVDOM()) {
                ManagerController.remove(this._popupId);
            } else if (this._action) { // todo Compatible
                this._action.destroy();
                this._action = null;
            }
        }
    }
    open(popupOptions: TBaseOpenerOptions, controller: string): Promise<string | undefined> {
        return new Promise(((resolve) => {
            this._toggleIndicator(true);
            const cfg: TBaseOpenerOptions = this._getConfig(popupOptions || {});
            let resultPromise: Promise<string>;
            // TODO Compatible: Если Application не успел загрузить совместимость - грузим сами.
            if (cfg.isCompoundTemplate) {
                resultPromise = this._compatibleOpen(cfg, controller);
            } else {
                resultPromise = this._openPopup(cfg, controller);
            }

            // Удалить resultPromise после перевода страниц на application
            // Сейчас эта ветка нужно, чтобы запомнить ws3Action, который откроет окно на старой странице
            // На вдоме отдаем id сразу
            if (!this._useVDOM()) {
                resultPromise.then((popupId) => resolve(popupId));
            } else {
                resolve(cfg.id);
            }
        }));
    }

    /**
     * Closes a popup
     * @function Controls/_popup/Opener/BaseOpener#close
     */
    close(): void {
        const popupId: string = this._getCurrentPopupId();
        if (!this._action && popupId) {
            (BaseOpener.closeDialog(popupId) as Promise<void>).then(() => {
                this._popupId = null;
            });
        } else if (!BaseOpener.isNewEnvironment() && this._action) {
            this._action.closeDialog();
        }
    }

    /**
     * State of whether the popup is open
     * @function Controls/_popup/Opener/BaseOpener#isOpened
     * @returns {Boolean} Is popup opened
     */
    isOpened(): boolean {
        // todo Compatible: Для старого окружения не вызываем методы нового Manager'a
        if (this._useVDOM()) {
            return !!ManagerController.find(this._getCurrentPopupId());
        }
        if (this._action) {
            return !!this._action.getDialog();
        }
        return null;
    }

    /* Защита от множественного вызова. собираем все синхронные вызовы, открываем окно с последним конфигом */
    private _showDialog(template: Control, cfg: IBasePopupOptions, controller: Control, resolve: Function): void {
        if (this._openPopupTimerId) {
            clearTimeout(this._openPopupTimerId);
        }
        this._openPopupTimerId = setTimeout(() => {
            this._openPopupTimerId = null;
            BaseOpener.showDialog(template, cfg, controller, this).addCallback((id: string) => {
                if (this._useVDOM()) {
                    this._popupId = id;
                    // Call redraw to create emitter on scroll after popup opening
                    this._forceUpdate();
                } else {
                    // if old environment and old template, then we haven't compatible layer =>
                    // hide indicator immediately
                    if (!isNewEnvironment() && !BaseOpener.isVDOMTemplate(template)) {
                        this._toggleIndicator(false);
                    }
                    this._action = id;
                }
                resolve(id);
            });
        }, OPEN_POPUP_DEBOUNCE_DELAY);
    }

    private _openPopup(cfg: TBaseOpenerOptions, controller: string): Promise<string | undefined> {
        return new Promise(((resolve) => {
            this._requireModules(cfg, controller).then((result: ILoadDependencies) => {
                cfg.id = this._getCurrentPopupId();
                this._showDialog(result.template, cfg, result.controller, resolve);
            }).catch(() => {
                this._toggleIndicator(false);
                resolve();
            });
        }));
    }

    private _requireModules(cfg: TBaseOpenerOptions, controller: string): Promise<ILoadDependencies|Error> {
        if (!this._loadModulesPromise) {
            this._loadModulesPromise = BaseOpener.requireModules(cfg, controller).then((results: ILoadDependencies) => {
                this._loadModulesPromise = null;
                // todo https://online.sbis.ru/opendoc.html?guid=b954dff3-9aa5-4415-a9b2-7d3430bb20a5
                // If Opener was destroyed while template loading, then don't open popup.
                if (!this._destroyed || this._options.closePopupBeforeUnmount === false) {
                    return results;
                }
                return new Error('Opener was destroyed');
            });
        }
        return this._loadModulesPromise;
    }

    private _getConfig(popupOptions: IBaseOpenerOptions = {}): TBaseOpenerOptions {
        const baseConfig = BaseOpener.getConfig(this._options, popupOptions);
        // if the .opener property is not set, then set the defaultOpener or the current control
        if (!baseConfig.hasOwnProperty('opener')) {
            baseConfig.opener = DefaultOpenerFinder.find(this) || this;
        }
        if (baseConfig.actionOnScroll) {
            this._actionOnScroll = baseConfig.actionOnScroll;
        }

        this._vdomOnOldPage = baseConfig._vdomOnOldPage;

        if (this._isPopupDestroyed()) {
            this._popupId = null;
        }
        if (!this._popupId) {
            this._popupId = randomId('popup-');
        }
        baseConfig.id = this._popupId;

        this._prepareNotifyConfig(baseConfig);
        return baseConfig;
    }

    private _prepareNotifyConfig(cfg: TBaseOpenerOptions): void {
        this._popupHandler = this._popupHandler.bind(this);

        // Handlers for popup events
        cfg._events = {
            onOpen: this._popupHandler,
            onResult: this._popupHandler,
            onClose: this._popupHandler
        };
    }

    private _popupHandler(eventName: string, args: any[]): void {
        // Trim the prefix "on" in the event name
        const event = eventName.substr(2).toLowerCase();

        if (event === 'close' || event === 'open') {
            this._toggleIndicator(false);
        }

        this._notify(event, args);
    }

    private _toggleIndicator(visible: boolean): void {
        if (visible) {
            // if popup was opened, then don't show indicator, because we don't have async phase
            // todo: Compatible if we have action, then we have opened popup on old page
            if (this._getCurrentPopupId() || this._action) {
                return;
            }
            this._indicatorId = this._notify('showIndicator',
                [this._getIndicatorConfig()], {bubbling: true}) as string;
        } else if (this._indicatorId) {
            this._notify('hideIndicator', [this._indicatorId], {bubbling: true});
            this._indicatorId = null;
        }
    }

    protected _getIndicatorConfig() {
        return {
            id: this._indicatorId,
            message: rk('Загрузка'),
            delay: 2000 // by standart
        };
    }

    protected _scrollHandler(event: Event): void {
        if (this.isOpened() && event.type === 'scroll') {
            if (this._actionOnScroll === 'close') {
                this._closeOnTargetScroll();
            } else if (this._actionOnScroll === 'track') {
                this._updatePopup();
            }
        }
    }

    private _updatePopup(): void {
        ManagerController.popupUpdated(this._getCurrentPopupId());
    }

    private _closeOnTargetScroll(): void {
        this.close();
    }

    private _getCurrentPopupId(): string {
        return this._popupId;
    }

    private _useVDOM(): boolean {
        return BaseOpener.isNewEnvironment() || this._vdomOnOldPage;
    }

    private _isPopupDestroyed(): boolean {
        const popupItem = ManagerController.find(this._getCurrentPopupId());
        return popupItem &&
            (popupItem.popupState === popupItem.controller.POPUP_STATE_DESTROYING ||
             popupItem.popupState === popupItem.controller.POPUP_STATE_DESTROYED ||
             popupItem.startRemove === true);
    }

    private _compatibleOpen(cfg: TBaseOpenerOptions, controller: string): Promise<string | undefined> {
        return new Promise((resolve) => {
            requirejs(['Lib/Control/LayerCompatible/LayerCompatible'], (Layer) => {
                Layer.load().addCallback(() => {
                    this._openPopup(cfg, controller).then((popupId: string) => resolve(popupId));
                });
            });
        });
    }

    static showDialog(rootTpl: Control, cfg: IBaseOpenerOptions, controller: Control, opener?: BaseOpener) {
        const def = new Deferred();
        if (BaseOpener.isNewEnvironment() || cfg._vdomOnOldPage) {
            const openOptions: IControlOptions = (opener || cfg?.opener)?._options;
            if (!BaseOpener.isNewEnvironment()) {
                BaseOpener.getManager(openOptions).then(() => {
                    BaseOpener.getZIndexUtil().addCallback((getZIndex) => {
                        const popupOpener = opener || cfg.opener;
                        if (popupOpener) {
                            // при открытии через статический метод открыватора в верстке нет, нужно взять то что передали в опции
                            cfg.zIndex = cfg.zIndex || getZIndex(popupOpener);
                            cfg.theme = popupOpener._options.theme;
                        }
                        if (!BaseOpener.isVDOMTemplate(rootTpl)) {
                            requirejs(['Controls/compatiblePopup'], (compatiblePopup) => {
                                compatiblePopup.BaseOpener._prepareConfigForOldTemplate(cfg, rootTpl);
                                BaseOpener._openPopup(cfg, controller, def);
                            });
                        } else {
                            BaseOpener._openPopup(cfg, controller, def);
                        }
                    });
                });
            } else if (BaseOpener.isVDOMTemplate(rootTpl) && !(cfg.templateOptions && cfg.templateOptions._initCompoundArea)) {
                BaseOpener.getManager(openOptions).then(() => {
                    BaseOpener._openPopup(cfg, controller, def);
                });
            } else {
                requirejs(['Controls/compatiblePopup'], (compatiblePopup) => {
                    compatiblePopup.BaseOpener._prepareConfigForOldTemplate(cfg, rootTpl);
                    BaseOpener._openPopup(cfg, controller, def);
                });
            }
        } else {
            let isFormController = false;
            let proto = rootTpl.prototype && rootTpl.prototype.__proto__;
            while (proto && !isFormController) {
                if (proto._moduleName === 'SBIS3.CONTROLS/FormController') {
                    isFormController = true;
                }
                proto = proto.__proto__;
            }

            const deps = ['Controls/compatiblePopup'];

            if (isFormController) {
                deps.push('SBIS3.CONTROLS/Action/List/OpenEditDialog');
            } else {
                deps.push('SBIS3.CONTROLS/Action/OpenDialog');
            }

            let libInfo;
            if (typeof cfg.template === 'string') {
                libInfo = parserLib(cfg.template);

                deps.push(libInfo.name);
            }

            // Нужно чтобы managerWrapper был построен до совместимости в панели, т.к. в нем
            // регистрируются Listener'ы, лежащие внутри шаблона. Не торможу построение ожиданием Deferred'a,
            // т.к. после выполняется еще несколько асинхронных операций, ожидающих в том числе этих же зависимостией.
            BaseOpener.getManager((opener || cfg?.opener)?._options);

            requirejs(deps, (compatiblePopup, Action, Tpl) => {
                try {
                    let templateFunction = Tpl;
                    if (opener && opener._options.closeOnTargetScroll) {
                        cfg.closeOnTargetScroll = true;
                    }

                    // get module from library
                    if (libInfo && libInfo.path.length !== 0) {
                        cfg.template = Tpl;
                        libInfo.path.forEach((key) => {
                            cfg.template = cfg.template[key];
                            templateFunction = cfg.template;
                        });
                    }

                    // get module from default export
                    if (templateFunction && templateFunction.default) {
                        templateFunction = templateFunction.default;
                    }

                    const newCfg = compatiblePopup.BaseOpener._prepareConfigFromNewToOld(cfg,
                        templateFunction || cfg.template);

                    // Прокинем значение опции theme опенера, если другое не было передано в templateOptions.
                    // Нужно для открытия окон на старых страницах'.
                    if (opener && opener._options.theme) {
                        newCfg.templateOptions = newCfg.templateOptions || {};
                        newCfg.templateOptions.theme = newCfg.templateOptions.theme || opener._options.theme;
                    }

                    let action;
                    let openedDialog = null;
                    if (typeof cfg.id === 'string') {
                        cfg.id = null;
                    }
                    // Если нет сохраненного dialogMixin'a
                    if (!(opener && opener._action) && !cfg.id) {
                        action = new Action({
                            withIndicator: !isFormController,
                            closeByFocusOut: true,
                            dialogCreatedCallback: (newDialog) => openedDialog = newDialog
                        });
                    } else {
                        action = (opener && opener._action) || cfg.id;
                    }

                    const dialog = action.getDialog();
                    const compoundArea = dialog && dialog._getTemplateComponent();

                    // Check, if opened VDOM template on oldPage (we have compatible layer), then try reload template.
                    if (compoundArea && compoundArea._moduleName === 'Controls/compatiblePopup:CompoundAreaNewTpl' &&
                        !isFormController && compoundArea._options.template === newCfg.template) {
                        // Redraw template with new options
                        compatiblePopup.BaseOpener._prepareConfigForNewTemplate(newCfg);
                        compoundArea.setTemplateOptions(newCfg.componentOptions.templateOptions);
                        if (dialog.setTarget) {
                            dialog.setTarget($(newCfg.target));
                        }

                        if (dialog._finishPopupOpenedDeferred) {
                            dialog._finishPopupOpenedDeferred();
                        }
                    } else {
                        openedDialog = null;
                        action.closeDialog();
                        action._isExecuting = false;
                        action.execute(newCfg).addCallback(() => {
                            // Защита от утечки. проверяем, что закрылось окно, которое открывали последним.
                            // в этом случае дестроим action.
                            // Т.к. мы создаем его динамически, никто кроме baseOpener его не задестроит
                            if (action.getDialog() === openedDialog) {
                                // Этот дестрой не должен звать за собой дестрой панели,
                                // т.к. она уже в состоянии закрытия
                                // Если action позовет дестрой панели в этом обработчике,
                                // то все остальные обработчики на onAfterClose не вызовутся
                                // т.к. в системе событий есть провека на isDestroyed();
                                action._closeDialogAfterDestroy = false;
                                action.destroy();
                                if (opener && opener._action) {
                                    opener._action = null;
                                }
                                openedDialog = null;
                            }
                        });
                    }
                    def.callback(action);
                } catch (err) {
                    Logger.error('Controls/popup: Ошибка при открытии окна: ' + err.message);
                }

            });
        }
        return def;
    }

    static closeDialog(popupId: string): Promise<void> | void {
        // On old page all vdom popup opening by SBIS3 action
        if (cInstance.instanceOfMixin(popupId, 'SBIS3.CONTROLS/Action/Mixin/DialogMixin')) {
            // TODO: COMPATIBLE
            popupId.closeDialog();
        } else {
            return ManagerController.remove(popupId);
        }
    }

    /**
     *
     * @param config
     * @param controller
     * @return {Promise.<{template: Function; controller: Function}>}
     * @private
     */
     static requireModules(config: IBaseOpenerOptions, controller: string): Promise<ILoadDependencies|Error> {
        return new Promise<ILoadDependencies|Error>((resolve) => {
            Promise.all([
                BaseOpener.requireModule(config.template),
                BaseOpener.requireModule(controller)
            ]).then((result: [Control, Control]) => {
                resolve({
                    template: result[0],
                    controller: result[1]
                });
            }).catch((error: Error) => {
                Logger.error(this._moduleName + ': ' + error.message, undefined, error);
                return error;
            });
        });
    }

    /**
     * @param {String | Function} module
     * @return {Promise.<Function>}
     * @private
     */
    static requireModule(module: string|Control): Promise<Control> {
        if (typeof module === 'string') {
            const parsedModule = parserLib(module);
            const isDefined = require.defined(parsedModule.name);
            let mod = isDefined && require(parsedModule.name);
            // Если кто-то позвал загрузку модуля, но она еще не отстрелила, require может вернуть пустой объект
            if (!isDefined || isEmpty(mod)) {
                return load(module);
            }
            if (parsedModule.path.length) {
                parsedModule.path.forEach((property) => {
                    if (mod && typeof mod === 'object' && property in mod) {
                        mod = mod[property];
                    }
                });
            }

            // It's not a library notation so mind the default export for ES6 modules
            if (mod && mod.__esModule && mod.default) {
                mod = mod.default;
            }
            return Promise.resolve(mod);
        }
        return Promise.resolve(module);
    }

    static getConfig(options: IBaseOpenerOptions, popupOptions: IBaseOpenerOptions): IBaseOpenerOptions {
        // todo https://online.sbis.ru/opendoc.html?guid=770587ec-2016-4496-bc14-14787eb8e713
        // Возвращаю правки.usedOptions - набор опций, которые мы берем с opener'a (с opener._options) и передаем в окно
        // Все опции опенера брать нельзя,т.к. ядро добавляет свои опции опенеру (в режиме совместимости),
        // которые на окно попасть не должны.
        const baseConfig = {};
        const usedOptions = [
            'id',
            'closeByExternalClick',
            'isCompoundTemplate',
            'eventHandlers',
            'autoCloseOnHide',
            'autoClose',
            'type',
            'style',
            'message',
            'details',
            'yesCaption',
            'noCaption',
            'cancelCaption',
            'okCaption',
            'autofocus',
            'isModal',
            'modal',
            'closeOnOutsideClick',
            'closeOnDeactivated',
            'closeOnTargetScroll',
            'className',
            'template',
            'templateOptions',
            'minWidth',
            'maxWidth',
            'maximize',
            'width',
            'propStorageId',
            'resizable',
            'top',
            'autoHide',
            'left',
            'maxHeight',
            'minHeight',
            'draggable',
            'horizontalAlign',
            'verticalAlign',
            'offset',
            'direction',
            '_vdomOnOldPage',
            'corner',
            'targetPoint',
            'targetTracking',
            'locationStrategy',
            'fittingMode',
            'actionOnScroll',
            'isWS3Compatible'
        ];

        // merge _options to popupOptions
        for (let i = 0; i < usedOptions.length; i++) {
            const option = usedOptions[i];
            if (options[option] !== undefined) {
                baseConfig[option] = options[option];
            }
        }

        delete baseConfig.theme; // todo fix?

        const templateOptions = {};
        CoreMerge(templateOptions, baseConfig.templateOptions || {});
        CoreMerge(templateOptions, popupOptions.templateOptions || {}, {rec: false});

        const baseCfg = {...baseConfig, ...popupOptions, templateOptions};

        // protect against wrong config. Opener must be specified only on popupOptions.
        if (baseCfg.templateOptions) {
            delete baseCfg.templateOptions.opener;
        }

        if (baseCfg.hasOwnProperty('verticalAlign') || baseCfg.hasOwnProperty('horizontalAlign')) {
            Logger.warn('Controls/popup:Sticky : Используются устаревшие опции verticalAlign и horizontalAlign, используйте опции offset и direction');
        }

        return baseCfg;
    }

    static getZIndexUtil() {
        const deferred = new Deferred();
        const module = 'Controls/Utils/getZIndex';
        if (requirejs.defined(module)) {
            return deferred.callback(requirejs(module));
        }
        requirejs([module], (getZIndex) => {
            return deferred.callback(getZIndex);
        });
        return deferred;
    }

    static _openPopup(cfg: IBaseOpenerOptions, controller: Control, def: Promise<string>): void {
        if (!ManagerController.isPopupCreating(cfg.id)) {
            cfg.id = ManagerController.show(cfg, controller);
        } else {
            ManagerController.updateOptionsAfterInitializing(cfg.id, cfg);
        }
        def.callback(cfg.id);
    }

    static getDefaultOptions(): IBaseOpenerOptions {
        return {
            closePopupBeforeUnmount: true,
            actionOnScroll: 'none',
            _vdomOnOldPage: false // Always open vdom panel
        };
    }

     // TODO Compatible
    static isVDOMTemplate(templateClass: Control | TemplateFunction): boolean {
        return !!(templateClass.prototype && templateClass.prototype._template) ||
            !!templateClass.stable || !!(templateClass[0] && templateClass[0].func);
    }

    // TODO Compatible
    static isNewEnvironment(): boolean {
        return isNewEnvironment();
    }

    // TODO Compatible
    static getManager(_options: IControlOptions = {}): Promise<void> {
        if (!ManagerWrapperCreatingPromise) {
            if (!isNewEnvironment()) {
                const managerContainer = document.createElement('div');
                managerContainer.classList.add('controls-PopupContainer');
                document.body.insertBefore(managerContainer, document.body.firstChild);

                ManagerWrapperCreatingPromise = new Promise((resolve, reject) => {
                    require(['Core/Creator', 'Controls/compatiblePopup'], (Creator, compatiblePopup) => {
                        Creator(compatiblePopup.ManagerWrapper, { theme: _options.theme }, managerContainer).then(resolve);
                    }, reject);
                });
            } else {
                // Защита от случаев, когда позвали открытие окна до полного построения страницы
                if (ManagerController.getManager()) {
                    return Promise.resolve();
                } else {
                    ManagerWrapperCreatingPromise = new Promise((resolve) => {
                        const intervalDelay: number = 20;
                        const intervalId: number = setInterval(() => {
                            if (ManagerController.getManager()) {
                                clearInterval(intervalId);
                                resolve();
                            }
                        }, intervalDelay);
                    });
                }
            }
        }

        return ManagerWrapperCreatingPromise;
    }
    static _theme: string[] = ['Controls/popup'];
}

export default BaseOpener;
