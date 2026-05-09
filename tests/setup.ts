import { config } from '@vue/test-utils';
import { vi } from 'vitest';

// Identity-pass translation: tests don't care about locale, only that the
// surface is callable and returns the input. The real module pulls
// `container.getStore()` which has heavy side effects.
vi.mock('@/translation', () => {
    const _t = (text: string) => text;
    const __t = (text: string, ...args: (string | number)[]) =>
        text.replace(/\{([0-9]+)}/g, (m, idx) => `${args[Number(idx)] ?? m}`);
    const _n = (singular: string, plural: string, num: number) => (num === 1 ? singular : plural);
    const __n = (singular: string, plural: string, num: number, ...args: (string | number)[]) =>
        __t(num === 1 ? singular : plural, ...args);
    return { _t, __t, _n, __n, language: () => 'en', locale: () => 'en_US' };
});

// Ionic web components rely on custom-element registration that JSDOM only
// partially supports. Treat them as transparent slots in component tests.
config.global.stubs = {
    ...(config.global.stubs as Record<string, unknown>),
    'ion-app': true,
    'ion-page': true,
    'ion-content': true,
    'ion-header': true,
    'ion-toolbar': true,
    'ion-title': true,
    'ion-button': true,
    'ion-icon': true,
    'ion-item': true,
    'ion-label': true,
    'ion-list': true,
    'ion-input': true,
    'ion-modal': true,
    'ion-card': true,
    'ion-card-content': true,
    'ion-card-header': true,
    'ion-spinner': true,
};
