import Base from './base';

export default class StretchedElement extends Base {
	getStretchedClass() {
		return 'e-stretched';
	}

	getStretchSettingName() {
		return 'stretch_element';
	}

	getStretchActiveValue() {
		return 'yes';
	}

	bindEvents() {
		const handlerID = this.getUniqueHandlerID();

		elementorFrontend.addListenerOnce( handlerID, 'resize', this.stretch );

		elementorFrontend.addListenerOnce( handlerID, 'sticky:stick', this.stretch, this.$element );

		elementorFrontend.addListenerOnce( handlerID, 'sticky:unstick', this.stretch, this.$element );

		if ( elementorFrontend.isEditMode() ) {
			this.onKitChangeStretchContainerChange = this.onKitChangeStretchContainerChange.bind( this );
			elementor.channels.editor.on( 'kit:change:stretchContainer', this.onKitChangeStretchContainerChange );
		}
	}

	unbindEvents() {
		elementorFrontend.removeListeners( this.getUniqueHandlerID(), 'resize', this.stretch );

		if ( elementorFrontend.isEditMode() ) {
			elementor.channels.editor.off( 'kit:change:stretchContainer', this.onKitChangeStretchContainerChange );
		}
	}

	isActive( settings ) {
		return elementorFrontend.isEditMode() || settings.$element.hasClass( this.getStretchedClass() );
	}

	getStretchElementForConfig( childSelector = null ) {
		if ( childSelector ) {
			return this.$element.find( childSelector );
		}

		return this.$element;
	}

	getStretchElementConfig() {
		return {
			element: this.getStretchElementForConfig(),
			selectors: {
				container: this.getStretchContainer(),
			},
			considerScrollbar: elementorFrontend.isEditMode() && elementorFrontend.config.is_rtl,
		};
	}

	initStretch() {
		this.stretch = this.stretch.bind( this );

		this.stretchElement = new elementorModules.frontend.tools.StretchElement( this.getStretchElementConfig() );
	}

	getStretchContainer() {
		return elementorFrontend.getKitSettings( 'stretched_section_container' ) || window;
	}

	isStretchSettingEnabled() {
		return this.getElementSettings( this.getStretchSettingName() ) === this.getStretchActiveValue();
	}

	stretch() {
		if ( ! this.isStretchSettingEnabled() ) {
			return;
		}

		this.stretchElement.stretch();
	}

	onInit( ...args ) {
		if ( ! this.isActive( this.getSettings() ) ) {
			return;
		}

		this.initStretch();

		super.onInit( ...args );

		this.stretch();
	}

	onElementChange( propertyName ) {
		const stretchSettingName = this.getStretchSettingName();

		if ( stretchSettingName === propertyName ) {
			if ( this.isStretchSettingEnabled() ) {
				this.stretch();
			} else {
				this.stretchElement.reset();
			}
		}
	}

	onKitChangeStretchContainerChange() {
		this.stretchElement.setSettings( 'selectors.container', this.getStretchContainer() );

		this.stretch();
	}
}
