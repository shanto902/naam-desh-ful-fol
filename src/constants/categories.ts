import { Category, CategoryId } from '../types/game';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'country',
    nameBn: 'দেশের নাম',
    iconName: 'earth',
    accentColor: '#0D7C5F',
    bgColor: '#E3F5EE',
    placeholderBn: 'একটি দেশের নাম লিখুন...',
  },
  {
    id: 'flower',
    nameBn: 'ফুলের নাম',
    iconName: 'flower-tulip',
    accentColor: '#DB2777',
    bgColor: '#FCE7F3',
    placeholderBn: 'একটি ফুলের নাম লিখুন...',
  },
  {
    id: 'fruit',
    nameBn: 'ফলের নাম',
    iconName: 'food-apple',
    accentColor: '#E85D2F',
    bgColor: '#FFF0EA',
    placeholderBn: 'একটি ফলের নাম লিখুন...',
  },
  {
    id: 'animal',
    nameBn: 'প্রাণীর নাম',
    iconName: 'paw',
    accentColor: '#B45309',
    bgColor: '#FEF3C7',
    placeholderBn: 'একটি প্রাণীর নাম লিখুন...',
  },
  {
    id: 'person',
    nameBn: 'মানুষের নাম',
    iconName: 'account-heart',
    accentColor: '#4338CA',
    bgColor: '#EEF2FF',
    placeholderBn: 'একটি মানুষের নাম লিখুন...',
  },
  {
    id: 'profession',
    nameBn: 'পেশার নাম',
    iconName: 'briefcase-variant',
    accentColor: '#0F766E',
    bgColor: '#CCFBF1',
    placeholderBn: 'একটি পেশার নাম লিখুন...',
  },
  {
    id: 'food',
    nameBn: 'খাবারের নাম',
    iconName: 'silverware-fork-knife',
    accentColor: '#C2410C',
    bgColor: '#FFEDD5',
    placeholderBn: 'একটি খাবারের নাম লিখুন...',
  },
  {
    id: 'river',
    nameBn: 'নদীর নাম',
    iconName: 'waves',
    accentColor: '#0284C7',
    bgColor: '#E0F2FE',
    placeholderBn: 'একটি নদীর নাম লিখুন...',
  },
  {
    id: 'object',
    nameBn: 'বস্তুর নাম',
    iconName: 'cube-outline',
    accentColor: '#7C3AED',
    bgColor: '#F3E8FF',
    placeholderBn: 'একটি বস্তুর নাম লিখুন...',
  },
  {
    id: 'place',
    nameBn: 'স্থানের নাম',
    iconName: 'map-marker-radius',
    accentColor: '#059669',
    bgColor: '#D1FAE5',
    placeholderBn: 'একটি স্থানের নাম লিখুন...',
  },
];

export const CLASSIC_FOUR_CATEGORY_IDS: CategoryId[] = [
  'person',
  'country',
  'flower',
  'fruit',
];

export const ALL_CATEGORY_IDS: CategoryId[] = DEFAULT_CATEGORIES.map((c) => c.id);

export const CATEGORY_MAP: Record<CategoryId, Category> = DEFAULT_CATEGORIES.reduce(
  (acc, category) => {
    acc[category.id] = category;
    return acc;
  },
  {} as Record<CategoryId, Category>
);
