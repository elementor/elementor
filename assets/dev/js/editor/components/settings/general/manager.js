import Component from './component';

var BaseSettings = require( 'elementor-editor/components/settings/base/manager' );

module.exports = BaseSettings.extend( {
	onInit: function() {
		BaseSettings.prototype.onInit.apply( this );

		$e.components.register( new Component( { manager: this } ) );
	},

	changeCallbacks: {
		elementor_page_title_selector: function( newValue ) {
			var newSelector = newValue || 'h1.entry-title',
				titleSelectors = elementor.settings.page.model.controls.hide_title.selectors = {};

			titleSelectors[ newSelector ] = 'display: none';

			elementor.settings.page.updateStylesheet();
		},
	},

	getEditedView() {
		const editModel = new Backbone.Model( {
			id: 'general_settings',
			elType: 'general_settings',
			settings: elementor.settings.general.model,
		} );

		const container = new elementorModules.editor.Container( {
			type: 'TODO: @see general/manager.js',
			id: editModel.id,
			document: elementor.getPreviewContainer(),
			model: editModel,
			settings: editModel.get( 'settings' ),
			view: 'TODO: @see general/manager.js',
			label: elementor.translate( 'global_settings' ),
			controls: editModel.controls,
			renderer: false,
		} );

		return {
			getContainer: () => container,
			getEditModel: () => editModel,
			model: editModel,
		};
	},
} );
