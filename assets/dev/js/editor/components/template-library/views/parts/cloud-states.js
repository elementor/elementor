module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-connect-states',

	id: 'elementor-template-library-connect-states',

	ui: {
		connect: '#elementor-template-library-connect__button',
		selectSourceFilter: '.elementor-template-library-filter-select-source .source-option',
		title: '.elementor-template-library-blank-title',
		message: '.elementor-template-library-blank-message',
		icon: '.elementor-template-library-blank-icon',
		button: '.elementor-template-library-cloud-empty__button',
	},

	events: {
		'click @ui.selectSourceFilter': 'onSelectSourceFilterChange',
		'click @ui.button': 'onButtonClick',
	},

	modesStrings() {
		const defaultIcon = this.getDefaultIcon();

		return {
			notConnected: {
				title: elementorAppConfig?.[ 'cloud-library' ]?.library_connect_title,
				message: elementorAppConfig?.[ 'cloud-library' ]?.library_connect_sub_title,
				icon: defaultIcon,
				button: `<a class="elementor-button e-primary" href="${ elementorAppConfig?.[ 'cloud-library' ]?.library_connect_url }" target="_blank">${ elementorAppConfig?.[ 'cloud-library' ]?.library_connect_button_text }</a>`,
			},
			connectedNoQuota: {
				title: __( 'It’s time to level up', 'elementor' ),
				message: __( 'Elementor Pro plans come with Cloud Templates.', 'elementor' ) + '<br>' + __( 'Upgrade now to re-use your templates on all the websites you’re working on.', 'elementor' ),
				icon: `<i class="eicon-library-subscription-upgrade" aria-hidden="true" title="${ __( 'Upgrade now', 'elememntor' ) }"></i>`,
				button: `<a class="elementor-button e-accent" href="https://go.elementor.com/go-pro-cloud-templates-cloud-tab" target="_blank">${ __( 'Upgrade now', 'elementor' ) }</a>`,
			},
			deactivated: {
				title: __( 'Your library has been deactivated', 'elementor' ),
				message: __( 'This is because you don’t have an active subscription.', 'elementor' ) + '<br>' + __( 'Your templates are saved for 90 days from the day your subscription expires,', 'elementor' ) + '<br>' + __( 'then they’ll be gone forever.', 'elementor' ),
				icon: `<i class="eicon-library-subscription-upgrade" aria-hidden="true" title="${ __( 'Renew my subscription', 'elememntor' ) }"></i>`,
				button: `<a class="elementor-button e-accent" href="https://go.elementor.com/renew-license-cloud-templates-cloud-tab" target="_blank">${ __( 'Renew my subscription', 'elementor' ) }</a>`,
			},
		};
	},

	getDefaultIcon() {
		return `<i class="eicon-library-cloud-connect" aria-hidden="true" title="${ __( 'Empty folder', 'elememntor' ) }"></i>`;
	},

	getCurrentMode() {
		if ( ! elementor.config.library_connect.is_connected ) {
			return 'notConnected';
		}

		if ( this.isDeactivated() ) {
			return 'deactivated';
		}

		return 'connectedNoQuota';
	},

	isDeactivated() {
		const quota = elementorAppConfig[ 'cloud-library' ]?.quota;

		if ( ! quota ) {
			return false;
		}

		const {
			currentUsage = 0,
			threshold = 0,
			subscriptionId = '',
		} = quota;

		const isOverThreshold = currentUsage > threshold;
		const hasNoSubscription = '' === subscriptionId;

		return isOverThreshold && hasNoSubscription;
	},

	onRender() {
		this.updateTemplateMarkup();

		this.handleElementorConnect();

		elementor.templates.layout.getHeaderView()?.tools?.$el[ 0 ]?.classList?.add( 'e-hidden-disabled' );

		elementor.templates.eventManager.sendPageViewEvent( {
			location: elementor.editorEvents.config.secondaryLocations.templateLibrary.cloudTabUpgrade,
		} );
	},

	updateTemplateMarkup() {
		const modeStrings = this.modesStrings()[ this.getCurrentMode() ];

		this.ui.title.html( modeStrings.title );

		this.ui.message.html( modeStrings.message );

		this.ui.button.html( modeStrings.button );

		this.ui.icon.html( modeStrings.icon );
	},

	handleElementorConnect() {
		this.ui.connect.elementorConnect( {
			success: () => {
				elementor.config.library_connect.is_connected = true;

				$e.run( 'library/close' );
				elementor.notifications.showToast( {
					message: __( 'Connected successfully.', 'elementor' ),
				} );
			},
			error: () => {
				elementor.config.library_connect.is_connected = false;
			},
		} );
	},

	onSelectSourceFilterChange( event ) {
		elementor.templates.onSelectSourceFilterChange( event );
	},

	onButtonClick() {
		elementor.templates.eventManager.sendUpgradeClickedEvent( {
			secondaryLocation: elementor.editorEvents.config.secondaryLocations.templateLibrary.cloudTab,
			upgradePosition: elementor.editorEvents.config.secondaryLocations.templateLibrary.cloudTab,
		} );
	},

	onDestroy() {
		elementor.templates.layout.getHeaderView()?.tools?.$el[ 0 ]?.classList?.remove( 'e-hidden-disabled' );
	},
} );
