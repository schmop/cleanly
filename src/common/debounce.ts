export default function debounce(func: any, wait: number, immediate: boolean) {
    let timeout = undefined as number | undefined;
    let calledInbetween = false;
    return function (this: any, ...rest: []) {
        const later = () => {
            timeout = undefined;
            if (!immediate || calledInbetween)
                func.apply(this, rest);
            calledInbetween = false;
        };
        if (immediate && timeout) {
            calledInbetween = true;
        }
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow)
            func.apply(this, rest);
    };
}