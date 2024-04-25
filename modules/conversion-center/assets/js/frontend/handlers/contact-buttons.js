import Base from 'elementor-frontend/handlers/base';

export default class ContactButtonsHandler extends Base {
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
			content: this.$element[ 0 ].querySelector( selectors.content ),
			chatButton: this.$element[ 0 ].querySelector( selectors.chatButton ),
			closeButton: this.$element[ 0 ].querySelector( selectors.closeButton ),
		};
	}

	bindEvents() {
		this.elements.closeButton.addEventListener( 'click', this.onCloseButtonClick.bind( this ) );
		this.elements.chatButton.addEventListener( 'click', this.onChatButtonClick.bind( this ) );
	}

	onChatButtonClick() {
		this.elements.content.classList.toggle( 'is-visible' );
	}

	onCloseButtonClick() {
		this.elements.content.classList.remove( 'is-visible' );
	}
}
