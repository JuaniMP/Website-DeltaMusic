import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { AuthService }       from '../auth/auth.service';

interface Album {
  title: string;
  artist: string;
  imageUrl: string;
  price: string;
}

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [ CommonModule ],   // para NgFor, NgIf…
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {
  user: any;
  view: 'vinilo' | 'cd' = 'vinilo';

  mostSold: Album[] = [
    {
      title: 'Abbey Road',
      artist: 'The Beatles',
      imageUrl: '/assets/images/beatles.png',
      price: '$20.000 COP'
    },
    {
      title: 'Thriller',
      artist: 'Michael Jackson',
      imageUrl: '/assets/images/thriller.png',
      price: '$18.000 COP'
    },
    {
      title: 'Back in Black',
      artist: 'AC/DC',
      imageUrl: '/assets/images/back-in-black.png',
      price: '$15.000 COP'
    },
    {
      title: 'The Dark Side of the Moon',
      artist: 'Pink Floyd',
      imageUrl: '/assets/images/dark-side.png',
      price: '$22.000 COP'
    }
  ];

  byGenre: Album[] = [
    {
      title: 'Comedia',
      artist: 'Hector Lavoe',
      imageUrl: '/assets/images/comedia.png',
      price: '$17.000 COP'
    },
    {
      title: 'Huellas del Pasado',
      artist: 'Various Artists',
      imageUrl: '/assets/images/huellas.png',
      price: '$16.000 COP'
    },
    {
      title: 'Triunfo',
      artist: 'Grupo Niche',
      imageUrl: '/assets/images/triunfo.png',
      price: '$19.000 COP'
    },
    {
      title: 'El Benzo',
      artist: 'Benzo Martínez',
      imageUrl: '/assets/images/elbenzo.png',
      price: '$14.000 COP'
    }
  ];

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.getUser();
  }

  switchView(mode: 'vinilo' | 'cd'): void {
    this.view = mode;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
