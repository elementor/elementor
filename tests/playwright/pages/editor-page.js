const { addWidget } = require( '../assets/addWidget' );
exports.editorPage = class editorPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor( page ) {
    this.page = page;
    this.previewFrame = page.frame( { name: 'elementor-preview-iframe' } );
  }

  async addWidgitByName( widgitName ) {
    await this.page.waitForSelector( '#elementor-panel-header-title' );
    await this.page.waitForSelector( 'iframe#elementor-preview-iframe' );
    await this.page.waitForTimeout( 5000 );
    await this.page.evaluate( addWidget, widgitName );
  }
};
