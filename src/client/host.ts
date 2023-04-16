function getDevHostIp() {
    return "http://192.168.2.102";
}

export function getWebHost() {
    if (process.env.NODE_ENV === 'production') {
        return "https://cleanly.schmoppo.de";
    }
    //return "http://127.0.0.1:8000";
    return `${getDevHostIp()}:8000`;
}

export function getSseHost() {
    if (process.env.NODE_ENV === 'production') {
        return "https://cleanly.schmoppo.de:3333";
    }
    return `${getDevHostIp()}:3334`;
}
