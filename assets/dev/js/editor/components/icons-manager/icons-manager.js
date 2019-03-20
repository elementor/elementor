import ModalLayout from './modal-layout';
import { renderIconManager } from './components/icon-manager';

export default class extends elementorModules.Module {
	onInit() {
		this.layout = new ModalLayout();
		this.layout.getModal().addButton( {
			name: 'insert_icon',
			className: 'elementor-button',
			text: elementor.translate( 'Insert' ),
			callback: ( modal ) => {
				this.updateControlValue( modal.getSettings( 'controlView' ), this.layout.modalContent.currentView );
			},
		} );

		this.layout.getModal().on( 'show', this.onPickerShow );
	}

	onPickerShow() {
		const controlView = this.getSettings( 'controlView' ),
			iconManagerConfig = {
				selected: controlView.getControlValue(),
				modalView: elementor.iconManager.layout.modalContent.currentView,
				include: controlView.model.get( 'include' ),
				exclude: controlView.model.get( 'exclude' ),
				searchBar: controlView.model.get( 'search_bar' ),
			};
		renderIconManager( iconManagerConfig );
		return;
		let tabToShow = Object.keys( ElementorConfig.icons )[ 0 ];

		modalView.reset();
		if ( include ) {
			modalView.hideAllTabs();
			_.each( include, ( icons, tab ) => {
				modalView.showTabByName( tab );
			} );
			controlIcons.include = include;
			tabToShow = Object.keys( include )[ 0 ];
		}

		if ( exclude ) {
			controlIcons.exclude = exclude;
		}

		modalView.cache.icons = controlIcons;
		modalView.toggleSearchBarVisibility( searchBar );

		if ( data.library && data.value ) {
			modalView.showTab( data.library );
			const $icon = jQuery( '.icon-list-item i[class="' + data.value + '"]' );
			if ( $icon.length ) {
				const $iconLi = $icon.parent();
				modalView.setSelected( $iconLi );
				setTimeout( () => $iconLi[ 0 ].scrollIntoView( false ), 100 );
			}
			return;
		}

		modalView.showTab( tabToShow );
	}

	updateControlValue( view, modal ) {
		view.setValue( {
			value: modal.$el.find( '#icon_value' ).val(),
			library: modal.$el.find( '#icon_type' ).val(),
		} );
		view.applySavedValue();
	}

	show( options ) {
		this.layout.showModal( options );
	}
}
