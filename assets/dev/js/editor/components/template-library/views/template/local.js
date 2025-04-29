const TemplateLibraryTemplateView = require( 'elementor-templates/views/template/base' );

import { SAVE_CONTEXTS } from './../../constants';

const TemplateLibraryTemplateLocalView = TemplateLibraryTemplateView.extend( {
	template: '#tmpl-elementor-template-library-template-local',

	ui() {
		return _.extend( TemplateLibraryTemplateView.prototype.ui.apply( this, arguments ), {
			bulkSelectionItemCheckbox: '.bulk-selection-item-checkbox',
			deleteButton: '.elementor-template-library-template-delete',
			renameButton: '.elementor-template-library-template-rename',
			moveButton: '.elementor-template-library-template-move',
			copyButton: '.elementor-template-library-template-copy',
			exportButton: '.elementor-template-library-template-export',
			morePopup: '.elementor-template-library-template-more',
			toggleMore: '.elementor-template-library-template-more-toggle',
			toggleMoreIcon: '.elementor-template-library-template-more-toggle i',
			titleCell: '.elementor-template-library-template-name span',
			resourceIcon: '.elementor-template-library-template-name i',
		} );
	},

	events() {
		return _.extend( TemplateLibraryTemplateView.prototype.events.apply( this, arguments ), {
			click: 'handleItemClicked',
			'change @ui.bulkSelectionItemCheckbox': 'onSelectBulkSelectionItemCheckbox',
			'click @ui.deleteButton': 'onDeleteButtonClick',
			'click @ui.toggleMore': 'onToggleMoreClick',
			'click @ui.renameButton': 'onRenameClick',
			'click @ui.moveButton': 'onMoveClick',
			'click @ui.copyButton': 'onCopyClick',
			'click @ui.exportButton': 'onExportClick',
		} );
	},

	modelEvents: {
		'change:title': 'onTitleChange',
	},

	onTitleChange() {
		const title = _.escape( this.model.get( 'title' ) );

		this.ui.titleCell.text( title );
	},

	handleItemClicked( event ) {
		if ( event.target.closest( '.bulk-selection-item-checkbox' ) ) {
			return; // Ignore clicks from checkbox
		}

		if ( ! this._clickState ) {
			this._clickState = {
				timeoutId: null,
				delay: 250,
			};
		}

		const state = this._clickState;

		if ( state.timeoutId ) {
			clearTimeout( state.timeoutId );
			state.timeoutId = null;

			this.handleItemDoubleClick();
		} else {
			state.timeoutId = setTimeout( () => {
				state.timeoutId = null;

				this.handleItemSingleClick();
			}, state.delay );
		}
	},

	handleItemSingleClick() {
		this.handleListViewItemSingleClick();
	},

	handleItemDoubleClick() {},

	handleListViewItemSingleClick() {
		const checkbox = this.ui.bulkSelectionItemCheckbox;
		const isChecked = checkbox.prop( 'checked' );

		checkbox.prop( 'checked', ! isChecked ).trigger( 'change' );
	},

	onDeleteButtonClick( event ) {
		event.stopPropagation();

		var toggleMoreIcon = this.ui.toggleMoreIcon;

		elementor.templates.deleteTemplate( this.model, {
			onConfirm() {
				toggleMoreIcon.removeClass( 'eicon-ellipsis-h' ).addClass( 'eicon-loading eicon-animation-spin' );
			},
		} );
	},

	onToggleMoreClick( event ) {
		event.stopPropagation();

		this.ui.morePopup.show();

		elementor.templates.eventManager.sendPageViewEvent( {
			location: elementor.editorEvents.config.secondaryLocations.templateLibrary.morePopup,
		} );
	},

	onPreviewButtonClick( event ) {
		event.stopPropagation();

		open( this.model.get( 'url' ), '_blank' );
	},

	async onRenameClick( event ) {
		event.stopPropagation();

		try {
			await elementor.templates.renameTemplate( this.model, {
				onConfirm: () => this.showToggleMoreLoader(),
			} );
		} finally {
			this.hideToggleMoreLoader();
		}
	},

	onMoveClick() {
		$e.route( 'library/save-template', {
			model: this.model,
			context: SAVE_CONTEXTS.MOVE,
		} );
	},

	onCopyClick() {
		$e.route( 'library/save-template', {
			model: this.model,
			context: SAVE_CONTEXTS.COPY,
		} );
	},

	onExportClick( e ) {
		e.stopPropagation();
	},

	showToggleMoreLoader() {
		this.ui.toggleMoreIcon.removeClass( 'eicon-ellipsis-h' ).addClass( 'eicon-loading eicon-animation-spin' );
	},

	hideToggleMoreLoader() {
		this.ui.toggleMoreIcon.addClass( 'eicon-ellipsis-h' ).removeClass( 'eicon-loading eicon-animation-spin' );
	},

	onSelectBulkSelectionItemCheckbox( event ) {
		event.stopPropagation();

		if ( event?.target?.checked ) {
			elementor.templates.addBulkSelectionItem( event.target.dataset.template_id );
			this.$el.addClass( 'bulk-selected-item' );
		} else {
			elementor.templates.removeBulkSelectionItem( event.target.dataset.template_id );
			this.$el.removeClass( 'bulk-selected-item' );
		}

		elementor.templates.layout.handleBulkActionBarUi();
	},
} );

module.exports = TemplateLibraryTemplateLocalView;
