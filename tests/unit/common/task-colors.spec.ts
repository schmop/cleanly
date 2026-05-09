import { describe, expect, it } from 'vitest';
import { darkLuminosity, getDefaultTaskHue, lightLuminosity, taskColorFromHue } from '@/common/task-colors';
import { HSL } from '@/common/colors';

describe('task-colors', () => {
    it('exposes constant luminosities and default hue', () => {
        expect(lightLuminosity()).toBe(80);
        expect(darkLuminosity()).toBe(20);
        expect(getDefaultTaskHue()).toBe(190);
    });

    it('builds a light HSL when dark=false', () => {
        const hsl = taskColorFromHue(120, false);
        expect(hsl).toBeInstanceOf(HSL);
        expect(hsl.hue).toBe(120);
        expect(hsl.saturation).toBe(100);
        expect(hsl.luminosity).toBe(lightLuminosity());
    });

    it('builds a dark HSL when dark=true', () => {
        const hsl = taskColorFromHue(0, true);
        expect(hsl.luminosity).toBe(darkLuminosity());
    });
});
