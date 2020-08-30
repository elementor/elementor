/**
 * @type {RevisionsComponent|Component}
 */
let component = null;

const RevisionsTabView = Marionette.CompositeView.extend( {
	id: 'elementor-panel-revisions',

	template: '#tmpl-elementor-panel-revisions',

	childView: require( './tab-item' ),

	childViewContainer: '#elementor-revisions-list',

	ui: {
		discard: '.elementor-panel-scheme-discard .elementor-button',
		apply: '.elementor-panel-scheme-save .elementor-button',
	},

	events: {
		'click @ui.discard': 'onDiscardClick',
		'click @ui.apply': () => $e.run( 'panel/history/revisions/apply' ),
	},

	initialize: function( options ) {
		// TODO: Remove - Temporal solution.
		if ( ! component ) {
			component = $e.components.get( 'panel/history/revisions' );
		}

		options.tab = this;

		$e.internal( 'panel/history/revisions/initialize', options );

		// TODO use hooks.
		this.listenTo( elementor.channels.editor, 'saved', this.onEditorSaved );
	},

	setRevisionsButtonsActive: function( active ) {
		const { tab } = component;

		// Check the tab is open.
		if ( ! tab.isDestroyed ) {
			tab.ui.apply.add( this.ui.discard ).prop( 'disabled', ! active );
		}
	},

	deleteRevision: function( revisionView ) {
		revisionView.$el.addClass( 'elementor-revision-item-loading' );

		component.currentDocument.revisions.deleteRevision( revisionView.model, {
			success: () => {
				if ( revisionView.model.get( 'id' ) === component.currentPreviewId ) {
					this.onDiscardClick();
				}

				component.currentPreviewId = null;
			},
			error: () => {
				revisionView.$el.removeClass( 'elementor-revision-item-loading' );

				alert( 'An error occurred' );
			},
		} );
	},

	enterReviewMode: function() {
		elementor.changeEditMode( 'review' );
	},

	exitReviewMode: function() {
		elementor.changeEditMode( 'edit' );
	},

	navigate: function( reverse ) {
		if ( ! component.currentPreviewId || ! component.currentPreviewItem || this.children.length <= 1 ) {
			return;
		}

		var currentPreviewItemIndex = component.collection.indexOf( component.currentPreviewItem.model ),
			requiredIndex = reverse ? currentPreviewItemIndex - 1 : currentPreviewItemIndex + 1;

		if ( requiredIndex < 0 ) {
			requiredIndex = component.collection.length - 1;
		}

		if ( requiredIndex >= component.collection.length ) {
			requiredIndex = 0;
		}

		this.children.findByIndex( requiredIndex ).ui.detailsArea.trigger( 'click' );
	},

	onEditorSaved: function() {
		this.exitReviewMode();

		this.setRevisionsButtonsActive( false );

		component.currentPreviewId = elementor.config.document.revisions.current_id;
	},

	onDiscardClick: function() {
		const document = component.currentDocument;

		if ( document.config.panel.has_elements ) {
			document.revisions.setEditorData( elementor.config.document.elements );
		}

		$e.internal( 'document/save/set-is-modified', { status: component.isRevisionApplied } );

		component.isRevisionApplied = false;

		this.setRevisionsButtonsActive( false );

		component.currentPreviewId = null;

		this.exitReviewMode();

		if ( component.currentPreviewItem ) {
			component.currentPreviewItem.$el.removeClass( 'elementor-revision-current-preview' );
		}
	},

	onDestroy: function() {
		if ( component.currentPreviewId && component.currentPreviewId !== elementor.config.document.revisions.current_id ) {
			this.onDiscardClick();
		}
	},

	onRenderCollection: function() {
		if ( ! component.currentPreviewId ) {
			return;
		}

		const currentPreviewModel = component.collection.findWhere( { id: parseInt( component.currentPreviewId ) } );

		// Ensure the model is exist and not deleted during a save.
		if ( currentPreviewModel ) {
			component.currentPreviewItem = this.children.findByModelCid( currentPreviewModel.cid );
			component.currentPreviewItem.$el.addClass( 'elementor-revision-current-preview' );
		}
	},

	onChildviewDetailsAreaClick: function( childView ) {
		$e.run( 'panel/history/revisions/preview', { view: childView } );
	},
} );

module.exports = RevisionsTabView;
