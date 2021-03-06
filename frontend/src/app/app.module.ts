import { BrowserModule } from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './modules/comprador/home/home.component';
import { NewsFeedComponent } from './modules/info/news-feed/news-feed.component';
import { ContactoComponent } from './modules/info/contacto/contacto.component';
import { PerfilComponent } from './modules/shared/perfil/perfil.component';
import { AgregarComponent } from './modules/vendedor/agregar/agregar.component';
import { EditarComponent } from './modules/vendedor/editar/editar.component';
import { ComprarComponent } from './modules/comprador/comprar/comprar.component';
import { LogInComponent } from './modules/shared/log-in/log-in.component';
import { CrearCuentaComponent } from './modules/shared/crear-cuenta/crear-cuenta.component';
import { CarritoComponent} from './modules/comprador/carrito/carrito.component';
import { ValidarCompraComponent} from './modules/comprador/validar-compra/validar-compra.component';
import { MainComponentsModule } from './main-components/main-components.module';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NewsFeedComponent,
    ContactoComponent,
    PerfilComponent,
    AgregarComponent,
    EditarComponent,
    ComprarComponent,
    LogInComponent,
    CrearCuentaComponent,
    CarritoComponent,
    ValidarCompraComponent

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MainComponentsModule,
    BrowserModule,
    FormsModule,
    MDBBootstrapModule.forRoot(),
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
