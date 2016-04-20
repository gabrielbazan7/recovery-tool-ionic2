import {IONIC_DIRECTIVES} from 'ionic-angular';
import {Component} from 'angular2/core';
import {Article} from '../reddit-main/reddit-main';

@Component({
  selector:'reddit-article',
  inputs: ['article'],
  templateUrl: 'build/pages/reddit-article/reddit-article.html',
  directives: [IONIC_DIRECTIVES]
})
export class ArticleComponent {
  article: Article;

  voteUp(): boolean {
    this.article.voteUp();
    return false;
  }
  voteDown(): boolean {
    this.article.voteDown();
    return false;
  }

}
