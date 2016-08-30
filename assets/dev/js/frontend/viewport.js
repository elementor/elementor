var Viewport;

Viewport = function( $ ) {
	var self = this,
		settings = {},
		elements = {};

	var initSettings = function() {
		$.extend( settings, {
			breakpoints: elementorFrontend.config.viewportBreakpoints,
			classTemplate: 'elementor-screen-{breakpoint}-{endpoint}',
			classMatchRegex: /^elementor-screen-([a-z]{2})-(min|max)$/
		} );
	};

	var initElements = function() {
		elements.previewWindow = elementorFrontend.getScopeWindow();
		elements.previewBody = elements.previewWindow.document.body;
	};

	this.addBodyClasses = function() {
		var bodyClasses = elements.previewBody.classList,
			breakpointsNames = Object.keys( settings.breakpoints ),
			newClassesStack = [];

		$.each( bodyClasses, function() {
			var matches = this.match( settings.classMatchRegex );

			if ( ! matches || -1 === breakpointsNames.indexOf( matches[1] )  ) {
				newClassesStack.push( this );
			}
		} );

		elements.previewBody.className = '';

		newClassesStack = newClassesStack.concat( self.getViewportClasses() );

		bodyClasses.add.apply( bodyClasses, newClassesStack );
	};

	var attachEvents = function() {
		$( elements.previewWindow ).on( 'resize', elementorFrontend.throttle( self.addBodyClasses, 300 ) );
	};

	var getBreakpointClass = function( breakpointName, endpoint ) {
		return settings.classTemplate
			.replace( '{breakpoint}', breakpointName )
			.replace( '{endpoint}', endpoint );
	};

	this.init = function() {
		initSettings();
		initElements();
		attachEvents();
	};

	// Return true when window width
	// is not less than breakpoint width
	this.isMinBreakpoint = function( breakpointName ) {
		return elements.previewWindow.innerWidth >= settings.breakpoints[ breakpointName ];
	};

	// Return true when window width
	// is not greater than breakpoint highest width
	this.isMaxBreakpoint = function( breakpointName ) {
		var breakpointNames = Object.keys( settings.breakpoints ),
			breakpointNameIndex = breakpointNames.indexOf( breakpointName ),
			nextBreakpointName = breakpointNames[ breakpointNameIndex + 1 ],
			nextBreakpointValue = settings.breakpoints[ nextBreakpointName ];

		return elements.previewWindow.innerWidth < nextBreakpointValue;
	};

	this.getCurrentBreakpoints = function( endpoint ) {
		var breakpoints = {};

		$.each( settings.breakpoints, function( breakpointName ) {
			if (
				'min' === endpoint && self.isMinBreakpoint( breakpointName ) ||
				'max' === endpoint && self.isMaxBreakpoint( breakpointName ) ||
				self.isMinBreakpoint( breakpointName ) && self.isMaxBreakpoint( breakpointName )
			) {
				breakpoints[ breakpointName ] = this;
			}
		} );

		return breakpoints;
	};

	this.getViewportClasses = function() {
		var classes = [];

		$.each( [ 'min', 'max' ], function() {
			var endpoint = this.toString(),
				breakpoints = self.getCurrentBreakpoints( endpoint );

			$.each( breakpoints, function( breakpointName ) {
				classes.push( getBreakpointClass( breakpointName, endpoint ) );
			} );
		} );

		return classes;
	};
};

module.exports = Viewport;
