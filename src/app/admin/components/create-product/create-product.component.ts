// src/app/admin/components/create-product/create-product.component.ts
import { Component, OnInit }             from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductoService }               from '../../services/producto.service';
import { Producto }                      from '../../models/producto.model';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule ],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css']
})
export class CreateProductComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  private productId?: number;

  constructor(
    private fb: FormBuilder,
    private svc: ProductoService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      referencia:        ['', Validators.required],
      descripcion:       ['', Validators.required],
      precioVentaActual: [0, [Validators.required, Validators.min(0)]],
      existencia:        [0, [Validators.required, Validators.min(0)]],
      estado:            [true]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        this.productId = +id;
        this.svc.getById(this.productId).subscribe(prod => {
          this.form.patchValue({
            referencia: prod.referencia,
            descripcion: prod.descripcion,
            precioVentaActual: prod.precioVentaActual,
            existencia: prod.existencia,
            estado: prod.estado === 1
          });
        });
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;
    const payload: Producto = {
      ...(this.isEdit ? { id: this.productId } : {}),
      referencia:        raw.referencia,
      descripcion:       raw.descripcion,
      precioVentaActual: raw.precioVentaActual,
      existencia:        raw.existencia,
      estado:            raw.estado ? 1 : 0
    };

    this.svc.save(payload).subscribe({
      next: () => this.router.navigate(['/admin/products']),
      error: err => console.error('Error guardando producto', err)
    });
  }

  cancel() {
    this.router.navigate(['/admin/products']);
  }
}
