import BaseHandler from './base';

export default class SwiperHandlerBase extends BaseHandler {
	getInitialSlide() {
		const editSettings = this.getEditSettings();

		return editSettings.activeItemIndex ? editSettings.activeItemIndex - 1 : 0;
	}

	getSlidesCount() {
		return this.elements.$slides.length;
	}

	// This method live-handles the 'Pause On Hover' control's value being changed in the Editor Panel
	togglePauseOnHover( toggleOn ) {
		if ( toggleOn ) {
			this.elements.$swiperContainer.on( {
				mouseenter: () => {
					this.swiper.autoplay.stop();
				},
				mouseleave: () => {
					this.swiper.autoplay.start();
				},
			} );
		} else {
			this.elements.$swiperContainer.off( 'mouseenter mouseleave' );
		}
	}

	handleKenBurns() {
		const settings = this.getSettings();

		if ( this.$activeImageBg ) {
			this.$activeImageBg.removeClass( settings.classes.kenBurnsActive );
		}

		this.activeItemIndex = this.swiper ? this.swiper.activeIndex : this.getInitialSlide();

		if ( this.swiper ) {
			this.$activeImageBg = jQuery( this.swiper.slides[ this.activeItemIndex ] ).children( '.' + settings.classes.slideBackground );
		} else {
			this.$activeImageBg = jQuery( this.elements.$slides[ 0 ] ).children( '.' + settings.classes.slideBackground );
		}

		this.$activeImageBg.addClass( settings.classes.kenBurnsActive );
	}
}
