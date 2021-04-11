import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
import { Component, QueryList, ViewChildren } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ProductComponent } from "./product/product.component";
import { RestserviceService } from "./restservice.service";
import { SnackunlockComponent } from "./snackunlock/snackunlock.component";
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
  showCashUpgrades: boolean;
  showInvestors: boolean;
  showAngels: boolean;
  badgeManagers: number;
  badgeCashUpgrades: number;
  badgeInvestors: number;
  badgeAngels: number;
  username: string;

  constructor(
    private service: RestserviceService,
    private snackBar: MatSnackBar
  ) {
    this.server = service.getServer();
    this.qtmulti = "x1";
    this.showManagers = false;
    this.showUnlocks = false;
    this.showCashUpgrades = false;
    this.showInvestors = false;
    this.badgeManagers = 0;
    this.badgeCashUpgrades = 0;
    this.badgeInvestors = 0;
    this.badgeAngels = 0;
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
    window.location.reload();
  }

  onProductionDone(p: Product) {
    let countManagers = 0;
    let countUpgrades = 0;
    if (p.quantite > 0) {
      this.world.money +=
        p.quantite *
        p.revenu *
        (1 + (this.world.activeangels * this.world.angelbonus) / 100);
      this.world.score +=
        p.quantite *
        p.revenu *
        (1 + (this.world.activeangels * this.world.angelbonus) / 100);
    } else {
      this.world.money +=
        p.revenu *
        (1 + (this.world.activeangels * this.world.angelbonus) / 100);
      this.world.score +=
        p.revenu *
        (1 + (this.world.activeangels * this.world.angelbonus) / 100);
    }

    this.world.managers.pallier.forEach((manager) => {
      if (this.world.money >= manager.seuil && !manager.unlocked) {
        countManagers += 1;
      }
    });
    this.badgeManagers = countManagers;

    this.world.upgrades.pallier.forEach((upgrade) => {
      if (this.world.money >= upgrade.seuil && !upgrade.unlocked) {
        countUpgrades += 1;
      }
    });
    this.badgeCashUpgrades = countUpgrades;
  }

  onBuy(c: number) {
    let countManagers = 0;
    let countUpgrades = 0;
    this.world.money -= c;
    this.world.score -= c;
    this.world.managers.pallier.forEach((manager) => {
      if (this.world.money >= manager.seuil && !manager.unlocked) {
        countManagers += 1;
      }
    });

    this.badgeManagers = countManagers;
    this.world.upgrades.pallier.forEach((upgrade) => {
      if (this.world.money >= upgrade.seuil && !upgrade.unlocked) {
        countUpgrades += 1;
      }
    });
    this.badgeCashUpgrades = countUpgrades;

    this.world.products.product.forEach((produit) => {
      produit.palliers.pallier.forEach((unlock) => {
        if (produit.quantite >= unlock.seuil && !unlock.unlocked) {
          this.getUpgrade(unlock);
        }
      });
    });

    this.world.allunlocks.pallier.forEach((allunlock) => {
      let qte = 0;
      this.world.products.product.forEach((product) => {
        qte += product.quantite;
      });
      if (qte >= allunlock.seuil && !allunlock.unlocked) {
        this.getUpgrade(allunlock);
      }
    });
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
  changeShowCashUpgrades() {
    this.showCashUpgrades = !this.showCashUpgrades;
  }
  changeShowInvestors() {
    this.showInvestors = !this.showInvestors;
  }
  changeShowAngels() {
    this.showAngels = !this.showAngels;
  }
  hireManager(manager) {
    manager.unlocked = true;
    this.world.money -= manager.seuil;
    this.world.score -= manager.seuil;
    this.world.products.product[manager.idcible - 1].managerUnlocked = true;
    this.popMessage("Bravo, vous venez d'embaucher " + manager.name + "!!");
    this.badgeManagers -= 1;
    if (this.badgeManagers < 0) {
      this.badgeManagers = 0;
    }
    this.service.putManager(manager);
  }

  popMessage(message: string): void {
    this.snackBar.openFromComponent(SnackunlockComponent, {
      data: { html: message, icon: "" },
      duration: 2000,
      panelClass: ["green-snackbar"],
    });
  }

  getUpgrade(upgrade) {
    let pName = "Tous les produits";
    upgrade.unlocked = true;
    if (upgrade.idcible > 0) {
      this.produits.forEach((produit) => {
        if (produit.product.id == upgrade.idcible) {
          produit.calcUpgrade(upgrade);
          pName = produit.product.name;
        }
      });
    } else if (upgrade.idcible == -1) {
      this.world.angelbonus += upgrade.ratio;
    } else {
      this.produits.forEach((produit) => {
        produit.calcUpgrade(upgrade);
      });
    }

    this.popMessage(
      "Unlocked " +
        upgrade.name +
        ", " +
        pName +
        " " +
        upgrade.typeratio +
        " x" +
        upgrade.ratio +
        "!!"
    );

    this.service.putUpgrade(upgrade);
  }
  buyUpgrade(upgrade) {
    this.world.money -= upgrade.seuil;
    this.world.score -= upgrade.seuil;
    this.badgeCashUpgrades -= 1;
    if (this.badgeCashUpgrades < 0) {
      this.badgeCashUpgrades = 0;
    }
  }
  getAngel(angel) {
    let pName = "Tous les produits";
    angel.unlocked = true;
    if (angel.idcible > 0) {
      this.produits.forEach((produit) => {
        if (produit.product.id == angel.idcible) {
          produit.calcUpgrade(angel);
          pName = produit.product.name;
        }
      });
    } else if ((angel.idcible = -1)) {
      this.world.angelbonus += angel.ratio;
    } else {
      this.produits.forEach((produit) => {
        produit.calcUpgrade(angel);
      });
    }

    this.popMessage(
      "Unlocked " +
        angel.name +
        ", " +
        pName +
        " " +
        angel.typeratio +
        " x" +
        angel.ratio +
        "!!"
    );

    this.service.putAngelUpgrade(angel);
  }
  buyAngel(angel) {
    this.world.totalangels -= angel.seuil;
    this.badgeAngels -= 1;
    if (this.badgeAngels < 0) {
      this.badgeAngels = 0;
    }
  }
  calcNbrAngels() {
    let nbrAnges = 0;
    nbrAnges = Math.floor(
      150 * Math.sqrt(this.world.score / 10 ** 15) - this.world.totalangels
    );
    return nbrAnges;
  }

  hireAngel(angel) {
    angel.unlocked = true;
    this.world.money -= angel.seuil;
    this.world.score -= angel.seuil;
    this.world.products.product[angel.idcible - 1].managerUnlocked = true;
    this.popMessage("Bravo, vous venez d'embaucher " + angel.name + "!!");
    this.badgeManagers -= 1;
    if (this.badgeManagers < 0) {
      this.badgeManagers = 0;
    }
  }
  restart() {
    this.service.deleteWorld().then(() => {
      window.location.reload();
    });
  }
}
