import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CATEGORY_COLORS, CategoryColor } from '../category.model';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-category-manager',
  templateUrl: './category-manager.html',
})
export class CategoryManager implements OnInit {
  protected readonly categoryService = inject(CategoryService);
  protected readonly colors = CATEGORY_COLORS;

  protected readonly name = signal('');
  protected readonly color = signal<CategoryColor>(CATEGORY_COLORS[0].value);
  protected readonly canSubmit = computed(() => this.name().trim().length > 0);

  ngOnInit(): void {
    this.categoryService.load();
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit()) {
      return;
    }
    this.categoryService.create({ name: this.name().trim(), color: this.color() });
    this.name.set('');
  }
}
