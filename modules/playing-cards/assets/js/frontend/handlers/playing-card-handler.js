export default class PlayingCardHandler extends elementorModules.frontend.handlers.Base {
	onInit() {
		console.log('123123123123123')
		super.onInit();
		this.elements = this.getDefaultElements();
	}
	getDefaultSettings() {
		return { selectors: { playingCard: '.e-playing-cards-item' } };
	}

	getDefaultElements() {
		const settings = this.getSettings( 'selectors' );
		console.log('!!_SETTING_!!', settings);
		return { $playingCard: this.findElement( settings.playingCard ) };
	}
}

