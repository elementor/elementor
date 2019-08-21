export default class StretchedSection extends elementorModules.frontend.handlers.Base {
	bindEvents() {
		const handlerID = this.getUniqueHandlerID();

		elementorFrontend.addListenerOnce( handlerID, 'resize', this.stretch );

		elementorFrontend.addListenerOnce( handlerID, 'sticky:stick', this.stretch, this.$element );

		elementorFrontend.addListenerOnce( handlerID, 'sticky:unstick', this.stretch, this.$element );
	}

	unbindEvents() {
		elementorFrontend.removeListeners( this.getUniqueHandlerID(), 'resize', this.stretch );
	}

	initStretch() {
		this.stretch = this.stretch.bind( this );

		this.stretchElement = new elementorModules.frontend.tools.StretchElement( {
			element: this.$element,
			selectors: {
				container: this.getStretchContainer(),
			},
		} );
	}

	getStretchContainer() {
		return elementorFrontend.getGeneralSettings( 'elementor_stretched_section_container' ) || window;
	}

	stretch() {
		if ( ! this.getElementSettings( 'stretch_section' ) ) {
			return;
		}

		this.stretchElement.stretch();
	}

	onInit( ...args ) {
		this.initStretch();

		super.onInit( ...args );

		this.stretch();
	}

	onElementChange( propertyName ) {
		if ( 'stretch_section' === propertyName ) {
			if ( this.getElementSettings( 'stretch_section' ) ) {
				this.stretch();
			} else {
				this.stretchElement.reset();
			}
		}
	}

	onGeneralSettingsChange( changed ) {
		if ( 'elementor_stretched_section_container' in changed ) {
			this.stretchElement.setSettings( 'selectors.container', this.getStretchContainer() );

			this.stretch();
		}
	}
}
