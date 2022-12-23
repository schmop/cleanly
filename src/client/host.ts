export function getWebHost() {
    if (process.env.NODE_ENV === 'production') {
        return "https://cleanly.schmoppo.de";
    }
    //return "http://127.0.0.1:8000";
    return "http://192.168.2.107:8000";
}

export function getSseHost() {
    if (process.env.NODE_ENV === 'production') {
        return "https://cleanly.schmoppo.de:3333";
    }
    return "http://127.0.0.1:3334";
}