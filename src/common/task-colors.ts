import { _t } from "@/translation";

export function getTaskColors() {
    return [
        {code: '#3f5c69', name: _t('Fiord')},
        {code: '#b3003b', name: _t('Shiraz')},
        {code: '#921aa6', name: _t('Seance')},
        {code: '#673AB7', name: _t('Purple Heart')},
        {code: '#3c4fb3', name: _t('Azure')},
        {code: '#0058ac', name: _t('Endeavour')},
        {code: '#006076', name: _t('Orient')},
        {code: '#006709', name: _t('Camarone')},
        {code: '#4b6100', name: _t('Verdun Green')},
        {code: '#794e00', name: _t('Cinnamon')},
        {code: '#745144', name: _t('Roman Coffee')},
        {code: '#585858', name: _t('Scorpion')},
    ];
}

export function getDefaultTaskColor() {
    return getTaskColors()[0];
}
