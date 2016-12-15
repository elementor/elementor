module.exports = Marionette.CompositeView.extend( {
	id: 'elementor-panel-revisions',

	template: '#tmpl-elementor-panel-revisions',

	childView: require( './revision-view' ),

	childViewContainer: '#elementor-revisions-list',

	emptyView: require( './no-revisions-view' ),

	ui: {
		discard: '.elementor-panel-scheme-discard .elementor-button',
		apply: '.elementor-panel-scheme-save .elementor-button'
	},

	events: {
		'click @ui.discard': 'onDiscardClick',
		'click @ui.apply': 'onApplyClick'
	},

	isRevisionApplied: false,

	jqueryXhr: null,

	currentPreviewId: null,

	initialize: function() {
		this.listenTo( elementor.channels.editor, 'editor:changed', this.setApplyButtonState );
	},

	setApplyButtonState: function( editorChanged ) {
		this.ui.apply.prop( 'disabled', ! editorChanged );
	},

	setDiscardButtonDisabled: function( disabled ) {
		this.ui.discard.prop( 'disabled', disabled );
	},

	setEditorData: function( data ) {
		var collection = elementor.getRegion( 'sections' ).currentView.collection;
		collection.reset();
		collection.set( data );
	},

	onApplyClick: function() {
		elementor.getPanelView().getChildView( 'footer' )._publishBuilder();
		this.isRevisionApplied = true;
		this.setDiscardButtonDisabled( false );
	},

	onChildviewItemClick: function( childView ) {
		var self = this,
			id = childView.model.get( 'id' );

		if ( id === self.currentPreviewId ) {
			return;
		}

		if ( this.jqueryXhr ) {
			this.jqueryXhr.abort();
		}

		childView.ui.item.addClass( 'elementor-state-show' );

		this.jqueryXhr = elementor.ajax.send( 'get_revision_preview', {
			data: {
				id: id
			},
			success: function( data ) {
				self.setEditorData( data );
				self.setDiscardButtonDisabled( false );

				self.currentPreviewId = id;
				self.jqueryXhr = null;

				Backbone.$( '.elementor-revision-current-preview' ).removeClass( 'elementor-revision-current-preview' );
				childView.ui.item.removeClass( 'elementor-state-show' ).addClass( 'elementor-revision-current-preview' );
			},
			error: function( data ) {
				childView.ui.item.removeClass( 'elementor-state-show elementor-revision-current-preview' );
				if ( 'abort' === self.jqueryXhr.statusText ) {
					return;
				}

				this.currentPreviewId = null;
				alert( 'An error occurs' );
			}
		} );
	},

	onDiscardClick: function() {
		this.setEditorData( elementor.config.data );
		elementor.setFlagEditorChange( this.isRevisionApplied );

		if ( this.isRevisionApplied ) {
			this.isRevisionApplied = false;
		}

		this.setDiscardButtonDisabled( true );

		this.currentPreviewId = null;
		Backbone.$( '.elementor-revision-current-preview' ).removeClass( 'elementor-revision-current-preview' );
	}
} );
