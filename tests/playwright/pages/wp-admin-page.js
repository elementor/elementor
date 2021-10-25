exports.wpAdminPage = class wpAdminPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor( page ) {
    this.page = page;
  }

  async goto() {
    await this.page.goto( '/wp-admin' );
  }

  async login() {
    const loggedIn = await this.page.$( 'text=Dashboard' );
    if ( loggedIn ) {
      return;
    }
    await this.page.waitForSelector( 'text=Log In' );
    await this.page.fill( 'input[name="log"]', 'admin' );
    await this.page.fill( 'input[name="pwd"]', 'password' );
    await this.page.click( 'text=Log In' );
    await this.page.waitForSelector( 'text=Dashboard' );
  }

  async openNewPage() {
    try {
      await this.page.click( 'text=Create New Page', { timeout: 5000 } );
    } catch ( err ) {
      console.error( "Click on Elementor 'Create New Page' button failed" );
      await this.page.waitForSelector( 'text=Dashboard' );
      await this.page.click( 'text=Pages' );
      await Promise.all( [
        this.page.waitForNavigation( { url: '/wp-admin/post-new.php?post_type=page' } ),
        this.page.click( 'div[role="main"] >> text=Add New' ),
      ] );
      await Promise.all( [
        this.page.waitForNavigation(),
        this.skipTutorial(),
        this.page.click( 'text=← Back to WordPress Editor Edit with Elementor' ),
      ] );
    }
    await this.page.waitForSelector( '#elementor-panel-header-title' );
  }

  async skipTutorial() {
    await this.page.waitForTimeout( 1000 );
    const next = await this.page.$( "text='Next'" );
    if ( next ) {
      await this.page.click( '[aria-label="Close dialog"]' );
    }
  }

  async createNewPage() {
    await this.goto();
    await this.login();
    await this.openNewPage();
  }
};
