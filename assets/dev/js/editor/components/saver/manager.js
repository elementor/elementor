var Module = require( 'elementor-utils/module' );

module.exports = Module.extend( {
	autoSaveTimer: null,

	isSaving: false,

	__construct: function() {
		this.setWorkSaver();

		this.autoSaveTimer = window.setInterval( _.bind( this.doAutoSave, this ), 15000 );
	},

	doAutoSave: function() {
		if ( ! this.isEditorChanged() || this.isSaving ) {
			return;
		}

		this.saveDraft();
	},

	saveDraft: function() {
		this.saveEditor( {
			status: 'autosave'
		} );
	},

	update: function() {
		this.saveEditor( {
			status: elementor.config.settings.page.settings.post_status
		} );
	},

	publish: function() {
		this.saveEditor( {
			status: 'publish'
		} );
	},

	setFlagEditorChange: function( status ) {
		elementor.channels.editor
			.reply( 'status', status )
			.trigger( 'status:change', status );
	},

	isEditorChanged: function() {
		return ( true === elementor.channels.editor.request( 'status' ) );
	},

	setWorkSaver: function() {
		var self = this;
		elementor.$window.on( 'beforeunload', function() {
			if ( self.isEditorChanged() ) {
				return elementor.translate( 'before_unload_alert' );
			}
		} );
	},

	saveEditor: function( options ) {
		options = _.extend( {
			status: 'draft',
			onSuccess: null
		}, options );

		var self = this,
			newData = elementor.elements.toJSON( { removeDefault: true } );

		self.trigger( 'before:save' )
			.trigger( 'before:save:' + options.status );

		return elementor.ajax.send( 'save_builder', {
			data: {
				post_id: elementor.config.post_id,
				status: options.status,
				data: JSON.stringify( newData )
			},
			success: function( data ) {
				self.setFlagEditorChange( false );

				elementor.config.data = newData;

				elementor.channels.editor.trigger( 'saved', data );

				self.trigger( 'after:save', data )
					.trigger( 'after:save:' + options.status, data );

				if ( _.isFunction( options.onSuccess ) ) {
					options.onSuccess.call( this, data );
				}
			}
		} );
	}
} );
