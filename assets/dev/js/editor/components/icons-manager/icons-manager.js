import ModalLayout from './modal-layout';
import { renderIconManager } from './components/icon-manager';
import IconLibrary from './classes/icon-library';
import { unmountComponentAtNode } from 'react-dom';

export default class extends elementorModules.Module {
	onInit() {
		this.layout = new ModalLayout();
		this.layout.getModal().addButton( {
			name: 'insert_icon',
			className: 'elementor-button',
			text: elementor.translate( 'Insert' ),
			callback: ( modal ) => {
				this.updateControlValue( modal.getSettings( 'controlView' ), this.layout.modalContent.currentView );
				this.unMountIconManager();
			},
		} );

		this.layout.getModal().on( 'show', this.onPickerShow );
		this.layout.getModal().on( 'hide', this.unMountIconManager );
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
				include: controlView.model.get( 'include' ) || false,
				exclude: controlView.model.get( 'exclude' ) || false,
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

		// Include/Exclude Libraries
		if ( iconManagerConfig.include || iconManagerConfig.exclude ) {
			icons = icons.filter( ( library ) => {
				const type = library.name;
				if ( iconManagerConfig.include.length ) {
					return -1 !== iconManagerConfig.include.indexOf( type );
				} else if ( iconManagerConfig.include[ type ] ) {
					return true;
				}

				if ( iconManagerConfig.exclude.length ) {
					return -1 === iconManagerConfig.exclude.indexOf( type );
				} else if ( iconManagerConfig.exclude[ type ] ) {
					return true;
				}
				return false;
			} );
		}

		icons.forEach( ( tab, index ) => {
			if ( 'all' !== tab.name ) {
				IconLibrary.initIconType( tab, ( lib ) => {
					icons[ index ] = lib;
				} );
			}
			loaded[ tab.name ] = true;
		} );
		iconManagerConfig.loaded = loaded;
		iconManagerConfig.icons = icons;
		iconManagerConfig.activeTab = '' !== selected.library ? selected.library : icons[ 0 ].name;

		return renderIconManager( iconManagerConfig );
	}

	updateControlValue( view, modal ) {
		view.setValue( modal.options.selectedIcon );
		view.applySavedValue();
	}

	show( options ) {
		this.layout.showModal( options );
	}
}
