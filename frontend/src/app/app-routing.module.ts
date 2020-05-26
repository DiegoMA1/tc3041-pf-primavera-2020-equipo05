import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './modules/comprador/home/home.component';
import { NewsFeedComponent } from './modules/info/news-feed/news-feed.component';
import { ContactoComponent } from './modules/info/contacto/contacto.component';
import { PerfilComponent } from './modules/shared/perfil/perfil.component';
import { AgregarComponent } from './modules/vendedor/agregar/agregar.component';
import { EditarComponent } from './modules/vendedor/editar/editar.component';
import { ComprarComponent } from './modules/comprador/comprar/comprar.component';
import { LogInComponent } from './modules/shared/log-in/log-in.component';
import { CrearCuentaComponent } from './modules/shared/crear-cuenta/crear-cuenta.component';
import {CarritoComponent} from './modules/comprador/carrito/carrito.component';

const routes: Routes = [
  { path: '', component: HomeComponent, data: {animation: 'isLeft'} },
  { path: 'home', component: HomeComponent, data: {animation: 'isLeft'}  },
  { path: 'news-feed', component: NewsFeedComponent, data: {animation: 'isRight'}  },
  { path: 'contacto', component: ContactoComponent, data: {animation: 'isLeft'}  },
  { path: 'perfil', component: PerfilComponent, data: {animation: 'isRight'} },
  { path: 'crear-cuenta', component: CrearCuentaComponent, data: {animation: 'isLeft'} },
  { path: 'log-in', component: LogInComponent, data: {animation: 'isLeft'} },
  { path: 'editar', component: EditarComponent, data: {animation: 'isLeft'}  },
  { path: 'comprar', component: ComprarComponent, data: {animation: 'isRight'}  },
  { path: 'agregar', component: AgregarComponent, data: {animation: 'isLeft'}  },
  { path: 'carrito', component: CarritoComponent}
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
