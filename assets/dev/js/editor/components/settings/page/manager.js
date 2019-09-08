import Component from './component';
import Container from '../../../container/container';

var BaseSettings = require( 'elementor-editor/components/settings/base/manager' );

module.exports = BaseSettings.extend( {
	onInit: function() {
		BaseSettings.prototype.onInit.apply( this );

		$e.components.register( new Component( { manager: this } ) );
	},

	getEditedView() {
		const editModel = new Backbone.Model( {
			id: 'document',
			elType: 'document',
			settings: elementor.settings.page.model,
		} );

		const container = new Container( {
			id: editModel.id,
			document: elementor.getPreviewContainer(),
			view: '@see page/manager.js',
			model: editModel,
			settings: editModel.get( 'settings' ),
			renderer: false,
		} );

		return {
			getContainer: () => container,
			getEditModel: () => editModel,
			model: editModel,
		};
	},

	save: function() {},

	changeCallbacks: {
		post_title: function( newValue ) {
			var $title = elementorFrontend.elements.$document.find( elementor.config.page_title_selector );

			$title.text( newValue );
		},

		template: function() {
			elementor.saver.saveAutoSave( {
				onSuccess: function() {
					elementor.reloadPreview();

					elementor.once( 'preview:loaded', function() {
						$e.route( 'panel/page-settings/settings' );
					} );
				},
			} );
		},
	},

	onModelChange: function() {
		elementor.saver.setFlagEditorChange( true );

		BaseSettings.prototype.onModelChange.apply( this, arguments );
	},

	getDataToSave: function( data ) {
		data.id = elementor.config.document.id;

		return data;
	},
} );
