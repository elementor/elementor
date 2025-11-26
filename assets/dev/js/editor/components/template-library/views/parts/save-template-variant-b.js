const TemplateLibrarySaveTemplateView = require( './save-template' );

const TemplateLibrarySaveTemplateVariantBView = TemplateLibrarySaveTemplateView.extend( {
	id: 'elementor-template-library-save-template-variant-b',

	template: '#tmpl-elementor-template-library-save-template-variant-b',

	ui() {
		return _.extend( TemplateLibrarySaveTemplateView.prototype.ui.apply( this, arguments ), {
			selectFolderLink: '.select-folder-link',
			cloudAccountBadge: '.cloud-account-badge',
			siteAccountBadge: '.site-account-badge',
			connect: '#elementor-template-library-connect__badge-variant-b',
		} );
	},

	events() {
		return _.extend( TemplateLibrarySaveTemplateView.prototype.events.apply( this, arguments ), {
			'click @ui.selectFolderLink': 'onEllipsisIconClick',
			'mouseenter @ui.upgradeBadge': 'showInfoTip',
			'mouseenter @ui.cloudAccountBadge': 'showCloudAccountBadgeTooltip',
			'mouseenter @ui.siteAccountBadge': 'showSiteAccountBadgeTooltip',
		} );
	},

	showInfoTip() {
		if ( this.infoTipDialog ) {
			this.infoTipDialog.hide();
		}

		const message = elementor.templates.hasCloudLibraryQuota()
			? __( 'Upgrade your subscription to get more space and reuse saved assets across all your sites.', 'elementor' )
			: __( 'Upgrade your subscription to access Cloud Templates and reuse saved assets across all your sites.', 'elementor' );

		this.infoTipDialog = elementor.dialogsManager.createWidget( 'buttons', {
			id: 'elementor-library--infotip__dialog',
			effects: {
				show: 'show',
				hide: 'hide',
			},
			position: {
				of: this.ui.upgradeBadge,
				at: 'top-50',
			},
		} )
			.setMessage( message );

		this.infoTipDialog.getElements( 'header' ).remove();
		this.infoTipDialog.getElements( 'buttonsWrapper' ).remove();
		this.infoTipDialog.getElements( 'widget' ).addClass( 'variant-b' );

		this.infoTipDialog.show();
	},

	showCloudAccountBadgeTooltip() {
		if ( this.cloudAccountBadgeDialog ) {
			this.cloudAccountBadgeDialog.hide();
		}

		const emailReplacement = elementor.config.library_connect.is_connected ? elementor.config.library_connect.user_email : __( 'connected', 'elementor' );
		/* Translators: %s: User's email. */
		const message = sprintf( __( 'Only %s Elementor account can access Cloud Templates from any connected site.', 'elementor' ), emailReplacement );

		this.cloudAccountBadgeDialog = elementor.dialogsManager.createWidget( 'buttons', {
			id: 'elementor-library--cloud-upgrade__dialog',
			effects: {
				show: 'show',
				hide: 'hide',
			},
			position: {
				of: this.ui.cloudAccountBadge,
				at: 'top-50',
			},
		} )
			.setMessage( message );

		this.cloudAccountBadgeDialog.getElements( 'widget' ).addClass( 'variant-b' );
		this.cloudAccountBadgeDialog.getElements( 'header' ).remove();
		this.cloudAccountBadgeDialog.getElements( 'buttonsWrapper' ).remove();
		this.cloudAccountBadgeDialog.show();
	},

	showSiteAccountBadgeTooltip() {
		if ( this.siteAccountBadgeDialog ) {
			this.siteAccountBadgeDialog.hide();
		}

		const message = __( 'Authorized users on this site can access Site Templates.', 'elementor' );

		this.siteAccountBadgeDialog = elementor.dialogsManager.createWidget( 'buttons', {
			id: 'elementor-library--site-info__dialog',
			effects: {
				show: 'show',
				hide: 'hide',
			},
			position: {
				of: this.ui.siteAccountBadge,
				at: 'top-50',
			},
		} )
			.setMessage( message );

		this.siteAccountBadgeDialog.getElements( 'widget' ).addClass( 'variant-b' );
		this.siteAccountBadgeDialog.getElements( 'header' ).remove();
		this.siteAccountBadgeDialog.getElements( 'buttonsWrapper' ).remove();

		this.siteAccountBadgeDialog.show();
	},
} );

module.exports = TemplateLibrarySaveTemplateVariantBView;

