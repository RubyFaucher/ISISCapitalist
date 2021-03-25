import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
import { Component, QueryList, ViewChildren } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ProductComponent } from "./product/product.component";
import { RestserviceService } from "./restservice.service";
import { World, Product, Pallier } from "./world";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  @ViewChildren(ProductComponent) public produits: QueryList<ProductComponent>;
  title = "ISISCapitalistClientWeb";
  world: World = new World();
  server: string;
  qtmulti: string;
  showManagers: boolean;
  showUnlocks: boolean;
  badgeManagers: number;
  badgeUnlocks: number;
  username: string;

  constructor(
    private service: RestserviceService,
    private snackBar: MatSnackBar
  ) {
    this.server = service.getServer();
    this.qtmulti = "x1";
    this.showManagers = false;
    this.showUnlocks = false;
    this.badgeManagers = 0;
    this.badgeUnlocks = 0;
    this.username = localStorage.getItem("username");
    if (
      this.username == "null" ||
      this.username == null ||
      this.username == ""
    ) {
      this.username = "Captain" + Math.floor(Math.random() * 10000);
    }
    this.service.user = this.username;
    service.getWorld().then((world) => {
      this.world = world;
    });
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
    let countUnlocks = 0;
    this.world.money -= c;
    this.world.score -= c;
    this.world.managers.pallier.forEach((manager) => {
      if (this.world.money >= manager.seuil && !manager.unlocked) {
        countManagers += 1;
      }
    });
    this.badgeManagers = countManagers;

    this.world.upgrades.pallier.forEach((unlock) => {
      if (
        this.world.products.product[unlock.idcible - 1].quantite >=
          unlock.seuil &&
        !unlock.unlocked
      ) {
        countUnlocks += 1;
      }
    });
    this.badgeUnlocks = countUnlocks;
    this.world.allunlocks.pallier.forEach((allunlock) => {
      let qte = 0;
      this.world.products.product.forEach((product) => {
        qte += product.quantite;
      });
      if (qte >= allunlock.seuil && !allunlock.unlocked) {
        countUnlocks += 1;
      }
    });
    this.badgeUnlocks = countUnlocks;
  }
  countQuantity() {
    let qte = 0;
    this.world.products.product.forEach((product) => {
      qte += product.quantite;
    });
    return qte;
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
  changeShowUnlocks() {
    this.showUnlocks = !this.showUnlocks;
  }
  hireManager(manager) {
    manager.unlocked = true;
    this.world.money -= manager.seuil;
    this.world.score -= manager.seuil;
    this.world.products.product[manager.idcible - 1].managerUnlocked = true;
    this.popMessage("Bravo, vous venez d'embaucher " + manager.name);
    this.badgeManagers -= 1;
    if (this.badgeManagers < 0) {
      this.badgeManagers = 0;
    }
    this.service.putManager(manager);
  }
  popMessage(message: string): void {
    this.snackBar.open(message, "", { duration: 2000 });
  }

  getUnlock(unlock) {
    unlock.unlocked = true;
    if (unlock.idcible != 0) {
      this.produits.forEach((produit) => {
        if (produit.product.id == unlock.idcible) {
          produit.calcUpgrade(unlock);
        }
      });
    } else {
      this.produits.forEach((produit) => {
        produit.calcUpgrade(unlock);
      });
    }

    this.popMessage(unlock.name + " " + unlock.typeratio + " x" + unlock.ratio);
    this.badgeUnlocks -= 1;
    if (this.badgeUnlocks < 0) {
      this.badgeUnlocks = 0;
    }
  }
}
