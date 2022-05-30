type Color = {
    r: number;
    g: number;
    b: number;
    a: number;
}

export function mix(a: Color, b: Color, weight: number): Color {
    return {
        r: a.r * weight + b.r,
        g: a.g * weight + b.g,
        b: a.b * weight + b.b,
        a: a.a * weight + b.a,
    };
}

export function red() {
    return {r: 230, g: 50, b: 65, a: 1};
}

export function green() {
    return {r: 20, g: 210, b: 60, a: 1};
}

export function colorAsString({r,g,b,a}: Color): string {
    return `rgba(${r},${g},${b},${a})`; 
}