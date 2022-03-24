import * as icons from 'ionicons/icons';


const iconNames = [
    'alarm',
    'barbell',
    'bicycle',
    'book',
    'car',
    'checkmark',
    'construct',
    'cut',
    'dice',
    'fitness',
    'film',
    'flag',
    'flame',
    'footsteps',
    'glasses',
    'headset',
    'heart',
    'hourglass',
    'library',
    'moon',
    'musicalNotes',
    'newspaper',
    'nutrition',
    'paw',
    'person',
    'pint',
    'restaurant',
    'rose',
    'school',
    'shirt',
    'terminal',
    'train',
    'wallet',
    'water',
];
const iconMap:{[name: string]: string} = {};
iconNames.forEach(name => {
    iconMap[name] = (icons as any)[name + 'Outline'];
});

export default iconMap;