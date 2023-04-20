function formatString(string: string, ...args: (string|number)[]) {
    return string.replace(/{([0-9]+)}/g, (match, index) => {
        if (typeof index !== 'number') {
            throw new Error('Could not format string, match was not numerical!');
        }
        return `${args[index] ?? match}`;
    });
}

export function _t(text: string) {
    return text;
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
