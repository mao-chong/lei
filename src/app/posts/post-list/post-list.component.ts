import { Component, OnDestroy, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { Post } from "../post.model";
import { PostsService } from "../posts.service";

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy {
    // public posts = [
    //     {title:'First Post',content:"This is the first post's content"},
    //     {title:'Second Post',content:"This is the second post's content"},
    //     {title:'Third Post',content:"This is the third post's content"}
    // ]
    posts: Post[] = []
    isLoading = false;
    totalPosts = 0;
    postsPerPage = 1;
    currentPage = 1;
    pageSizeOptions = [1, 2, 5, 10];
    userIsAuthenticated = false;
    userId:string;

    private postsSub: Subscription;
    private authStatusSub: Subscription;

    constructor(
        public PostsService: PostsService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.isLoading = true;
        this.PostsService.getPosts(this.postsPerPage, this.currentPage);
        this.userId = this.authService.getUserId();
        this.postsSub = this.PostsService.getPostUpdateListener()
            .subscribe((postData: { posts: Post[], postCount: number }) => {
                this.isLoading = false;
                this.posts = postData.posts;
                this.totalPosts = postData.postCount;
            })

        this.userIsAuthenticated = this.authService.getIsAuth();
        this.authStatusSub = this.authService
            .getAuthStatusListener()
            .subscribe(isAuthenticated => {
                this.userIsAuthenticated = isAuthenticated;
            });
    }

    ngOnDestroy(): void {
        this.postsSub.unsubscribe();
        this.authStatusSub.unsubscribe();
    }

    onDelete(postId: string) {
        this.isLoading = true;
        this.PostsService.deletePost(postId).subscribe(() => {
            this.PostsService.getPosts(this.postsPerPage, this.currentPage);
        },()=>{
            this.isLoading = false;
        });
    }

    onChangedPage(pageData: PageEvent) {
        this.isLoading = true;
        this.currentPage = pageData.pageIndex + 1;
        this.postsPerPage = pageData.pageSize;
        this.PostsService.getPosts(this.postsPerPage, this.currentPage);
    }
}