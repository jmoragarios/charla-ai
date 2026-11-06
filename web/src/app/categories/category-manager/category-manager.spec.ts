import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Category } from '../category.model';
import { CategoryService } from '../category.service';
import { CategoryManager } from './category-manager';

describe('CategoryManager', () => {
  let fixture: ComponentFixture<CategoryManager>;
  let element: HTMLElement;

  const category: Category = {
    id: 3,
    name: 'Trabajo',
    color: '#539bf5',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
  const categoryService = {
    categories: signal<Category[]>([]),
    load: vi.fn(),
    create: vi.fn(),
    remove: vi.fn(),
  };

  const submitButton = () =>
    element.querySelector<HTMLButtonElement>('.category-form button[type=submit]')!;

  beforeEach(async () => {
    vi.resetAllMocks();
    categoryService.categories.set([category]);

    await TestBed.configureTestingModule({
      imports: [CategoryManager],
      providers: [{ provide: CategoryService, useValue: categoryService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryManager);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('loads categories on init', () => {
    expect(categoryService.load).toHaveBeenCalled();
  });

  it('renders the categories with their color', () => {
    const chip = element.querySelector<HTMLElement>('.categories .category-chip');
    expect(chip?.textContent).toContain('Trabajo');
    expect(chip?.style.getPropertyValue('--chip-color')).toBe('#539bf5');
  });

  it('shows an empty message when there are no categories', async () => {
    categoryService.categories.set([]);
    await fixture.whenStable();

    expect(element.querySelector('.categories .empty')?.textContent).toContain(
      'No hay categorías',
    );
  });

  it('removes a category', () => {
    element.querySelector<HTMLButtonElement>('.delete-category')?.click();

    expect(categoryService.remove).toHaveBeenCalledWith(category);
  });

  it('offers the fixed palette with the first color selected', () => {
    const swatches = element.querySelectorAll<HTMLButtonElement>('.color-swatch');
    expect(swatches).toHaveLength(8);
    expect(swatches[0].getAttribute('aria-pressed')).toBe('true');
    expect(swatches[1].getAttribute('aria-pressed')).toBe('false');
  });

  it('disables submit while the name is empty', () => {
    expect(submitButton().disabled).toBe(true);
  });

  it('creates a category with the chosen color and clears the name', async () => {
    const input = element.querySelector<HTMLInputElement>('#category-name')!;
    input.value = '  Casa ';
    input.dispatchEvent(new Event('input'));
    element.querySelectorAll<HTMLButtonElement>('.color-swatch')[3].click();
    await fixture.whenStable();

    element.querySelector('.category-form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(categoryService.create).toHaveBeenCalledWith({ name: 'Casa', color: '#57ab5a' });
    expect(input.value).toBe('');
  });
});
