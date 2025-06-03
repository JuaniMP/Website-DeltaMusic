import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpresaService, Empresa } from '../../shared/empresa.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  empresa: Empresa | null = null;
  cargando = true;

  constructor(private empresaService: EmpresaService) {}

  ngOnInit(): void {
    this.empresaService.getEmpresa().subscribe({
      next: (data) => {
        this.empresa = data.length ? data[0] : null;
        this.cargando = false;
      },
      error: () => {
        this.empresa = null;
        this.cargando = false;
      }
    });
  }
}
