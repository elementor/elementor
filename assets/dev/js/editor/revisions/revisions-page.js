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

	initialize: function() {
		this.listenTo( elementor.channels.editor, 'editor:changed', this.setApplyButtonState );
	},

	setApplyButtonState: function( editorChanged ) {
		this.ui.apply.prop( 'disabled', ! editorChanged );
	},

	setDiscardButtonDisabled: function( disabled ) {
		this.ui.discard.prop( 'disabled', disabled );
	},

	onApplyClick: function() {
		elementor.getPanelView().getChildView( 'footer' )._publishBuilder();
		this.isRevisionApplied = true;
		this.setDiscardButtonDisabled( false );
	},

	onChildviewPreviewLoaded: function() {
		this.setDiscardButtonDisabled( false );
	},

	onDiscardClick: function() {
		var collection = elementor.getRegion( 'sections' ).currentView.collection;
		collection.reset();
		collection.set( elementor.config.data );

		elementor.setFlagEditorChange( this.isRevisionApplied );

		if ( this.isRevisionApplied ) {
			this.isRevisionApplied = false;
		}

		this.setDiscardButtonDisabled( true );

		Backbone.$( '.elementor-revision-current-preview' ).removeClass( 'elementor-revision-current-preview' );
	}
} );
