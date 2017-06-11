import { DrrrClientPage } from './app.po';

describe('drrr-client App', () => {
  let page: DrrrClientPage;

  beforeEach(() => {
    page = new DrrrClientPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
