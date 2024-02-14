import ModalLayout from './modal-layout';
import { renderIconManager } from './components/icon-manager';
import IconLibrary from './classes/icon-library';
import Store from './classes/store';
import { unmountComponentAtNode } from 'react-dom';

export default class extends elementorModules.Module {
	onInit() {
		// Init icon library helper
		this.library = new IconLibrary();
		// Init Icon library Storage helper
		this.store = new Store();
		// Fetch fa4 to fa5 migration data
		elementor.helpers.fetchFa4ToFa5Mapping();
		this.cache = {};
	}

	getLayout() {
		if ( ! this.layout ) {
			this.layout = new ModalLayout();

			const layoutModal = this.layout.getModal();

			layoutModal.addButton( {
				name: 'insert_icon',
				text: __( 'Insert', 'elementor' ),
				classes: 'elementor-button e-primary',
				callback: () => {
					this.updateControlValue();
					this.unMountIconManager();
				},
			} );

			layoutModal
				.on( 'show', this.onPickerShow.bind( this ) )
				.on( 'hide', this.unMountIconManager );
		}
		return this.layout;
	}

	getDefaultSettings() {
		return {
			selectedIcon: {},
		};
	}

	unMountIconManager() {
		const containerElement = document.querySelector( '#elementor-icons-manager-modal .dialog-content' );

		unmountComponentAtNode( containerElement );
	}

	loadIconLibraries() {
		if ( ! this.cache.loaded ) {
			elementor.config.icons.libraries.forEach( ( library ) => {
				if ( 'all' === library.name ) {
					return;
				}
				elementor.iconManager.library.initIconType( library );
			} );
			this.cache.loaded = true;
		}
	}

	onPickerShow() {
		const controlView = this.getSettings( 'controlView' ),
			loaded = {
				GoPro: true,
			},
			iconManagerConfig = {
				recommended: controlView.model.get( 'recommended' ) || false,
			};

		let selected = controlView.getControlValue(),
			icons = elementor.config.icons.libraries;

		if ( ! selected.library || ! selected.value ) {
			selected = {
				value: '',
				library: '',
			};
		}

		iconManagerConfig.selected = selected;

		this.setSettings( 'selectedIcon', selected );

		if ( iconManagerConfig.recommended ) {
			let hasRecommended = false;
			icons.forEach( ( library, index ) => {
				if ( 'recommended' === library.name ) {
					hasRecommended = true;
					icons[ index ].icons = iconManagerConfig.recommended;
				}
			} );
			if ( ! hasRecommended ) {
				icons.unshift( {
					name: 'recommended',
					label: 'Recommended',
					icons: iconManagerConfig.recommended,
					labelIcon: 'eicon-star-o',
					native: true,
				} );
			}
		} else {
			icons = icons.filter( ( library ) => {
				return 'recommended' !== library.name;
			} );
		}

		icons.forEach( ( tab, index ) => {
			if ( -1 === [ 'all', 'recommended' ].indexOf( tab.name ) ) {
				elementor.iconManager.library.initIconType( tab, ( lib ) => {
					icons[ index ] = lib;
				} );
			}
			loaded[ tab.name ] = true;
		} );
		iconManagerConfig.loaded = loaded;
		iconManagerConfig.icons = icons;

		// Set active tab
		let activeTab = selected.library || icons[ 0 ].name;
		if ( 'svg' === selected.library ) {
			activeTab = icons[ 0 ].name;
		}

		// Selected Library exists
		if ( ! Object.keys( icons ).some( ( library ) => library === activeTab ) ) {
			activeTab = icons[ 0 ].name;
		}

		// Show recommended tab if selected from it
		if ( iconManagerConfig.recommended && '' !== selected.library && '' !== selected.value && Object.prototype.hasOwnProperty.call( iconManagerConfig.recommended, selected.library ) ) {
			const iconLibrary = icons.filter( ( library ) => selected.library === library.name );
			const selectedIconName = selected.value.replace( iconLibrary[ 0 ].displayPrefix + ' ' + iconLibrary[ 0 ].prefix, '' );
			if ( iconManagerConfig.recommended[ selected.library ].some( ( icon ) => -1 < icon.indexOf( selectedIconName ) ) ) {
				activeTab = icons[ 0 ].name;
			}
		}

		iconManagerConfig.customIconsURL = elementor.config.customIconsURL;

		iconManagerConfig.activeTab = activeTab;
		return renderIconManager( iconManagerConfig );
	}

	updateControlValue() {
		const settings = this.getSettings();

		settings.controlView.setValue( settings.selectedIcon );
		settings.controlView.applySavedValue();
	}

	show( options ) {
		this.setSettings( 'controlView', options.view );

		this.getLayout().showModal( options );
	}
}
