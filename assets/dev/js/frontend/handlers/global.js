class GlobalHandler extends elementorModules.frontend.handlers.Base {
	getWidgetType() {
		return 'global';
	}

	animate() {
		const baseElement = this.baseElement,
			animation = this.getAnimation();

		if ( 'none' === animation ) {
			baseElement?.classList?.remove( 'elementor-invisible' );
			return;
		}

		const elementSettings = this.getElementSettings(),
			animationDelay = elementSettings._animation_delay || elementSettings.animation_delay || 0;

		baseElement?.classList?.remove( animation );

		if ( this.currentAnimation ) {
			baseElement?.classList?.remove( this.currentAnimation );
		}

		this.currentAnimation = animation;

		setTimeout( () => {
			baseElement?.classList?.remove( 'elementor-invisible' ).addClass( 'animated ' + animation );
		}, animationDelay );
	}

	getAnimation() {
		return this.getCurrentDeviceSetting( 'animation' ) || this.getCurrentDeviceSetting( '_animation' );
	}

	onInit( ...args ) {
		this.isJqueryRequired = false;

		super.onInit( ...args );

		if ( this.getAnimation() ) {
			const observer = elementorModules.utils.Scroll.scrollObserver( {
				callback: ( event ) => {
					if ( event.isInViewport ) {
						this.animate();

						observer.unobserve( this.baseElement );
					}
				},
			} );

			observer.observe( this.baseElement );
		}
	}

	onElementChange( propertyName ) {
		if ( /^_?animation/.test( propertyName ) ) {
			this.animate();
		}
	}
}

export default ( scope ) => {
	elementorFrontend.elementsHandler.addHandler( GlobalHandler, { baseElement: scope } );
};
