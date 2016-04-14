import {Page} from 'ionic-angular';
import {IONIC_DIRECTIVES} from 'ionic-angular';
import {Component} from 'angular2/core';

export class Article {
  title: string;
  link: string;
  votes: number;
  constructor(title: string, link: string, votes?: number) {
    this.title = title;
    this.link = link;
    this.votes = votes || 0;
  }
  voteUp(): void{
    this.votes += 1;
  }
  voteDown(): void{
    this.votes -= 1;
  }
  domain(): string { try {
    const link: string = this.link.split('//')[1];
    return link.split('/')[0]; } catch (err) {
      return null;
    }
  }
}

@Component({
  selector:'reddit-article',
  inputs: ['article'],
  templateUrl: 'build/pages/reddit-main/reddit-article.html',
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

@Page({
  selector:'reddit',
  templateUrl: 'build/pages/reddit-main/reddit-main.html',
  directives: [ArticleComponent]
})
export class RedditApp {
  articles: Article[];
  constructor() {
    this.articles = [];
  }

  addArticle(title: HTMLInputElement, link: HTMLInputElement): void {
    console.log(`Adding article title: ${title.value} and link: ${link.value}`);
    this.articles.push(new Article(title.value, link.value, 0));
    title.value = '';
    link.value = '';
  }
  sortedArticles(): Article[] {
    return this.articles.sort((a: Article, b: Article) => b.votes - a.votes);
  }
}
