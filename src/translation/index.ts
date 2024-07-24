import { container } from '@/dependency-injection/container';
import { german } from './german';
import { schwobi } from "@/translation/german_schwobi";

const state = container.getStore().state;
export type Language = 'en' | 'de' | 'schwobi';

function formatString(string: string, ...args: (string|number)[]): string {
    return string.replace(/{([0-9]+)}/g, (match, index) => {
        if (typeof index === "string") {
            index = parseInt(index, 10);
        }
        if (typeof index !== "number") {
            throw new Error('Formatting string failed!');
        }
        return `${args[index] ?? match}`;
    });
}

function language(): Language {
    return state?.userSettings.language ?? 'de';
}

function languageDict(): Record<string, string> {
    if (language() === 'en') {
        return {};
    }
    if (language() === 'de') {
        return german;
    }
    if (language() === 'schwobi') {
        return schwobi;
    }
    console.warn('Unknown language', language());
    return {};
}

export function _t(text: string): string {
    if (language() === 'en') {
        return text;
    }
    const dict = languageDict();
    const translation = dict[text];
    if (undefined === translation) {
        console.warn(`Untranslated text "${text}" in language ${language()}`);

        return text;
    }

    return translation;
}

export function _n(singular: string, plural: string, num: number): string {
    return num === 1 ? _t(singular) : _t(plural);
}

export function __t(text: string, ...args: (string|number)[]): string {
    return formatString(_t(text), ...args);
}

export function __n(singular: string, plural: string, num: number, ...args: (string|number)[]): string {
    return num === 1 ? __t(singular, ...args) : __t(plural, ...args);
}
