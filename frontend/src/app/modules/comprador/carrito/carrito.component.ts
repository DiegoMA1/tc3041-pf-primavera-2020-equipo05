import { Component, OnInit } from '@angular/core';
import {UserService} from '../../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss']
})
export class CarritoComponent implements OnInit {
  carrito: any;
  total = 0;
  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.userService.getCarritoUser().subscribe(carrito => {
      this.carrito = carrito[0];
      for (let index = 0; index < this.carrito.products.length; index++) {
        this.total += this.carrito.products[index].price;
        console.log("Price "+ this.carrito.products[index].price);
      }
    });

  }

  eliminarDelCarrito(id) {
    this.userService.removeProductFromCarrito(id).subscribe(data => {
      alert("Producto eliminado del carrito")
    },
    error => {
      console.log(error)
    });
  }


}
