import { describe, expect, it } from 'vitest';
import { clamp, floor } from '@/common/math';

describe('clamp', () => {
    it('returns value when within bounds', () => {
        expect(clamp(5, 0, 10)).toBe(5);
    });
    it('returns min when below lower bound', () => {
        expect(clamp(-3, 0, 10)).toBe(0);
    });
    it('returns max when above upper bound', () => {
        expect(clamp(42, 0, 10)).toBe(10);
    });
    it('handles equal bounds', () => {
        expect(clamp(7, 5, 5)).toBe(5);
    });
});

describe('floor', () => {
    it('rounds down to integer when precision omitted', () => {
        expect(floor(3.9)).toBe(3);
        expect(floor(-1.2)).toBe(-2);
    });
    it('respects precision', () => {
        expect(floor(1.239, 2)).toBe(1.23);
        expect(floor(0.999, 1)).toBe(0.9);
    });
});
