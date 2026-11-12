import type { RatingOption, SortOption } from '@/types/course';

export const sortOptions: SortOption[] = [
  { id: 'popular', label: 'Phổ biến' },
  { id: 'newest', label: 'Mới nhất' },
  { id: 'rating', label: 'Đánh giá cao' },
  { id: 'price_asc', label: 'Giá thấp đến cao' },
  { id: 'price_desc', label: 'Giá cao đến thấp' },
];

export const ratingOptions: RatingOption[] = [
  { id: '4.5', stars: 4.5, label: 'Từ 4.5 sao' },
  { id: '4.0', stars: 4.0, label: 'Từ 4.0 sao' },
  { id: '3.0', stars: 3.0, label: 'Từ 3.0 sao' },
];

export const priceRange = { minimum: 0, maximum: 5000000 };
