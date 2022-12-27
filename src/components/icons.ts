import { AlarmIcon, BarbellIcon, BikeIcon, BookIcon, BooksIcon, CandleIcon, CarIcon, CheckIcon, DiceIcon, FlagIcon, HammerIcon, HeadphonesIcon, HeartIcon, HeartbeatIcon, HourglassEmptyIcon, MoonIcon, RadioIcon, ScissorsIcon, ShoeIcon, SunglassesIcon, VideoIcon, NewsIcon, AppleIcon, PawIcon, UserIcon, GlassIcon, ToolsKitchenIcon, FlowerIcon, SchoolIcon, ShirtIcon, TrainIcon, WalletIcon, DropletIcon, BucketIcon, BottleIcon, BathIcon, VacuumCleanerIcon, WashMachineIcon, HangerIcon, SockIcon, TeapotIcon, FridgeIcon } from 'vue-tabler-icons';

export const icons = {
    'alarm': AlarmIcon,
    'apple': AppleIcon,
    'barbell': BarbellIcon,
    'bath': BathIcon,
    'bike': BikeIcon,
    'book': BookIcon,
    'books': BooksIcon,
    'bottle': BottleIcon,
    'bucket': BucketIcon,
    'candle': CandleIcon,
    'car': CarIcon,
    'check': CheckIcon,
    'dice': DiceIcon,
    'droplet': DropletIcon,
    'flag': FlagIcon,
    'flower': FlowerIcon,
    'fridge': FridgeIcon,
    'glass': GlassIcon,
    'hammer': HammerIcon,
    'hanger': HangerIcon,
    'headphones': HeadphonesIcon,
    'heart': HeartIcon,
    'heartbeat': HeartbeatIcon,
    'hourglass-empty': HourglassEmptyIcon,
    'moon': MoonIcon,
    'news': NewsIcon,
    'paw': PawIcon,
    'radio': RadioIcon,
    'school': SchoolIcon,
    'scissors': ScissorsIcon,
    'shirt': ShirtIcon,
    'shoe': ShoeIcon,
    'sock': SockIcon,
    'sunglasses': SunglassesIcon,
    'teapot': TeapotIcon,
    'tools-kitchen': ToolsKitchenIcon,
    'train': TrainIcon,
    'user': UserIcon,
    'vacuum': VacuumCleanerIcon,
    'video': VideoIcon,
    'wallet': WalletIcon,
    'wash-machine': WashMachineIcon,
};

export type IconName = keyof typeof icons;

export function isValidIcon(icon: string): icon is IconName {
    return icon in icons;
}
