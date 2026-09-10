import {
  Laptop, Monitor, Smartphone, Printer, Armchair, Sofa, Table2,
  Mouse, Keyboard, Network, HardDrive, Headphones, Camera,
  Refrigerator, Tv, AirVent, UtensilsCrossed, CookingPot, Car,
  Sparkles, Baby, Dumbbell, ShoppingBag, PackageOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Подбирает подходящую иконку под категорию по ключевым словам в названии.
 * Специального поля "иконка" в базе нет — это разумный дефолт по смыслу
 * названия, без необходимости отдельно назначать иконку каждой категории.
 */
const KEYWORD_ICONS: [RegExp, LucideIcon][] = [
  [/ноутбук/i, Laptop],
  [/компьютер|пк\b/i, Laptop],
  [/монитор/i, Monitor],
  [/телефон|смартфон/i, Smartphone],
  [/принтер|мфу/i, Printer],
  [/кресл/i, Armchair],
  [/диван|мягк.*мебел/i, Sofa],
  [/стол|мебель/i, Table2],
  [/мыш/i, Mouse],
  [/клавиатур/i, Keyboard],
  [/сет[ьи]|роутер|wi-?fi/i, Network],
  [/диск|накопител/i, HardDrive],
  [/наушник|аудио/i, Headphones],
  [/камер|фото/i, Camera],
  [/холодильник/i, Refrigerator],
  [/телевизор|тв\b/i, Tv],
  [/кондиционер|климат/i, AirVent],
  [/кухн/i, UtensilsCrossed],
  [/посуд/i, CookingPot],
  [/авто/i, Car],
  [/красот|здоров/i, Sparkles],
  [/дет[ий]/i, Baby],
  [/спорт/i, Dumbbell],
  [/одежд|обувь|аксессуар/i, ShoppingBag],
];

export function getCategoryIcon(name: string): LucideIcon {
  const match = KEYWORD_ICONS.find(([re]) => re.test(name));
  return match ? match[1] : PackageOpen;
}
