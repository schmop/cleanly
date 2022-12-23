import { HSL } from "@/common/colors";

export function isDarkTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function lightLuminosity() {
    return 80;
}

export function darkLuminosity() {
    return 20;
}

export function taskColorFromHue(hue: number) {
    return new HSL(hue, 100, isDarkTheme() ? darkLuminosity() : lightLuminosity());
}

export function getDefaultTaskHue() {
    return 190;
}
