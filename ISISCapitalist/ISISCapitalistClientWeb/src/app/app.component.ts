import { Component } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { RestserviceService } from "./restservice.service";
import { World, Product, Pallier } from "./world";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "ISISCapitalistClientWeb";
  world: World = new World();
  server: string;
  qtmulti: string;
  showManagers: boolean;
  badgeManagers: number;
  username: string;

  constructor(
    private service: RestserviceService,
    private snackBar: MatSnackBar
  ) {
    this.server = service.getServer();
    service.getWorld().then((world) => {
      this.world = world;
    });
    this.qtmulti = "x1";
    this.showManagers = false;
    this.badgeManagers = 0;
    this.username = localStorage.getItem("username");
    if (
      this.username == "null" ||
      this.username == null ||
      this.username == ""
    ) {
      this.username = "Captain" + Math.floor(Math.random() * 10000);
    }
  }

  onUsernameChanged() {
    if (this.username == "") {
      this.username = "Captain" + Math.floor(Math.random() * 10000);
    }
    localStorage.setItem("username", this.username);
    this.service.user = this.username;
  }
  onProductionDone(p: Product) {
    let countManagers = 0;
    this.world.money += p.revenu;
    this.world.score += p.revenu;
    this.world.managers.pallier.forEach((manager) => {
      if (this.world.money >= manager.seuil && !manager.unlocked) {
        countManagers += 1;
      }
    });
    this.badgeManagers = countManagers;
  }

  onBuy(c: number) {
    let countManagers = 0;
    this.world.money -= c;
    this.world.score -= c;
    this.world.managers.pallier.forEach((manager) => {
      if (this.world.money >= manager.seuil && !manager.unlocked) {
        countManagers += 1;
      }
    });
    this.badgeManagers = countManagers;
  }
  changeCommutateur() {
    switch (this.qtmulti) {
      case "x1":
        this.qtmulti = "x10";
        break;
      case "x10":
        this.qtmulti = "x100";
        break;
      case "x100":
        this.qtmulti = "xMax";
        break;
      case "xMax":
        this.qtmulti = "x1";
        break;
    }
  }

  changeShowManagers() {
    this.showManagers = !this.showManagers;
  }
  hireManager(manager) {
    manager.unlocked = true;
    this.world.money -= manager.seuil;
    this.world.products.product[manager.idcible - 1].managerUnlocked = true;
    this.popMessage("Bravo, vous venez d'embaucher " + manager.name);
    this.badgeManagers -= 1;
  }
  popMessage(message: string): void {
    this.snackBar.open(message, "", { duration: 2000 });
  }
}
