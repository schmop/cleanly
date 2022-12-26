import { HSL } from "@/common/colors";

export function lightLuminosity() {
    return 80;
}

export function darkLuminosity() {
    return 20;
}

export function getDefaultTaskHue() {
    return 190;
}

export function taskColorFromHue(hue: number, dark: boolean) {
    return new HSL(hue, 100, dark ? darkLuminosity() : lightLuminosity());
}
