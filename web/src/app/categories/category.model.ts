/** Keep in sync with api/src/categories/category-colors.ts. */
export const CATEGORY_COLORS = [
  { value: '#e5534b', label: 'Rojo' },
  { value: '#f0883e', label: 'Naranja' },
  { value: '#d4a72c', label: 'Amarillo' },
  { value: '#57ab5a', label: 'Verde' },
  { value: '#39c5cf', label: 'Cian' },
  { value: '#539bf5', label: 'Azul' },
  { value: '#986ee2', label: 'Violeta' },
  { value: '#768390', label: 'Gris' },
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number]['value'];

export interface Category {
  id: number;
  name: string;
  color: CategoryColor;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  color: CategoryColor;
}
