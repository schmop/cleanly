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
    return { r: 230, g: 50, b: 65, a: 1 };
}

export function green() {
    return { r: 20, g: 210, b: 60, a: 1 };
}

export function colorAsString({ r, g, b, a }: Color): string {
    return `rgba(${r},${g},${b},${a})`;
}

export class RGB {
    constructor(
        public r: number,
        public g: number,
        public b: number,
    ) {
    }

    toHex() {
        const asHex = (x: number) => `${Math.round(x * 255).toString(16)}`.padStart(2, '0');

        return "#" + asHex(this.r) + asHex(this.g) + asHex(this.b);
    }
}

export class HSL {
    private _hue: number = 0;
    private _saturation: number = 0;
    private _luminosity: number = 0;
    private _alpha: number = 1;

    public get hue() {
        return this._hue;
    }

    public set hue(hue) {
        if (hue < 0 || hue >= 360) {
            throw new Error('Invalid hue, needs to be between 0 and 360');
        }
        this._hue = hue;
    }

    public get luminosity() {
        return this._luminosity;
    }

    public set luminosity(luminosity) {
        if (luminosity < 0 || luminosity > 100) {
            throw new Error('Invalid luminosity, needs to be between 0 and 100');
        }
        this._luminosity = luminosity;
    }

    public get saturation() {
        return this._saturation;
    }

    public set saturation(saturation) {
        if (saturation < 0 || saturation > 100) {
            throw new Error('Invalid saturation, needs to be between 0 and 100');
        }
        this._saturation = saturation;
    }

    public get alpha() {
        return this._alpha;
    }

    public set alpha(alpha) {
        if (alpha < 0 || alpha > 1) {
            throw new Error('Invalid alpha, needs to be between 0 and 1');
        }
        this._alpha = alpha;
    }

    /**
     * @param hue {number} [0, 360)
     * @param saturation {number} [0, 100]
     * @param luminosity {number} [0, 100]
     * @param alpha {number} [0,1]
     */
    constructor(
        hue: number,
        saturation: number,
        luminosity: number,
        alpha: number = 1,
    ) {
        this.hue = hue;
        this.saturation = saturation;
        this.luminosity = luminosity;
        this.alpha = alpha;
    }

    /**
     * @link https://books.google.de/books?id=fGX8yC-4vXUC&pg=PA300&redir_esc=y#v=onepage&q&f=false
     * @source Computer Graphics and Geometric from Max K. Agoston, Page 306
     */
    toRgb() {
        const { hue: h, saturation, luminosity } = this;
        const s = saturation / 100;
        const l = luminosity / 100;
        if (s <= 0) {
            return new RGB(l, l, l);
        }

        const v = l <= 0.5
            ? (l * (1 + s))
            : (l + s - l * s);

        if (v <= 0) {
            return new RGB(0, 0, 0);
        }

        const min = 2 * l - v;
        const sv = (v - min) / v;
        /** @var sixthH [0, 6) */
        const sixthH = ((h + 360) % 360) / 60;
        const sextant = Math.floor(sixthH);
        const fract = sixthH - sextant;
        const vsf = v * sv * fract;
        const mid1 = min + vsf;
        const mid2 = v - vsf;
        switch (sextant) {
            case 0: return new RGB(v, mid1, min);
            case 1: return new RGB(mid2, v, min);
            case 2: return new RGB(min, v, mid1);
            case 3: return new RGB(min, mid2, v);
            case 4: return new RGB(mid1, min, v);
            case 5: return new RGB(v, min, mid2);
        }

        console.error('HSL to RGB conversion failed', {h, s, l});
        throw new Error('Invalid argument, could not convert HSL to RGB!');
    }

    toHex() {
        return this.toRgb().toHex();
    }
}
