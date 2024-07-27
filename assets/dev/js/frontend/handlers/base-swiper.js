import BaseHandler from './base';

export default class SwiperHandlerBase extends BaseHandler {
	getInitialSlide() {
		const editSettings = this.getEditSettings();

		return editSettings.activeItemIndex ? editSettings.activeItemIndex - 1 : 0;
	}

	getSlidesCount() {
		let numberOfSlides = 0;

		if ( !! this.elements.slides ) {
			numberOfSlides = this.elements.slides.length;
		} else if ( !! this.elements.$slides ) {
			numberOfSlides = this.elements.$slides.length;
		}

		return numberOfSlides;
	}

	getActiveItemIndex() {
		return this.swiper ? this.swiper.activeIndex : this.getInitialSlide();
	}

	getActiveSlideBackgroundImage() {
		const activeSlide = this.swiper.slides[ this.activeItemIndex ];
		return activeSlide.querySelector( '.' + settings.classes.slideBackground );
	}

	getFirstSlideBackgroundImage() {
		let firstSlide = null;

		if ( !! this.elements.slides ) {
			firstSlide = this.elements.slides[ 0 ];
		} else if ( !! this.elements.$slides ) {
			firstSlide = this.elements.$slides[ 0 ];
		}

		return firstSlide.querySelector('.' + settings.classes.slideBackground);
	}

	// This method live-handles the 'Pause On Hover' control's value being changed in the Editor Panel
	togglePauseOnHover( toggleOn ) {
		if ( !! this.elements.$swiperContainer ) {
			this.togglePauseOnHoverWithJQuery( toggleOn );
		} else if ( toggleOn ) {
			this.elements.swiperContainer.addEventListener( 'mouseenter', () => {
				this.swiper.autoplay.stop();
			} );

			this.elements.swiperContainer.addEventListener( 'mouseleave', () => {
				this.swiper.autoplay.start();
			} );
		} else {
			this.elements.swiperContainer.removeEventListener( 'mouseenter' );
			this.elements.swiperContainer.removeEventListener( 'mouseleave' );
		}
	}

	togglePauseOnHoverWithJQuery( toggleOn ) {
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
		if ( !! this.elements.$swiperContainer ) {
			this.handleKenBurnsWithJQuery();
		}

		const settings = this.getSettings();

		this.activeImageBg?.classList.remove( settings.classes.kenBurnsActive );

		this.activeItemIndex = this.getActiveItemIndex();

		if ( this.swiper ) {
			this.activeImageBg = this.getActiveSlideBackgroundImage();
		} else {
			this.activeImageBg = this.getFirstSlideBackgroundImage();
		}

		this.activeImageBg.classList.add( settings.classes.kenBurnsActive );
	}

	handleKenBurnsWithJQuery() {
		const settings = this.getSettings();

		if ( this.$activeImageBg ) {
			this.$activeImageBg.removeClass( settings.classes.kenBurnsActive );
		}

		this.activeItemIndex = this.getActiveItemIndex();

		if ( this.swiper ) {
			this.$activeImageBg = jQuery( this.swiper.slides[ this.activeItemIndex ] ).children( '.' + settings.classes.slideBackground );
		} else {
			this.$activeImageBg = jQuery( this.elements.$slides[ 0 ] ).children( '.' + settings.classes.slideBackground );
		}

		this.$activeImageBg.addClass( settings.classes.kenBurnsActive );
	}
}
