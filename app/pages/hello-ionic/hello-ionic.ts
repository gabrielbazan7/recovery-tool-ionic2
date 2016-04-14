import {
  Page
} from 'ionic-angular';


@Page({
  selector: 'reddit',
  templateUrl: 'build/pages/hello-ionic/hello-ionic.html'
})
export class HelloIonicPage {
  name: string;
  constructor() {
    this.name = 'Gabriel';
  }
  addArticle(title: HTMLInputElement, link: HTMLInputElement): void{
    console.log(`Adding article title: ${title.value} and link: ${link.value}`);
  }
}

@Page({
  selector: 'reddit-article',
  templateUrl: 'build/pages/hello-ionic/hello-ionic.html'
})
export class ArticleComponent {
  votes: number;
  title: string;
  link: string;
  constructor() {
    this.title = 'Angular 2';
    this.link = 'http://angular.io';
    this.votes = 10;
  }
  voteUp() {
    this.votes += 1;
  }
  voteDown() {
    this.votes -= 1;
  }
}
