import Base from 'elementor-frontend/handlers/base';

export default class ContactButtonsHandler extends Base {
	getDefaultSettings() {
		return {
			selectors: {
				content: '.e-contact-buttons__content',
				contentWrapper: '.e-contact-buttons__content-wrapper',
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
			contentWrapper: this.$element[ 0 ].querySelector( selectors.contentWrapper ),
			chatButton: this.$element[ 0 ].querySelector( selectors.chatButton ),
			closeButton: this.$element[ 0 ].querySelector( selectors.closeButton ),
			messageBubbleTime: this.$element[ 0 ].querySelector( selectors.messageBubbleTime ),
		};
	}

	getResponsiveSetting( controlName ) {
		const currentDevice = elementorFrontend.getCurrentDeviceMode();
		return elementorFrontend.utils.controls.getResponsiveControlValue( this.getElementSettings(), controlName, '', currentDevice );
	}

	bindEvents() {
		this.elements.closeButton.addEventListener( 'click', this.onCloseButtonClick.bind( this ) );
		this.elements.chatButton.addEventListener( 'click', this.onChatButtonClick.bind( this ) );
		this.elements.content.addEventListener( 'animationend', this.removeAnimationClasses.bind( this ) );
	}

	removeAnimationClasses() {
		const isExitAnimation = this.elements.content.classList.contains( 'animated-reversed' ),
			openAnimationClass = this.getResponsiveSetting( 'style_chat_box_entrance_animation' ),
			exitAnimationClass = this.getResponsiveSetting( 'style_chat_box_exit_animation' );

		if ( isExitAnimation ) {
			this.elements.content.classList.remove( 'animated' );
			this.elements.content.classList.remove( 'animated-reversed' );
			this.elements.content.classList.remove( exitAnimationClass );
			this.elements.content.classList.remove( 'visible' );
		} else {
			this.elements.content.classList.remove( 'animated' );
			this.elements.content.classList.remove( openAnimationClass );
			this.elements.content.classList.add( 'visible' );
		}
	}

	chatBoxEntranceAnimation() {
		const entranceAnimation = this.getResponsiveSetting( 'style_chat_box_entrance_animation' );
		this.elements.content.classList.remove( 'is-hidden' );

		if ( 'none' === entranceAnimation ) {
			return;
		}

		this.elements.content.classList.add( 'animated' );
		this.elements.content.classList.add( entranceAnimation );
		this.elements.contentWrapper.classList.remove( 'animated-wrapper' );
	}

	chatBoxExitAnimation() {
		const exitAnimation = this.getResponsiveSetting( 'style_chat_box_exit_animation' );

		if ( 'none' === exitAnimation ) {
			return;
		}

		this.elements.content.classList.add( 'animated' );
		this.elements.content.classList.add( 'animated-reversed' );
		this.elements.content.classList.add( exitAnimation );
		this.elements.contentWrapper.classList.add( 'animated-wrapper' );
	}

	openChatBox() {
		this.elements.contentWrapper.classList.remove( 'hidden' );
		this.chatBoxEntranceAnimation();
	}

	closeChatBox() {
		this.chatBoxExitAnimation();
		this.elements.contentWrapper.classList.add( 'hidden' );
	}

	onChatButtonClick() {
		if ( this.elements.contentWrapper.classList.contains( 'hidden' ) ) {
			this.openChatBox();
		} else {
			this.closeChatBox();
		}
	}

	onCloseButtonClick() {
		this.closeChatBox();
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
