import Base from 'elementor/assets/dev/js/frontend/handlers/base';

export default class NestedAccordion extends Base {
	getDefaultSettings() {
		return {
			selectors: {
				accordionContentContainers: '.e-n-accordion > .e-con',
				accordionItems: '.e-n-accordion-item',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			$contentContainers: this.findElement( selectors.accordionContentContainers ),
			$items: this.findElement( selectors.accordionItems ),
		};
	}

	onInit( ...args ) {
		super.onInit( ...args );

		if ( elementorFrontend.isEditMode() ) {
			this.interlaceContainers();
		}

		this.applyDefaultStateCondition();
	}

	interlaceContainers() {
		const { $contentContainers, $items } = this.getDefaultElements();

		$contentContainers.each( ( index, element ) => {
			$items[ index ].appendChild( element );
		} );
	}

	applyDefaultStateCondition() {
		if ( ! this.elements ) {
			return;
		}

		const accordionItems = this.elements.$items,
			defaultState = this.getDefaultStateCondition(),
			stateFirstExpanded = 'first_expended';

		if ( stateFirstExpanded === defaultState ) {
			accordionItems[ 0 ].setAttribute( 'open', '' );
		} else {
			accordionItems.each( ( item ) => item.removeAttribute( 'open' ) );
		}
	}

	getDefaultStateCondition() {
		const currentDevice = elementorFrontend.getCurrentDeviceMode(),
			defaultState = elementorFrontend.utils.controls.getResponsiveControlValue( this.getElementSettings(), 'default_state', '', currentDevice );

		return defaultState;
	}
}
