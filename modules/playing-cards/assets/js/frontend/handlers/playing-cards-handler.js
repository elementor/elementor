export default class PlayingCardHandler extends elementorModules.frontend.handlers.Base {
	onInit() {
		super.onInit();
		this.elements = this.getDefaultElements();
		this.clickHandler = this.onClick.bind( this );
	}
	getDefaultSettings() {
		const cardItemPrefix = 'e-playing-cards-item';
		return {
			selectors: {
				playingCardContainer: '.e-playing-cards',
				playingCardItem: `.${ cardItemPrefix }`,
			},
			classes: {
				playingCardBack: `${ cardItemPrefix }-back_suit`,
			},
		};
	}

	getDefaultElements() {
		const { selectors } = this.getSettings();

		return { $playingCardContainer: this.findElement( selectors.playingCardContainer ) };
	}

	bindEvents() {
		this.elements.$playingCardContainer.on( 'click', this.clickHandler );
	}

	unbindEvents() {
		this.elements.$playingCardContainer.off();
	}

	onClick( e ) {
		e.preventDefault();
		const { selectors, classes } = this.getSettings();
		const clickedCard = e.target.closest( selectors.playingCardItem );

		if ( clickedCard ) {
			clickedCard.classList.toggle( classes.playingCardBack );
		}
	}
}
