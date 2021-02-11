import { Component } from '@angular/core';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from './world';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ISISCapitalistClientWeb';
  world: World = new World();
  server: string;
  qtmulti: string;

  constructor(private service: RestserviceService) {
    this.server = service.getServer();
    service.getWorld().then(
      world => {
        this.world = world;
        console.log(JSON.stringify(world))
      });
    this.qtmulti="x1";
  }
  onProductionDone(p: Product) {
    this.world.money += p.revenu;
    this.world.score += p.revenu;
  }
  changeCommutateur() {
    switch (this.qtmulti) {
      case "x1":
        this.qtmulti="x10";
        break;
      case "x10":
        this.qtmulti="x100";
        break;
      case "x100":
        this.qtmulti="xMax";
        break;
      case "xMax":
        this.qtmulti="x1";
        break;

    }
  }
}
