import { mount } from '@vue/test-utils';

// Thin re-export of `mount` so component tests have a single import that
// also signals the Ionic-aware stub setup from tests/setup.ts is in effect.
// Future expansion (router stubs, store provider) goes here.
export const mountWithIonic = mount;
