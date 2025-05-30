import { Component, Input, TrackByFunction } from '@angular/core';
import { CommonModule }                      from '@angular/common';
import { Producto }                          from '../producto/producto.model';

@Component({
  selector: 'app-cds',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './cds.component.html',
  styleUrls: ['./cds.component.css']
})
export class CdsComponent {
  @Input() mostSold!: Producto[];
  @Input() byGenre!: Producto[];
  @Input() onAdd!: (p: Producto) => void;
  @Input() onLogout!: () => void;
  @Input() onSwitch!: (view: 'vinilo' | 'cd') => void;

  trackByIndex: TrackByFunction<Producto> = (_i, _item) => _i;
}
