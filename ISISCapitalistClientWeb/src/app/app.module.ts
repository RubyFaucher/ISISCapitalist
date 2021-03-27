import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";

import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ProductComponent } from "./product/product.component";
import { MatToolbarModule } from "@angular/material/toolbar";
import { BigvaluePipe } from "./bigvalue.pipe";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatBadgeModule } from "@angular/material/badge";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";

import { SnackunlockComponent } from "./snackunlock/snackunlock.component";

@NgModule({
  declarations: [
    AppComponent,
    ProductComponent,
    BigvaluePipe,
    SnackunlockComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatButtonModule,
    MatChipsModule,
    MatSnackBarModule,
    MatBadgeModule,
    FormsModule,
    MatIconModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
