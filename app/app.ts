// import 'es6-shim';
import {App, IonicApp, Platform, MenuController} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {RedditApp} from './pages/reddit-main/reddit-main';


@App({
  templateUrl: 'build/app.html',
  config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
export class MyApp {
  // make RedditApp the root (or first) page
  rootPage: any = RedditApp;
  pages: Array<{title: string, component: any}>;

  constructor(
    private app: IonicApp,
    private platform: Platform,
    private menu: MenuController
  ) {
    this.initializeApp();

    // set our app's pages
    this.pages = [{ title: 'Post in reddit', component: RedditApp }];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    let nav = this.app.getComponent('nav');
    nav.setRoot(page.component);
  }
}
