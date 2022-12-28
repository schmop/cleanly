import { container } from '@/dependency-injection/container';
import german from './german';

const state = container.getStore().state;

function formatString(string: string, ...args: (string|number)[]) {
    return string.replace(/{([0-9]+)}/g, (match, index) => {
        return `${args[index]}` ?? match;
    });
}

function language(): string {
    return state?.userSettings.language ?? 'de';
}

export function _t(text: string) {
    if (language() !== 'de') {
        return text;
    }
    const translation = german[text];
    if (typeof translation !== 'string') {
        console.warn('Untranslated text', text);

        return text;
    }

    return translation;
}

export function __t(text: string, ...args: (string|number)[]) {
    return formatString(_t(text), ...args);
}

export function _n(singular: string, plural: string, num: number) {
    return num === 1 ? _t(singular) : _t(plural);
}

export function __n(singular: string, plural: string, num: number, ...args: (string|number)[]) {
    return num === 1 ? __t(singular, ...args) : __t(plural, ...args);
}

export const translations = {
    _t,
    __t,
    _n,
    __n,
};
