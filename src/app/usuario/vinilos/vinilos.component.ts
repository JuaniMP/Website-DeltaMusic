// src/app/usuario/vinilos/vinilos.component.ts
import { Component, Input, TrackByFunction } from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { Producto }                         from '../producto/producto.model';

@Component({
  selector: 'app-vinilos',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './vinilos.component.html',
  styleUrls: ['./vinilos.component.css']
})
export class VinilosComponent {
  @Input() mostSold!: Producto[];
  @Input() byGenre!: Producto[];
  @Input() onAdd!: (p: Producto) => void;
  @Input() onSwitch!: (view: 'vinilo' | 'cd') => void;
  @Input() onLogout!: () => void;
  @Input() onCart!: () => void;             // ← este faltaba

  trackByIndex: TrackByFunction<Producto> = (_i, _item) => _i;
  onImgError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = 'assets/images/vinilo-icon.png';
}

}
