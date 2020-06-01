import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {Product} from '../interfaces/product';
import { HttpClient, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import { map, catchError, tap} from 'rxjs/operators';
import { Observable } from 'rxjs';
const endpoint = 'http://104.154.210.48:8080/api/';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  result: any;
  usr: any;
  product: Product;
  products: any;
  httpOptions = {
    headers: new HttpHeaders({
      'Access-Control-Allow-Origin': '*'
    })
  };
  constructor(private router: Router, private http: HttpClient) { }


  addUser(user: any) {
    return this.http.post(endpoint + 'users', user);
  }

  login(user) {

    console.log(localStorage.getItem('idUser'));

    if (localStorage.getItem('idUser') === null || localStorage.getItem('idUser') === undefined){
      console.log('User null');
      this.http.post(endpoint + 'login', user).subscribe(data => {
        console.log(data);
        this.usr = data;
        this.usr = this.usr.key._id;
        localStorage.setItem('idUser', this.usr); // Obtener ID usuario
        console.log(this.usr);
        this.router.navigateByUrl('/home');
      },
      error => {
        alert(error.error.message);
      });
    }
    else{
      this.usr = localStorage.getItem('idUser');
      console.log(this.usr);
      this.router.navigateByUrl('/home');

    }

  }

  logout() {
    this.usr = '';
    localStorage.removeItem('idUser');
    return this.http.get(endpoint + 'logout');
  }

  getProducts(i){
    return this.http.get(endpoint + 'allProducts/' + i);
  }

  getProductsUser() {
    return this.http.get(endpoint + 'productsUsers/' + this.usr);
  }

  getCarritoUser() {
    console.log('this.usr: ' + this.usr);
    return this.http.get(endpoint + 'carrito/' + this.usr);
  }

  getCompraUser() {
    console.log('this.usr: ' + this.usr);
    return this.http.get(endpoint + 'compra/' + this.usr);
  }

  validarCompra(validacion: any, comentario: any){
    console.log('this.usr: ' + this.usr);
    return this.http.put(endpoint + 'validarCompra/' + this.usr, {validation: validacion, comment: comentario});
  }

  getProduct(id) {
    return this.http.get(endpoint + 'products/' + id);
  }

  addProduct(datos: any) {
    delete datos.idProd;
    console.log('this.usr: ' + this.usr);
    const prod = Object.assign({idUser: this.usr}, datos);
    return this.http.post(endpoint + 'productsUsers', prod);
  }

  addProductToCarrito(id) {
    console.log(id);
    return this.http.post(endpoint + 'carrito/' + this.usr, {idProd: id});
  }

  buyProduct(datos: any) {
    return this.http.post(endpoint + 'compra/' + this.usr, {address: datos});
  }

  removeProductFromCarrito(id) {
    console.log(this.usr);
    console.log(id);
    console.log('this.usr: ' + this.usr);
    return this.http.request('delete', endpoint + 'carrito/' + this.usr, { body: {idProd: id } });
  }

  removeProduct(id){
    return this.http.delete(endpoint + 'products/' + id);
  }

  setProduct(product){
    this.product = product;
  }

  getUser() {
    this.usr = localStorage.getItem('idUser');
    console.log('this.usr: ' + this.usr);
    return this.usr;
  }

  setUser(user) {
    this.usr = user;
  }

  updateProduct(id, product){
    return this.http.put(endpoint + 'products/' + id, product);
  }
}
