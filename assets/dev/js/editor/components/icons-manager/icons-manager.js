import ModalLayout from './modal-layout';
import { renderIconManager } from './components/icon-manager';
import IconLibrary from './classes/icon-library';
import Store from './classes/store';
import { unmountComponentAtNode } from 'react-dom';

export default class extends elementorModules.Module {
	onInit() {
		this.layout = new ModalLayout();
		const layoutModal = this.layout.getModal();
		layoutModal.addButton( {
			name: 'insert_icon',
			className: 'elementor-button',
			text: elementor.translate( 'Insert' ),
			callback: () => {
				this.updateControlValue();
				this.unMountIconManager();
			},
		} );

		layoutModal.on( 'show', this.onPickerShow )
			.on( 'hide', this.unMountIconManager );

		// Init icon library helper
		this.library = new IconLibrary();
		// Init Icon library Storage helper
		this.store = new Store();
		// Fetch fa4 to fa5 migration data
		elementor.helpers.fetchFa4ToFa5Mapping();
	}

	unMountIconManager() {
		const containerElement = document.querySelector( '#elementor--icon--manager--placeholder' );
		unmountComponentAtNode( containerElement );
	}

	onPickerShow() {
		const controlView = this.getSettings( 'controlView' ),
			loaded = {},
			iconManagerConfig = {
				modalView: elementor.iconManager.layout.modalContent.currentView,
				controlView: controlView,
				searchBar: controlView.model.get( 'search_bar' ),
				recommended: controlView.model.get( 'recommended' ) || false,
			};
		let selected = controlView.getControlValue(),
			icons = elementor.config.icons;

		if ( ! selected.library || ! selected.value ) {
			selected = {
				value: '',
				library: '',
			};
		}
		iconManagerConfig.selected = selected;
		iconManagerConfig.modalView.options.selectedIcon = selected;
		if ( iconManagerConfig.recommended ) {
			let hasRecommended = false;
			icons.forEach( ( library ) => {
				if ( 'recommended' === library.name ) {
					hasRecommended = true;
				}
			} );
			if ( ! hasRecommended ) {
				icons.unshift( {
					name: 'recommended',
					label: 'Recommended',
					icons: iconManagerConfig.recommended,
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

		// Show recommended tab if selected from it
		if ( iconManagerConfig.recommended && '' !== selected.library && '' !== selected.value && iconManagerConfig.recommended.hasOwnProperty( selected.library ) ) {
			const iconLibrary = icons.filter( ( library ) => selected.library === library.name );
			const selectedIconName = selected.value.replace( iconLibrary[ 0 ].displayPrefix + ' ' + iconLibrary[ 0 ].prefix, '' );
			if ( iconManagerConfig.recommended[ selected.library ].some( ( icon ) => -1 < icon.indexOf( selectedIconName ) ) ) {
				activeTab = icons[ 0 ].name;
			}
		}
		iconManagerConfig.activeTab = activeTab;
		return renderIconManager( iconManagerConfig );
	}

	updateControlValue() {
		const view = this.layout.modal.getSettings( 'controlView' );
		view.setValue( this.layout.modalContent.currentView.options.selectedIcon );
		view.applySavedValue();
	}

	show( options ) {
		this.layout.showModal( options );
	}
}
