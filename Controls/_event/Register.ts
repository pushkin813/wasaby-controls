/**
 * Created by dv.zuev on 17.01.2018.
 * Компонент слушает события "снизу". События register и сохраняет Listener'ы в списке
 * то есть, кто-то снизу сможет услышать события верхних компонентов через это отношение
 */
import Control = require('Core/Control');
import template = require('wml!Controls/_event/Register');
import Registrar = require('Controls/_event/Registrar');
import entity = require('Types/entity');
import {IRegistrarConfig} from './Registrar';

let EventRegistrator = Control.extend({
   _template: template,
   _registrar: null,
   _beforeMount(newOptions) {
      if (typeof window !== 'undefined') {
         this._forceUpdate = function() {
            // Do nothing
            // This method will be called because of handling event.
         };
         this._registrar = new Registrar({ register: newOptions.register });
      }
   },
   _registerIt(event, registerType, component, callback, config:IRegistrarConfig = {}) {
      if (registerType === this._options.register) {
         this._registrar.register(event, component, callback, config);
      }
   },
   _unRegisterIt(event, registerType, component, config: IRegistrarConfig = {}) {
      if (registerType === this._options.register) {
         this._registrar.unregister(event, component, config);
      }
   },
   start() {
      this._registrar.start.apply(this._registrar, arguments);
   },
   _beforeUnmount() {
      if (this._registrar) {
         this._registrar.destroy();
         this._registrar = null;
      }
   }
});

EventRegistrator.getOptionTypes = function() {
   return {
      register: entity.descriptor(String).required()
   };
};

export = EventRegistrator;

