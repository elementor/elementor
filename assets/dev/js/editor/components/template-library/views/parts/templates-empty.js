const TemplateLibraryTemplatesEmptyView = Marionette.ItemView.extend( {
	id: 'elementor-template-library-templates-empty',

	template: '#tmpl-elementor-template-library-templates-empty',

	ui: {
		title: '.elementor-template-library-blank-title',
		message: '.elementor-template-library-blank-message',
		icon: '.elementor-template-library-blank-icon',
		button: '.elementor-template-library-cloud-empty__button',
	},

	modesStrings() {
		const defaultIcon = this.getDefaultIcon();

		return {
			empty: {
				title: __( 'Haven’t Saved Templates Yet?', 'elementor' ),
				message: __( 'This is where your templates should be. Design it. Save it. Reuse it.', 'elementor' ),
				icon: defaultIcon,
				button: '',
			},
			noResults: {
				title: __( 'No Results Found', 'elementor' ),
				message: __( 'Please make sure your search is spelled correctly or try a different words.', 'elementor' ),
				icon: defaultIcon,
				button: '',
			},
			noFavorites: {
				title: __( 'No Favorite Templates', 'elementor' ),
				message: __( 'You can mark any pre-designed template as a favorite.', 'elementor' ),
				icon: defaultIcon,
				button: '',
			},
			cloudEmpty: {
				title: __( 'Haven’t saved templates to cloud library yet?', 'elementor' ),
				message: __( 'This is where your templates should be. Design it. Save it. Reuse it.', 'elementor' ),
				icon: this.getCloudIcon(),
				button: '<a class="elementor-button e-primary" href="" target="_blank">call to action</a>',
			},
		};
	},

	getDefaultIcon() {
		return `<img src="${ elementorCommon.config.urls.assets }images/no-search-results.svg" class="elementor-template-library-no-results" loading="lazy" />`;
	},

	getCloudIcon() {
		return `<svg width="104" height="104" viewBox="0 0 104 104" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fill-rule="evenodd" clip-rule="evenodd" d="M58.713 14.6924C52.7388 13.6062 46.5396 14.7043 41.4877 17.7227C36.4394 20.739 32.9765 25.406 31.7967 30.6618C31.643 31.3466 31.035 31.8333 30.3331 31.8333C25.3032 31.8333 20.4919 33.7451 16.9546 37.1286C13.4196 40.51 11.4468 45.0814 11.4468 49.8333C11.4468 54.5851 13.4196 59.1566 16.9546 62.5379C20.4919 65.9214 25.3032 67.8333 30.3331 67.8333H82.3331C85.9578 67.8333 89.4339 66.3934 91.9969 63.8304C94.5599 61.2674 95.9998 57.7912 95.9998 54.1666C95.9998 50.542 94.5599 47.0658 91.9969 44.5028C89.4339 41.9398 85.9578 40.4999 82.3331 40.4999H77.9998C77.5443 40.4999 77.1134 40.2929 76.8288 39.9373C76.5441 39.5816 76.4365 39.1159 76.5362 38.6714C77.7147 33.4214 76.5342 27.9513 73.2166 23.4537C69.8936 18.9486 64.6864 15.7785 58.713 14.6924ZM39.949 15.1473C45.6423 11.7458 52.5818 10.5284 59.2496 11.7408C65.9181 12.9532 71.8207 16.5073 75.6309 21.6729C79.0682 26.3328 80.5389 31.9518 79.7913 37.4999H82.3331C86.7534 37.4999 90.9927 39.2559 94.1183 42.3815C97.2439 45.5071 98.9998 49.7463 98.9998 54.1666C98.9998 58.5869 97.2439 62.8261 94.1183 65.9517C90.9927 69.0773 86.7534 70.8333 82.3331 70.8333H30.3331C24.5495 70.8333 18.9901 68.6362 14.881 64.7058C10.7696 60.7732 8.44678 55.4249 8.44678 49.8333C8.44678 44.2417 10.7696 38.8933 14.881 34.9607C18.7111 31.2971 23.8013 29.1396 29.1587 28.8635C30.7527 23.2221 34.6092 18.3378 39.949 15.1473ZM20.1667 86.6667C20.1667 85.8383 20.8382 85.1667 21.6667 85.1667H82.3333C83.1618 85.1667 83.8333 85.8383 83.8333 86.6667C83.8333 87.4951 83.1618 88.1667 82.3333 88.1667H21.6667C20.8382 88.1667 20.1667 87.4951 20.1667 86.6667Z" fill="var(--e-a-color-txt)"/>
		</svg>`;
	},

	getCurrentMode() {
		if ( elementor.templates.getFilter( 'text' ) ) {
			return 'noResults';
		}

		if ( elementor.templates.getFilter( 'favorite' ) ) {
			return 'noFavorites';
		}

		if ( 'cloud' === elementor.templates.getFilter( 'source' ) ) {
			return 'cloudEmpty';
		}

		return 'empty';
	},

	onRender() {
		const modeStrings = this.modesStrings()[ this.getCurrentMode() ];

		this.ui.title.html( modeStrings.title );

		this.ui.message.html( modeStrings.message );

		this.ui.button.html( modeStrings.button );

		this.ui.icon.html( modeStrings.icon );
	},
} );

module.exports = TemplateLibraryTemplatesEmptyView;
