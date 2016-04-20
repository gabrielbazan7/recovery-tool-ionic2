import {Article} from '../pages/reddit-main/reddit-main';

export let sort = function(articles){
    return articles.sort((a: Article, b: Article) => b.votes - a.votes);
};
