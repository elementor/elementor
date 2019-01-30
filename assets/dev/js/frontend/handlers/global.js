var HandlerModule = require( 'elementor-frontend/handler-module' ),
	GlobalHandler;

GlobalHandler = HandlerModule.extend( {
	getElementName: function() {
		return 'global';
	},
	animate: function() {
		var $element = this.$element,
			animation = this.getAnimation(),
			elementSettings = this.getElementSettings(),
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
		HandlerModule.prototype.onInit.apply( this, arguments );

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
	new GlobalHandler( { $element: $scope } );
};
