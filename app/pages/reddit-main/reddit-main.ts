import {Page} from 'ionic-angular';
import {ArticleComponent} from '../reddit-article/reddit-article';
import * as ArticleService from '../../service/service';

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
  domain(): string {
     try {
      const link: string = this.link.split('//')[1];
      return link.split('/')[0];
    }
    catch (err) {
      return null;
    }
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
    return ArticleService.sort(this.articles);
  }
}
