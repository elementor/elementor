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

		setTimeout( function() {
			$element.removeClass( 'elementor-invisible' ).addClass( animation );
		}, animationDelay );
	},
	getAnimation: function() {
		var elementSettings = this.getElementSettings();

		return elementSettings.animation || elementSettings._animation;
	},
	onInit: function() {
		var self = this;

		HandlerModule.prototype.onInit.apply( self, arguments );

		if ( ! self.getAnimation() ) {
			return;
		}

		var waypoint = elementorFrontend.waypoint( self.$element, function() {
			self.animate();

			if ( waypoint && waypoint[0] && waypoint[0].destroy ) { // If it's Waypoint new API and is frontend
				waypoint[0].destroy();
			}
		}, { offset: '90%' } );
	},
	onElementChange: function( propertyName ) {
		if ( /^_?animation/.test( propertyName ) ) {
			this.animate();
		}
	}
} );

module.exports = function( $scope ) {
	new GlobalHandler( { $element: $scope } );
};
