import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { RestserviceService } from '../restservice.service';
import { Product } from '../world';


@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  product: Product;
  server: String;
  progressbarvalue: number;
  lastupdate: number;
  


  @Input()
  set prod(value: Product) {
    this.product= value;
  }


  constructor(private service: RestserviceService) {
    this.server = service.getServer(); 
  }
  startFabrication(){
    console.log("jbkzb")
    this.product.timeleft=this.product.vitesse;
    
    this.lastupdate=Date.now();
    
  }

  calcScore(){
    if(this.product.timeleft>0){
      let tempsecoule= Date.now() - this.lastupdate;
      this.product.timeleft= this.product.timeleft -(tempsecoule );
      this.progressbarvalue=  ((this.product.vitesse -this.product.timeleft)    / this.product.vitesse) * 100
    }
    else if (this.product.timeleft<=0){
      if(this.product.timeleft<0){
        this.product.timeleft=0;
      }
      else{
        this.progressbarvalue = 0;
      }
    }

  }

  ngOnInit(): void {
    setInterval(() =>{ this.calcScore(); }, 100);
    this.progressbarvalue=0;
  }
  
}
