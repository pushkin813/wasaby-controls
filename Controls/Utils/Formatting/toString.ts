import numberToString from 'Controls/Utils/Formatting/numberToString';
import {Logger} from 'UI/Utils';

export default function toString(original: string | number | null) {
    if (original === null) {
        return '';
    }
    if (typeof original === 'number') {
        return numberToString(original);
    }
    if (typeof original === 'string') {
        return original;
    }

    Logger.error(`Первый аргумент ${original} имеет не поддерживаемый тип`);
    return '';
}
