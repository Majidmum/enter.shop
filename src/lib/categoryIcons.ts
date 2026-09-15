import {
  Laptop, Monitor, Smartphone, Printer, Armchair, Sofa, Table2,
  Mouse, Keyboard, HardDrive, Headphones, Webcam,
  Refrigerator, Tv, UtensilsCrossed, CookingPot, Car,
  Sparkles, Baby, Dumbbell, PackageOpen,
  Plug, Cable, Briefcase, Router, Battery, Lightbulb, Fan,
  Gamepad2, Watch, Backpack, Umbrella, Wrench, Palette, Book,
  GraduationCap, Music, Film, Gift, PawPrint, Flower2, Trees,
  Bike, Tent, Fish, Cpu, Usb, Projector, Speaker, Server, Wifi,
  ShieldCheck, Package, Shirt, Footprints, Gem, Glasses,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Подбирает подходящую иконку под категорию по ключевым словам в названии.
 * Специального поля "иконка" в базе нет — это разумный дефолт по смыслу
 * названия, без необходимости отдельно назначать иконку каждой категории.
 * Список специально сделан с запасом — не только под текущие категории,
 * но и под большинство обычных для интернет-магазина названий, чтобы
 * при добавлении новых категорий они реже попадали в общую заглушку.
 */
const KEYWORD_ICONS: [RegExp, LucideIcon][] = [
  // Компьютеры и оргтехника
  [/перифери/i, Mouse],
  [/ноутбук/i, Laptop],
  [/компьютер|\bпк\b|системный блок/i, Laptop],
  [/монитор/i, Monitor],
  [/принтер|мфу|сканер/i, Printer],
  [/мыш/i, Mouse],
  [/клавиатур/i, Keyboard],
  [/сет[ьи]|роутер|wi-?fi|маршрутизатор/i, Router],
  [/интернет.*расходник|кабел[ья]|провод|переходник|адаптер/i, Cable],
  [/диск|накопител|флешк|ssd|hdd/i, HardDrive],
  [/процессор|видеокарт|материнск|комплектующ/i, Cpu],
  [/usb|юсб/i, Usb],
  [/проектор/i, Projector],
  [/сервер/i, Server],

  // Электроника, связь, видео
  [/телефон|смартфон/i, Smartphone],
  [/наушник|колонк|звук|аудио/i, Headphones],
  [/акустик|динамик/i, Speaker],
  [/видеонаблюдени|камер|веб-?камер/i, Webcam],
  [/телевизор|\bтв\b/i, Tv],
  [/wi-?fi|интернет(?!.*расходник)/i, Wifi],
  [/зарядк|аккумулятор|повербанк/i, Battery],
  [/лампа|освещени|светильник/i, Lightbulb],
  [/игр|геймер|консол/i, Gamepad2],
  [/фото|кино|проектор/i, Film],
  [/музык|инструмент/i, Music],
  [/часы|смарт-?часы/i, Watch],

  // Мебель и офис
  [/кресл/i, Armchair],
  [/диван|мягк.*мебел/i, Sofa],
  [/стол|мебель/i, Table2],
  [/кейс|чехол.*ноутбук|сумк.*ноутбук/i, Briefcase],
  [/рюкзак|сумк/i, Backpack],
  [/защит|безопасност|сигнализаци/i, ShieldCheck],

  // Бытовая техника и дом
  [/холодильник|морозильник/i, Refrigerator],
  [/кондиционер|климат|вентилятор/i, Fan],
  [/кухн/i, UtensilsCrossed],
  [/посуд/i, CookingPot],
  [/бытов.*техник|электроприбор/i, Plug],
  [/зонт/i, Umbrella],
  [/инструмент|ремонт|стройк/i, Wrench],
  [/интерьер|декор|краск/i, Palette],

  // Одежда, обувь, аксессуары
  [/одежд/i, Shirt],
  [/обувь/i, Footprints],
  [/аксессуар/i, Gem],
  [/очки/i, Glasses],

  // Разное
  [/авто/i, Car],
  [/красот|здоров/i, Sparkles],
  [/дет[ий]|игрушк/i, Baby],
  [/спорт|фитнес|тренаж/i, Dumbbell],
  [/туризм|поход|палатк/i, Tent],
  [/рыбалк|охот/i, Fish],
  [/велосипед|самокат/i, Bike],
  [/сад|растени|цвет/i, Flower2],
  [/природ|эко/i, Trees],
  [/животн|зоотовар/i, PawPrint],
  [/книг|литератур/i, Book],
  [/обучени|образовани|курс/i, GraduationCap],
  [/подарк|сувенир/i, Gift],
  [/упаковк/i, Package],
];

export function getCategoryIcon(name: string): LucideIcon {
  const match = KEYWORD_ICONS.find(([re]) => re.test(name));
  return match ? match[1] : PackageOpen;
}
