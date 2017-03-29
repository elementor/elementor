var ControlsStack = require( 'elementor-views/controls-stack' ),
	EditorView;

EditorView = ControlsStack.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-editor-content' ),

	id: 'elementor-panel-page-editor',

	childViewContainer: '#elementor-controls',

	childViewOptions: function() {
		return {
			elementSettingsModel: this.model.get( 'settings' ),
			elementEditSettings: this.model.get( 'editSettings' )
		};
	},

	activateSection: function( sectionName ) {
		ControlsStack.prototype.activateSection.apply( this, arguments );

		elementor.channels.editor.trigger( 'section:activated', sectionName, this );
	},

	onBeforeRender: function() {
		var controls = elementor.getElementControls( this.model );

		if ( ! controls ) {
			throw new Error( 'Editor controls not found' );
		}

		// Create new instance of that collection
		this.collection = new Backbone.Collection( _.values( controls ) );
	},

	onDestroy: function() {
		var editedElementView = this.getOption( 'editedElementView' );

		if ( editedElementView ) {
			editedElementView.$el.removeClass( 'elementor-element-editable' );
		}

		this.model.trigger( 'editor:close' );

		this.triggerMethod( 'editor:destroy' );
	},

	onRender: function() {
		var editedElementView = this.getOption( 'editedElementView' );

		if ( editedElementView ) {
			editedElementView.$el.addClass( 'elementor-element-editable' );
		}
	},

	onDeviceModeChange: function() {
		ControlsStack.prototype.onDeviceModeChange.apply( this, arguments );

		var self = this;

		// Timeout according to preview resize css animation duration
		setTimeout( function() {
			elementor.$previewContents.find( 'html, body' ).animate( {
				scrollTop: self.getOption( 'editedElementView' ).$el.offset().top - elementor.$preview[0].contentWindow.innerHeight / 2
			} );
		}, 500 );
	},

	onChildviewSettingsChange: function( childView ) {
		var editedElementView = this.getOption( 'editedElementView' ),
			editedElementType = editedElementView.model.get( 'elType' );

		if ( 'widget' === editedElementType ) {
			editedElementType = editedElementView.model.get( 'widgetType' );
		}

		elementor.channels.editor
			.trigger( 'change', childView, editedElementView )
			.trigger( 'change:' + editedElementType, childView, editedElementView )
			.trigger( 'change:' + editedElementType + ':' + childView.model.get( 'name' ), childView, editedElementView );
	}
} );

module.exports = EditorView;
