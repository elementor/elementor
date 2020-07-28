const originalSwiper = window.Swiper;

export default class Swiper {
	constructor( container, config ) {
		this.config = config;

		if ( this.config.breakpoints ) {
			// The config is passed as a param to allow adjustConfig to be called outside of this wrapper
			this.config = this.adjustConfig( config );
		}

		originalSwiper.prototype.adjustConfig = this.adjustConfig;

		return new originalSwiper( container, this.config );
	}

	// Backwards compatibility for Elementor Pro <2.9.0 (old Swiper version - <5.0.0)
	// In Swiper 5.0.0 and up, breakpoints changed from acting as max-width to acting as min-width
	adjustConfig( config ) {
		// Only reverse the breakpoints if the handle param has been defined
		if ( ! config.handleElementorBreakpoints ) {
			return config;
		}

		const elementorBreakpoints = elementorFrontend.config.breakpoints,
			elementorBreakpointValues = Object.values( elementorBreakpoints );

		Object.keys( config.breakpoints ).forEach( ( configBPKey ) => {
			const configBPKeyInt = parseInt( configBPKey );
			let breakpointToUpdate;

			// The `configBPKeyInt + 1` is a BC Fix for Elementor Pro Carousels from 2.8.0-2.8.3 used with Elementor >= 2.9.0
			if ( configBPKeyInt === elementorBreakpoints.md || ( configBPKeyInt + 1 ) === elementorBreakpoints.md ) {
				// This handles the mobile breakpoint. Elementor's default sm breakpoint is never actually used,
				// so the mobile breakpoint (md) needs to be handled separately and set to the 0 breakpoint (xs)
				breakpointToUpdate = elementorBreakpoints.xs;
			} else {
				// Find the index of the current config breakpoint in the Elementor Breakpoints array
				const currentBPIndexInElementorBPs = elementorBreakpointValues.findIndex( ( elementorBP ) => {
					// BC Fix for Elementor Pro Carousels from 2.8.0-2.8.3 used with Elementor >= 2.9.0
					return configBPKeyInt === elementorBP || ( configBPKeyInt + 1 ) === elementorBP;
				} );

				// For all other Swiper config breakpoints, move them one breakpoint down on the breakpoint list,
				// according to the array of Elementor's global breakpoints
				breakpointToUpdate = elementorBreakpointValues[ currentBPIndexInElementorBPs - 1 ];
			}

			config.breakpoints[ breakpointToUpdate ] = config.breakpoints[ configBPKey ];

			// Then reset the settings in the original breakpoint key to the default values
			config.breakpoints[ configBPKey ] = {
				slidesPerView: config.slidesPerView,
				slidesPerGroup: config.slidesPerGroup ? config.slidesPerGroup : 1,
			};
		} );

		return config;
	}
}

window.Swiper = Swiper;
