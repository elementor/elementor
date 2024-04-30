import Base from 'elementor-frontend/handlers/base';

export default class ContactButtonsHandler extends Base {
	getDefaultSettings() {
		return {
			selectors: {
				content: '.e-contact-buttons__content',
				chatButton: '.e-contact-buttons__chat-button',
				closeButton: '.e-contact-buttons__close-button',
				messageBubbleTime: '.e-contact-buttons__message-bubble-time',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );
		return {
			content: this.$element[ 0 ].querySelector( selectors.content ),
			chatButton: this.$element[ 0 ].querySelector( selectors.chatButton ),
			closeButton: this.$element[ 0 ].querySelector( selectors.closeButton ),
			messageBubbleTime: this.$element[ 0 ].querySelector( selectors.messageBubbleTime ),
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

	initMessageBubbleTime() {
		const messageBubbleTimeFormat = this.elements.messageBubbleTime.dataset.timeFormat;
		const is12hFormat = '12h' === messageBubbleTimeFormat;
		const time = new Intl.DateTimeFormat( 'default',
			{
				hour12: is12hFormat,
				hour: 'numeric',
				minute: 'numeric',
			} ).format( new Date() );
		this.elements.messageBubbleTime.innerHTML = time;
	}

	getResponsiveSetting( controlName ) {
		const currentDevice = elementorFrontend.getCurrentDeviceMode();
		return elementorFrontend.utils.controls.getResponsiveControlValue( this.getElementSettings(), controlName, '', currentDevice );
	}

	initChatButtonEntranceAnimation() {
		const entranceAnimation = this.getResponsiveSetting( 'style_chat_button_animation' );

		if ( 'none' === entranceAnimation ) {
			return;
		}

		this.elements.chatButton.classList.add( 'animated' );
		this.elements.chatButton.classList.add( entranceAnimation );
	}

	onInit( ...args ) {
		super.onInit( ...args );

		this.initMessageBubbleTime();

		this.initChatButtonEntranceAnimation();
	}
}
