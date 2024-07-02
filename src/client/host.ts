function getDevHostIp() {
    return "http://192.168.178.29";
}

export function getWebHost() {
    if (process.env.NODE_ENV === 'production') {
        return "https://cleanly.schmoppo.de";
    }
    return `${getDevHostIp()}:8000`;
}

export function getSseHost() {
    if (process.env.NODE_ENV === 'production') {
        return "https://cleanly.schmoppo.de:3333";
    }
    return `${getDevHostIp()}:3334`;
}
