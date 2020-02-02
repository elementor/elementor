const originalSwiper = window.Swiper;

export default class Swiper {
	constructor( container, config ) {
		this.config = config;

		this.adjustConfig();

		return new originalSwiper( container, this.config );
	}

	// Backwards compatibility for Elementor Pro <2.9.0 (old Swiper version - <5.0.0)
	// In Swiper 5.0.0 and up, breakpoints changed from acting as max-width to acting as min-width
	adjustConfig() {
		if ( this.config.breakpoints ) {
			const elementorBPs = elementorFrontend.config.breakpoints;

			// If the user configured a mobile breakpoint, change it to start from screen width of 0 pixels
			if ( this.config.breakpoints[ elementorBPs.sm ] ) {
				this.config.breakpoints[ 0 ] = this.config.breakpoints[ elementorBPs.sm ];

				// If a user configured a mobile breakpoint and did not configure a tablet breakpoint
				if ( ! this.config.breakpoints[ elementorBPs.md ] ) {
					// Set the tablet breakpoint from the default/desktop setting
					this.config.breakpoints[ elementorBPs.md ] = {
						slidesPerView: this.config.slidesPerView,
						slidesPerGroup: this.config.slidesPerGroup,
					};
				}
			}

			// If the user configured a tablet breakpoint, set it to start from the mobile breakpoint
			if ( this.config.breakpoints[ elementorBPs.md ] ) {
				this.config.breakpoints[ elementorBPs.sm ] = this.config.breakpoints[ elementorBPs.md ];
			}

			if ( this.config.breakpoints[ elementorBPs.sm ] || this.config.breakpoints[ elementorBPs.md ] ) {
				// If a mobile or tablet breakpoint was set, we need to manually set a desktop breakpoint
				this.config.breakpoints[ elementorBPs.lg ] = {
					slidesPerView: this.config.slidesPerView,
					slidesPerGroup: this.config.slidesPerGroup,
				};
			}
		}
	}
}

window.Swiper = Swiper;
