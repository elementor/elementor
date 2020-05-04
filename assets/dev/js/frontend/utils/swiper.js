const originalSwiper = window.Swiper;

export default class Swiper {
	constructor( container, config ) {
		this.config = config;

		if ( this.config.breakpoints && this.config.handleElementorBreakpoints ) {
			this.adjustConfig();
		}

		return new originalSwiper( container, this.config );
	}

	// Backwards compatibility for Elementor Pro <2.9.0 (old Swiper version - <5.0.0)
	// In Swiper 5.0.0 and up, breakpoints changed from acting as max-width to acting as min-width
	adjustConfig() {
		const elementorBreakpoints = elementorFrontend.config.breakpoints,
			elementorBreakpointValues = Object.values( elementorBreakpoints );

		Object.keys( this.config.breakpoints ).forEach( ( configBPKey ) => {
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

			this.config.breakpoints[ breakpointToUpdate ] = this.config.breakpoints[ configBPKey ];

			// Then reset the settings in the original breakpoint key to the default values
			this.config.breakpoints[ configBPKey ] = {
				slidesPerView: this.config.slidesPerView,
				slidesPerGroup: this.config.slidesPerGroup ? this.config.slidesPerGroup : 1,
			};
		} );
	}
}

window.Swiper = Swiper;
