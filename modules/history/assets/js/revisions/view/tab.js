export default class RevisionsTabView extends Marionette.CompositeView {
	childView = require( './tab-item' );

	childViewContainer ='#elementor-revisions-list';

	constructor( ... args ) {
		super( ... args );

		/**
		 * @type {RevisionsComponent|Component}
		 */
		this.component = $e.components.get( 'panel/history/revisions' );
	}

	initialize( options ) {
		options.tab = this;

		$e.internal( 'panel/history/revisions/initialize', options );
	}

	id() {
		return 'elementor-panel-revisions';
	}

	getTemplate() {
		return '#tmpl-elementor-panel-revisions';
	}

	ui() {
		return {
			discard: '.elementor-panel-scheme-discard .elementor-button',
			apply: '.elementor-panel-scheme-save .elementor-button',
		};
	}

	events() {
		return {
			'click @ui.discard': () => $e.run( 'panel/history/revisions/discard' ),
			'click @ui.apply': () => $e.run( 'panel/history/revisions/apply' ),
		};
	}

	setRevisionsButtonsActive( active ) {
		// Check the tab is open.
		if ( ! this.isDestroyed ) {
			this.ui.apply.add( this.ui.discard ).prop( 'disabled', ! active );
		}
	}

	enterReviewMode() {
		elementor.changeEditMode( 'review' );
	}

	exitReviewMode() {
		elementor.changeEditMode( 'edit' );
	}

	navigate( reverse ) {
		if ( ! this.component.currentPreviewId || ! this.component.currentPreviewItem || this.children.length <= 1 ) {
			return;
		}

		const currentPreviewItemIndex = this.component.collection.indexOf( this.component.currentPreviewItem.model );

		let requiredIndex = reverse ? currentPreviewItemIndex - 1 : currentPreviewItemIndex + 1;

		if ( requiredIndex < 0 ) {
			requiredIndex = this.component.collection.length - 1;
		}

		if ( requiredIndex >= this.component.collection.length ) {
			requiredIndex = 0;
		}

		this.children.findByIndex( requiredIndex ).ui.detailsArea.trigger( 'click' );
	}

	onDestroy() {
		if ( this.component.currentPreviewId && this.component.currentPreviewId !== elementor.config.document.revisions.current_id ) {
			$e.run( 'panel/history/revisions/discard' );
		}
	}

	onRenderCollection() {
		if ( ! this.component.currentPreviewId ) {
			return;
		}

		const currentPreviewModel = this.component.collection.findWhere( { id: parseInt( this.component.currentPreviewId ) } );

		// Ensure the model is exist and not deleted during a save.
		if ( currentPreviewModel ) {
			this.component.currentPreviewItem = this.children.findByModelCid( currentPreviewModel.cid );
			this.component.currentPreviewItem.$el.addClass( 'elementor-revision-current-preview' );
		}
	}

	onChildviewDetailsAreaClick( childView ) {
		$e.run( 'panel/history/revisions/preview', { view: childView } );
	}

	deleteRevision( revisionView ) { // NOT IN USE.
		revisionView.$el.addClass( 'elementor-revision-item-loading' );

		this.component.currentDocument.revisions.deleteRevision( revisionView.model, {
			success: () => {
				if ( revisionView.model.get( 'id' ) === this.component.currentPreviewId ) {
					$e.run( 'panel/history/revisions/discard' );
				}

				this.component.currentPreviewId = null;
			},
			error: () => {
				revisionView.$el.removeClass( 'elementor-revision-item-loading' );

				alert( 'An error occurred' );
			},
		} );
	}
}
