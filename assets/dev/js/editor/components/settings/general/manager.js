var BaseSettings = require( 'elementor-editor/components/settings/base/manager' );

module.exports = BaseSettings.extend( {
	changeCallbacks: {
		page_title_selector: function( newValue ) {
			var newSelector = newValue || 'h1.entry-title',
				titleSelectors = elementor.settings.page.model.controls.hide_title.selectors = {};

			titleSelectors[ newSelector ] = 'display: none';

			elementor.settings.page.updateStylesheet();
		}
	}
} );
