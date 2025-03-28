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
				button: `<a class="elementor-button e-primary" href="${ elementorAppConfig?.['cloud-library']?.library_connect_url }" target="_blank">${ elementorAppConfig?.['cloud-library']?.library_connect_button_text }</a>`,
			},
			connectedNoQuota: {
				title: __( 'It’s time to level up', 'elementor' ),
				message: __( 'Elementor Pro plans come with Cloud Templates.', 'elementor' ) + '<br>' + __( 'Upgrade now to re-use your templates on all the websites you’re working on.', 'elementor' ),
				icon: defaultIcon,
				button: `<a class="elementor-button e-accent" href="${ elementorAppConfig?.['cloud-library']?.library_connect_url }" target="_blank">${ __( 'Upgrade now', 'elementor' ) }</a>`,
			},
		};
	},

	getDefaultIcon() {
		return `<svg width="105" height="104" viewBox="0 0 105 104" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fill-rule="evenodd" clip-rule="evenodd" d="M58.368 19.6924C52.3939 18.6062 46.1946 19.7043 41.1427 22.7227C36.0944 25.739 32.6315 30.406 31.4518 35.6618C31.298 36.3466 30.69 36.8333 29.9882 36.8333C24.9582 36.8333 20.147 38.7451 16.6097 42.1286C13.0747 45.51 11.1018 50.0814 11.1018 54.8333C11.1018 59.5851 13.0747 64.1566 16.6097 67.5379C20.147 70.9214 24.9582 72.8333 29.9882 72.8333H39.8075C39.7411 72.2636 39.712 71.6889 39.7208 71.1129V64.1455C39.7208 63.7477 39.8788 63.3661 40.1601 63.0848C40.4414 62.8035 40.823 62.6455 41.2208 62.6455H44.3738V54.8396C44.3738 54.0112 45.0453 53.3396 45.8738 53.3396C46.7022 53.3396 47.3738 54.0112 47.3738 54.8396V62.6455H58.3321V54.8396C58.3321 54.0112 59.0036 53.3396 59.8321 53.3396C60.6605 53.3396 61.3321 54.0112 61.3321 54.8396V62.6455H64.4849C65.3133 62.6455 65.9849 63.3171 65.9849 64.1455V71.1129C65.9937 71.6889 65.9646 72.2635 65.8982 72.8333H81.9882C85.6128 72.8333 89.089 71.3934 91.652 68.8304C94.215 66.2674 95.6548 62.7912 95.6548 59.1666C95.6548 55.542 94.215 52.0658 91.652 49.5028C89.089 46.9398 85.6128 45.4999 81.9882 45.4999H77.6548C77.1993 45.4999 76.7684 45.2929 76.4838 44.9373C76.1991 44.5816 76.0915 44.1159 76.1913 43.6714C77.3697 38.4214 76.1892 32.9513 72.8717 28.4537C69.5486 23.9486 64.3415 20.7785 58.368 19.6924ZM29.9882 75.8333H40.5214C40.5654 75.9532 40.6112 76.0727 40.6587 76.1915C41.3059 77.8095 42.2687 79.2825 43.4909 80.5247C44.7131 81.767 46.1703 82.7535 47.7776 83.427C48.8599 83.8804 49.9956 84.1858 51.1541 84.3369V94.5872C51.1541 95.4156 51.8257 96.0872 52.6541 96.0872C53.4825 96.0872 54.1541 95.4156 54.1541 94.5872V84.3826C55.4502 84.2535 56.7223 83.9321 57.928 83.4269C59.5353 82.7535 60.9925 81.767 62.2148 80.5247C63.437 79.2825 64.3997 77.8095 65.047 76.1915C65.0945 76.0727 65.1403 75.9532 65.1842 75.8333H81.9882C86.4084 75.8333 90.6477 74.0773 93.7733 70.9517C96.8989 67.8261 98.6548 63.5869 98.6548 59.1666C98.6548 54.7463 96.8989 50.5071 93.7733 47.3815C90.6477 44.2559 86.4084 42.4999 81.9882 42.4999H79.4463C80.1939 36.9518 78.7233 31.3328 75.2859 26.6729C71.4757 21.5073 65.5732 17.9532 58.9047 16.7408C52.2368 15.5284 45.2973 16.7458 39.604 20.1473C34.2642 23.3378 30.4078 28.2221 28.8137 33.8635C23.4564 34.1396 18.3661 36.2971 14.536 39.9607C10.4246 43.8933 8.10181 49.2417 8.10181 54.8333C8.10181 60.4249 10.4246 65.7732 14.536 69.7058C18.6451 73.6362 24.2045 75.8333 29.9882 75.8333ZM42.7208 65.6455V71.1247L42.7206 71.1491C42.6988 72.4935 42.9447 73.8288 43.4441 75.0773C43.9435 76.3257 44.6863 77.4623 45.6294 78.4207C46.5724 79.3792 47.6968 80.1404 48.9369 80.66C50.1771 81.1796 51.5082 81.4472 52.8528 81.4472C54.1974 81.4472 55.5286 81.1796 56.7687 80.66C58.0089 80.1404 59.1333 79.3792 60.0763 78.4207C61.0193 77.4623 61.7622 76.3257 62.2616 75.0773C62.761 73.8288 63.0069 72.4935 62.9851 71.1491L62.9849 71.1247V65.6455H42.7208Z" fill="var(--e-a-color-txt)"/>
		</svg>`;
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
