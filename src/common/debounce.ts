export default function debounce(func: (...args: any[]) => any, wait: number, immediate: boolean) {
    let timeout: number|undefined = undefined;
    let calledBetween = false;
    return function (this: any, ...rest: []) {
        const later = () => {
            timeout = undefined;
            if (!immediate || calledBetween)
                func.apply(this, rest);
            calledBetween = false;
        };
        if (immediate && timeout) {
            calledBetween = true;
        }
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow)
            func.apply(this, rest);
    };
}
