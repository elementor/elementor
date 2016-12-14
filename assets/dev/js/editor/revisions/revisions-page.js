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

	initialize: function() {
		this.listenTo( elementor.channels.editor, 'editor:changed', this.setApplyButtonState );
	},

	setApplyButtonState: function( status ) {
		this.ui.apply.prop( 'disabled', ! status );
	},

	onApplyClick: function() {
		elementor.getPanelView().getChildView( 'footer' )._publishBuilder();
	},

	onDiscardClick: function() {
		var collection = elementor.getRegion( 'sections' ).currentView.collection;
		collection.reset();
		collection.set( elementor.config.data );

		Backbone.$( '.elementor-revision-current-preview' ).removeClass( 'elementor-revision-current-preview' );
		elementor.setFlagEditorChange( false );
	}
} );
