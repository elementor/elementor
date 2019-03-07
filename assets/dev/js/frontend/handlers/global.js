const GlobalHandler = elementorModules.frontend.handlers.Base.extend( {
	getElementName: function() {
		return 'global';
	},
	animate: function() {
		const $element = this.$element,
			animation = this.getAnimation();

		if ( 'none' === animation ) {
			$element.removeClass( 'elementor-invisible' );
			return;
		}

		const elementSettings = this.getElementSettings(),
			animationDelay = elementSettings._animation_delay || elementSettings.animation_delay || 0;

		$element.removeClass( animation );

		if ( this.currentAnimation ) {
			$element.removeClass( this.currentAnimation );
		}

		this.currentAnimation = animation;

		setTimeout( function() {
			$element.removeClass( 'elementor-invisible' ).addClass( 'animated ' + animation );
		}, animationDelay );
	},
	getAnimation: function() {
		return this.getCurrentDeviceSetting( 'animation' ) || this.getCurrentDeviceSetting( '_animation' );
	},
	onInit: function() {
		elementorModules.frontend.handlers.Base.prototype.onInit.apply( this, arguments );

		if ( this.getAnimation() ) {
			elementorFrontend.waypoint( this.$element, this.animate.bind( this ) );
		}
	},
	onElementChange: function( propertyName ) {
		if ( /^_?animation/.test( propertyName ) ) {
			this.animate();
		}
	},
} );

module.exports = function( $scope ) {
	elementorFrontend.elementsHandler.addHandler( GlobalHandler, { $element: $scope } );
};
