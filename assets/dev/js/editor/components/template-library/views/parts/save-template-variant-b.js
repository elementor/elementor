const TemplateLibrarySaveTemplateView = require( './save-template' );

const TemplateLibrarySaveTemplateVariantBView = TemplateLibrarySaveTemplateView.extend( {
	id: 'elementor-template-library-save-template-variant-b',

	template: '#tmpl-elementor-template-library-save-template-variant-b',

	ui() {
		return _.extend( TemplateLibrarySaveTemplateView.prototype.ui.apply( this, arguments ), {
			selectFolderLink: '.select-folder-link',
			cloudAccountBadge: '.cloud-account-badge',
			connect: '#elementor-template-library-connect__badge-variant-b',
		} );
	},

	events() {
		return _.extend( TemplateLibrarySaveTemplateView.prototype.events.apply( this, arguments ), {
			'click @ui.selectFolderLink': 'onEllipsisIconClick',
			'mouseenter @ui.upgradeBadge': 'showInfoTip',
		} );
	},

	showInfoTip() {
		if ( this.infoTipDialog ) {
			this.infoTipDialog.hide();
		}

		const message = elementor.templates.hasCloudLibraryQuota()
			? __( 'Upgrade your subscription to get more space and reuse saved assets across all your sites.', 'elementor' )
			: __( 'Upgrade your subscription to access Cloud Templates and reuse saved assets across all your sites.', 'elementor' );

		const goLink = elementor.templates.hasCloudLibraryQuota()
			? 'https://go.elementor.com/go-pro-cloud-templates-save-to-100-usage-notice'
			: 'https://go.elementor.com/go-pro-cloud-templates-save-to-free-tooltip/';

		this.infoTipDialog = elementor.dialogsManager.createWidget( 'buttons', {
			id: 'elementor-library--infotip__dialog',
			effects: {
				show: 'show',
				hide: 'hide',
			},
			position: {
				of: this.ui.upgradeBadge,
				at: 'top-75',
			},
		} )
			.setMessage( message );

		this.infoTipDialog.getElements( 'header' ).remove();
		this.infoTipDialog.show();
	},
} );

module.exports = TemplateLibrarySaveTemplateVariantBView;

