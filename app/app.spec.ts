import { TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS} from 'angular2/platform/testing/browser';
import { setBaseTestProviders } from 'angular2/testing';
import { IonicApp, Platform, MenuController }   from 'ionic-angular';
import { MyApp }           from './app';

// this needs doing _once_ for the entire test suite, hence it's here
setBaseTestProviders(TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS);

let redditApp : MyApp = null;

function getComponentStub(name: string): any {
  'use strict';

  let component: Object = {
    setRoot: function(): boolean { return true; },
    close: function(root: any): boolean { return true; },
  };
  return component;
}

export function main(): void {
  'use strict';

  describe('MyApp', () => {

    beforeEach(() => {
      let ionicApp: IonicApp = new IonicApp(null, null, null);
      let platform: Platform = new Platform();
      let menuController: MenuController = new MenuController();
      redditApp = new MyApp(ionicApp, platform, menuController);
    });

    it('initialises with a root page', () => {
      expect(redditApp['rootPage']).not.toBe(null);
    });

    it('initialises with an app', () => {
      expect(redditApp['app']).not.toBe(null);
    });

    it('initialises with one page', () => {
      expect(redditApp['pages'].length).toEqual(1);
    });

  });
}
