const TemplateLibraryTemplateView = require( 'elementor-templates/views/template/base' );

const TemplateLibraryTemplateLocalView = TemplateLibraryTemplateView.extend( {
	template: '#tmpl-elementor-template-library-template-local',

	ui() {
		return _.extend( TemplateLibraryTemplateView.prototype.ui.apply( this, arguments ), {
			deleteButton: '.elementor-template-library-template-delete',
			renameButton: '.elementor-template-library-template-rename',
			moveButton: '.elementor-template-library-template-move',
			morePopup: '.elementor-template-library-template-more',
			toggleMore: '.elementor-template-library-template-more-toggle',
			toggleMoreIcon: '.elementor-template-library-template-more-toggle i',
			titleCell: '.elementor-template-library-template-name',
			resourceIcon: '.elementor-template-library-template-name i',
		} );
	},

	events() {
		return _.extend( TemplateLibraryTemplateView.prototype.events.apply( this, arguments ), {
			'click @ui.deleteButton': 'onDeleteButtonClick',
			'click @ui.toggleMore': 'onToggleMoreClick',
			'click @ui.renameButton': 'onRenameClick',
			'click @ui.moveButton': 'onMoveClick',
		} );
	},

	modelEvents: {
		'change:title': 'onTitleChange',
	},

	onTitleChange() {
		const isCloudSource = 'cloud' === this.model.get( 'source' );
		const title = _.escape( this.model.get( 'title' ) );

		let content = title;

		if ( isCloudSource ) {
			const resourceIcon = this.ui.resourceIcon[ 0 ]?.outerHTML;
			content = resourceIcon + title;
		}

		this.ui.titleCell.html( content );
	},

	onDeleteButtonClick() {
		var toggleMoreIcon = this.ui.toggleMoreIcon;

		elementor.templates.deleteTemplate( this.model, {
			onConfirm() {
				toggleMoreIcon.removeClass( 'eicon-ellipsis-h' ).addClass( 'eicon-loading eicon-animation-spin' );
			},
			onSuccess() {
				$e.routes.refreshContainer( 'library' );
			},
		} );
	},

	onToggleMoreClick() {
		this.ui.morePopup.show();
	},

	onPreviewButtonClick() {
		open( this.model.get( 'url' ), '_blank' );
	},

	async onRenameClick() {
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
			context: 'move',
		} );
	},

	showToggleMoreLoader() {
		this.ui.toggleMoreIcon.removeClass( 'eicon-ellipsis-h' ).addClass( 'eicon-loading eicon-animation-spin' );
	},

	hideToggleMoreLoader() {
		this.ui.toggleMoreIcon.addClass( 'eicon-ellipsis-h' ).removeClass( 'eicon-loading eicon-animation-spin' );
	},
} );

module.exports = TemplateLibraryTemplateLocalView;
