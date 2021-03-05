import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";
import { AuthService } from "../auth.service";


@Component({
    templateUrl:'./signup.component.html',
    styleUrls:['./signup.component.scss']
})

export class SignupComponent implements OnInit,OnDestroy{
    isLoading = false;
    private authStatusSub : Subscription;


    constructor(
        public authService:AuthService
    ){}

    ngOnInit(){
       this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
           authStatus=>{
               this.isLoading = false
           }
       );
    }

    onLogin(form:NgForm){

        if(form.invalid) return;
        
        this.isLoading = true;
        this.authService.createUser(form.value.email,form.value.password);


        // form.resetForm()
    }

    ngOnDestroy(){
        this.authStatusSub.unsubscribe();
    }
}