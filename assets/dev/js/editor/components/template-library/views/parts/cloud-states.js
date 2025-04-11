module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-template-library-connect-states',

	id: 'elementor-template-library-connect-states',

	ui: {
		connect: '#elementor-template-library-connect__button',
		selectSourceFilter: '.elementor-template-library-filter-select-source',
		title: '.elementor-template-library-blank-title',
		message: '.elementor-template-library-blank-message',
		icon: '.elementor-template-library-blank-icon',
		button: '.elementor-template-library-cloud-empty__button',
	},

	events: {
		'change @ui.selectSourceFilter': 'onSelectSourceFilterChange',
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
				button: `<a class="elementor-button e-accent" href="" target="_blank">${ __( 'Upgrade now', 'elementor' ) }</a>`,
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

		return 'connectedNoQuota';
	},

	onRender() {
		this.updateTemplateMarkup();

		this.handleElementorConnect();

		elementor.templates.layout.getHeaderView()?.tools?.$el[ 0 ]?.classList?.add( 'elementor-hidden' );
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

	onDestroy() {
		elementor.templates.layout.getHeaderView()?.tools?.$el[ 0 ]?.classList?.remove( 'elementor-hidden' );
	},
} );
