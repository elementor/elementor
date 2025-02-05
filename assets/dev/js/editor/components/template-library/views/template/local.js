const TemplateLibraryTemplateView = require( 'elementor-templates/views/template/base' );

const TemplateLibraryTemplateLocalView = TemplateLibraryTemplateView.extend( {
	template: '#tmpl-elementor-template-library-template-local',

	ui() {
		return _.extend( TemplateLibraryTemplateView.prototype.ui.apply( this, arguments ), {
			deleteButton: '.elementor-template-library-template-delete',
			renameButton: '.elementor-template-library-template-rename',
			morePopup: '.elementor-template-library-template-more',
			toggleMore: '.elementor-template-library-template-more-toggle',
			toggleMoreIcon: '.elementor-template-library-template-more-toggle i',
			titleCell: '.elementor-template-library-template-name',
		} );
	},

	events() {
		return _.extend( TemplateLibraryTemplateView.prototype.events.apply( this, arguments ), {
			'click @ui.deleteButton': 'onDeleteButtonClick',
			'click @ui.toggleMore': 'onToggleMoreClick',
			'click @ui.renameButton': 'onRenameClick',
		} );
	},

	modelEvents: {
		'change:title': 'onTitleChange',
	},

	onTitleChange() {
		this.ui.titleCell.text( this.model.get( 'title' ) );
	},

	onDeleteButtonClick() {
		var toggleMoreIcon = this.ui.toggleMoreIcon;

		elementor.templates.deleteTemplate( this.model, {
			onConfirm() {
				toggleMoreIcon.removeClass( 'eicon-ellipsis-h' ).addClass( 'eicon-loading eicon-animation-spin' );
			},
			onSuccess() {
				elementor.templates.showTemplates();
			},
		} );
	},

	onToggleMoreClick() {
		this.ui.morePopup.show();
	},

	onPreviewButtonClick() {
		open( this.model.get( 'url' ), '_blank' );
	},

	onRenameClick() {
		elementor.templates.renameTemplate( this.model, {
			onConfirm: () => {
				this.ui.toggleMoreIcon.removeClass( 'eicon-ellipsis-h' ).addClass( 'eicon-loading eicon-animation-spin' );
			},
			onSuccess: () => {
				// elementor.templates.showTemplates();
				this.ui.toggleMoreIcon.addClass( 'eicon-ellipsis-h' ).removeClass( 'eicon-loading eicon-animation-spin' );
			},
			onError: () => {
				this.ui.toggleMoreIcon.addClass( 'eicon-ellipsis-h' ).removeClass( 'eicon-loading eicon-animation-spin' );
			},
		} );
	},
} );

module.exports = TemplateLibraryTemplateLocalView;
