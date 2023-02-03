export default class extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
			selectors: {
				notice: '#e-notice-bar',
				close: '#e-notice-bar__close',
			},
		};
	}

	getDefaultElements() {
		const settings = this.getSettings();

		return {
			$notice: jQuery( settings.selectors.notice ),
			$close: jQuery( settings.selectors.close ),
		};
	}

	bindEvents() {
		this.elements.$close.on( 'click', this.onCloseClick.bind( this ) );
	}

	onCloseClick() {
		this.elements.$notice.slideUp();

		elementorCommon.ajax.addRequest( 'notice_bar_dismiss' );
	}
}
