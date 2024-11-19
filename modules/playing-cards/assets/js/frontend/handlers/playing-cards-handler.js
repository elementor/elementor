import Base from 'elementor-frontend/handlers/base';

// Export default class PlayingCardHandler extends elementorModules.frontend.handlers.Base {
export default class PlayingCardHandler extends Base {
	onInit() {
		super.onInit();
		this.elements = this.getDefaultElements();
	}
	getDefaultSettings() {

		return { selectors: { playingCard: '.e-playing-cards-wrapper-item' }, default_state: 'expanded' };
	}

	getDefaultElements() {
		const settings = this.getSettings( 'selectors' );
		console.log('!!_SETTING_!!', this.getSettings( 'selectors' ) );

		return { $playingCard: this.findElement( settings.playingCard ) };

	}

	bindEvents() {
		console.log('!_bind_events_!')
		this.elements.$playingCard.on( 'click', this.clickListener.bind( this ) );
	}

	unbindEvents() {
		this.elements.$playingCard.off();
	}

	clickListener( e ) {
		e.preventDefault();
		const t = e.currentTarget.querySelector( '.e-playing-cards-wrapper-item-number' );
		console.log("The card number you chose is:" + t.innerHTML);
	}
}
