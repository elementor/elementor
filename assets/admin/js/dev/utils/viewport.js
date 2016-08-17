var Viewport;

Viewport = function() {
	var self = this,
		settings = {},
		elements = {};

	var initSettings = function() {
		_.extend( settings, {
			breakpoints: elementor.config.viewport_breakpoints,
			classTemplate: 'elementor-screen-{breakpoint}-{endpoint}',
			classMatchRegex: /^elementor-screen-([a-z]{2})-(min|max)$/
		} );
	};

	var initElements = function() {
		_.extend( elements, {
			previewWindow: elementor.$preview[0].contentWindow,
			previewBody: elementor.$previewContents[0].body
		} );
	};

	var addBodyClasses = function() {
		var bodyClasses = elements.previewBody.classList,
			breakpointsNames = Object.keys( settings.breakpoints ),
			newClassesStack = [];
		bodyClasses.forEach( function( className ) {
			var matches = className.match( settings.classMatchRegex );

			if ( ! matches || -1 === breakpointsNames.indexOf( matches[1] )  ) {
				newClassesStack.push( className );
			}
		} );

		elements.previewBody.className = '';

		newClassesStack = newClassesStack.concat( self.getViewportClasses() );

		bodyClasses.add.apply( bodyClasses, newClassesStack );
	};

	var attachEvents = function() {
		Backbone.$( elements.previewWindow ).on( 'resize', _.throttle( addBodyClasses, 200 ) );
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
		return _.pick(
			settings.breakpoints,
			function( breakpointValue, breakpointName ) {
				return (
					'min' === endpoint ? self.isMinBreakpoint( breakpointName ) :
					'max' === endpoint ? self.isMaxBreakpoint( breakpointName ) :
					self.isMinBreakpoint( breakpointName ) || self.isMaxBreakpoint( breakpointName )
				);
			}
		);
	};

	this.getViewportClasses = function() {
		var classes = [];

		_.each( [ 'min', 'max' ], function( endpoint ) {
			var breakpoints = self.getCurrentBreakpoints( endpoint );

			_.each( breakpoints, function( breakpointValue, breakpointName ) {
				classes.push( getBreakpointClass( breakpointName, endpoint ) );
			} );
		} );

		return classes;
	};
};

module.exports = new Viewport();
