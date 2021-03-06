import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_switchableArea/ItemTpl');
import { SyntheticEvent } from 'Vdom/Vdom';
import {UnregisterUtil, RegisterUtil} from 'Controls/event';

class SwitchableAreaItem extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
   protected _keyHooksStorage: string[] = null;

   protected _beforeMount(): void {
      this._keyHooksStorage = [];
   }

   protected _afterMount(): void {
      // if we select current item, then activate it, for focusing child controls
      this.activate();
      RegisterUtil(this, 'controlResize', this._resizeHandler.bind(this));
   }

   protected _afterRender(): void {
      if (this._options.selectedKey === this._options.key) {
         this._startResizeRegister();
      }
   }

   protected _afterUpdate(oldOptions): void {
      // if we select current item, then activate it, for focusing child controls
      if (this._options.selectedKey !== oldOptions.selectedKey) {
         if (this._options.selectedKey === this._options.key) {
            this.activate();
            this._executeKeyHooks('register');
         } else {
            this._executeKeyHooks('unregister');
         }
      }
   }

   protected _beforeUnmount(): void {
      UnregisterUtil(this, 'controlResize');
   }

   protected _registerKeyHook(event: Event, keyHook: Control): void {
      this._keyHooksStorage.push(keyHook);
   }

   protected _unregisterKeyHook(event: Event, keyHook: Control): void {
      const index = this._keyHooksStorage.indexOf(keyHook);
      if (index > -1) {
         this._keyHooksStorage.splice(index, 1);
      }
   }

   private _executeKeyHooks(action: string): void {
      for (let i = 0; i < this._keyHooksStorage.length; i++) {
         if (this._keyHooksStorage[i][action]) {
            this._keyHooksStorage[i][action]();
         }
      }
   }

   private _startResizeRegister(): void {
      const eventCfg = {
         type: 'controlResize',
         target: this._container,
         _bubbling: true
      };

      //TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=2775b943-3936-4107-955a-02ecb296a38e
      if (!this._container) {
         return;
      }

      // TODO https://online.sbis.ru/doc/a88a5697-5ba7-4ee0-a93a-221cce572430
      // Не запускаем ресайз, если контрол скрыт
      if (this._container.closest('.ws-hidden')) {
         return;
      }

      // https://online.sbis.ru/opendoc.html?guid=8aa1c2d6-f471-4a7e-971f-6ff9bfe72079
      this._children.resizeDetect.start(new SyntheticEvent(null, eventCfg));
   }

   protected _resizeHandler(): void {
      this._startResizeRegister();
   }
}

export default SwitchableAreaItem;
