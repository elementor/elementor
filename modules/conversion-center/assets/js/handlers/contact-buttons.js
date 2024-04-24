export default class ContactButtonsHandler extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				content: '.e-contact-buttons__content',
				chatButton: '.e-contact-buttons__chat-button',
				closeButton: '.e-contact-buttons__close-button',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );
		return {
			$content: this.$element.find( selectors.content ),
			$chatButton: this.$element.find( selectors.chatButton ),
			$closeButton: this.$element.find( selectors.closeButton ),
		};
	}

	bindEvents() {
		this.elements.$closeButton.on( 'click', this.onCloseButtonClick.bind( this ) );
		this.elements.$chatButton.on( 'click', this.onChatButtonClick.bind( this ) );
	}

	onChatButtonClick() {
		this.elements.$content.toggleClass( 'is-visible' );
	}

	onCloseButtonClick() {
		this.elements.$content.removeClass( 'is-visible' );
	}
}
