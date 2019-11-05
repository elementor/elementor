import Component from './component';

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

		const container = new elementorModules.editor.Container( {
			type: 'TODO: @see page/manager.js',
			id: editModel.id,
			document: elementor.getPreviewContainer(),
			model: editModel,
			settings: editModel.get( 'settings' ),
			view: 'TODO: @see page/manager.js',
			label: elementor.config.document.panel.title,
			controls: editModel.controls,
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
			$e.run( 'document/save/auto', {
				options: {
					onSuccess: function() {
						elementor.reloadPreview();

						elementor.once( 'preview:loaded', function() {
							$e.route( 'panel/page-settings/settings' );
						} );
					},
				},
			} );
		},
	},

	onModelChange: function() {
		$e.run( 'document/save/saver', { status: true } );

		BaseSettings.prototype.onModelChange.apply( this, arguments );
	},

	getDataToSave: function( data ) {
		data.id = elementor.config.document.id;

		return data;
	},
} );
