function getDevHostIp() {
    return "http://192.168.178.29";
//    return "http://localhost";
}

export function getSseHost() {
    if (import.meta.env.PROD) {
        return "https://cleanly.schmoppo.de:3333";
    }
    return `${getDevHostIp()}:3334`;
}

export function getDefaultWebHost() {
    if (import.meta.env.PROD) {
        return "https://cleanly.schmoppo.de";
    }
    return `${getDevHostIp()}:8000`;
}
