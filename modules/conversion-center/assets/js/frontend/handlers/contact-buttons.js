import Base from 'elementor-frontend/handlers/base';

export default class ContactButtonsHandler extends Base {
	getDefaultSettings() {
		return {
			selectors: {
				main: '.e-contact-buttons',
				content: '.e-contact-buttons__content',
				contentWrapper: '.e-contact-buttons__content-wrapper',
				chatButton: '.e-contact-buttons__chat-button',
				closeButton: '.e-contact-buttons__close-button',
				messageBubbleTime: '.e-contact-buttons__message-bubble-time',
			},
			constants: {
				entranceAnimation: 'style_chat_box_entrance_animation',
				exitAnimation: 'style_chat_box_exit_animation',
				chatButtonAnimation: 'style_chat_button_animation',
				animated: 'animated',
				animatedWrapper: 'animated-wrapper',
				visible: 'visible',
				reverse: 'reverse',
				hidden: 'hidden',
				hasAnimations: 'has-animations',
				hasEntranceAnimation: 'has-entrance-animation',
				none: 'none',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );
		return {
			main: this.$element[ 0 ].querySelector( selectors.main ),
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
		if ( this.elements.closeButton ) {
			this.elements.closeButton.addEventListener( 'click', this.closeChatBox.bind( this ) );
		}

		if ( this.elements.chatButton ) {
			this.elements.chatButton.addEventListener( 'click', this.onChatButtonClick.bind( this ) );
			this.elements.chatButton.addEventListener( 'animationend', this.removeChatButtonAnimationClasses.bind( this ) );
		}

		if ( this.elements.content ) {
			this.elements.content.addEventListener( 'animationend', this.removeAnimationClasses.bind( this ) );
		}
	}

	removeAnimationClasses() {
		const { reverse, entranceAnimation, exitAnimation, animated, visible } = this.getSettings( 'constants' );

		const isExitAnimation = this.elements.content.classList.contains( reverse ),
			openAnimationClass = this.getResponsiveSetting( entranceAnimation ),
			exitAnimationClass = this.getResponsiveSetting( exitAnimation );

		if ( isExitAnimation ) {
			this.elements.content.classList.remove( animated );
			this.elements.content.classList.remove( reverse );
			this.elements.content.classList.remove( exitAnimationClass );
			this.elements.content.classList.remove( visible );
		} else {
			this.elements.content.classList.remove( animated );
			this.elements.content.classList.remove( openAnimationClass );
			this.elements.content.classList.add( visible );
		}
	}

	chatBoxEntranceAnimation() {
		const { entranceAnimation, animated, animatedWrapper, none } = this.getSettings( 'constants' );

		const entranceAnimationControl = this.getResponsiveSetting( entranceAnimation );

		if ( none === entranceAnimationControl ) {
			return;
		}

		this.elements.content.classList.add( animated );
		this.elements.content.classList.add( entranceAnimationControl );
		this.elements.contentWrapper.classList.remove( animatedWrapper );
	}

	chatBoxExitAnimation() {
		const { reverse, exitAnimation, animated, animatedWrapper, none } = this.getSettings( 'constants' );

		const exitAnimationControl = this.getResponsiveSetting( exitAnimation );

		if ( none === exitAnimationControl ) {
			return;
		}

		this.elements.content.classList.add( animated );
		this.elements.content.classList.add( reverse );
		this.elements.content.classList.add( exitAnimationControl );
		this.elements.contentWrapper.classList.add( animatedWrapper );
	}

	openChatBox() {
		const { hasAnimations, visible, hidden } = this.getSettings( 'constants' );

		if ( this.elements.main.classList.contains( hasAnimations ) ) {
			this.chatBoxEntranceAnimation();
		} else {
			this.elements.content.classList.add( visible );
		}
		this.elements.contentWrapper.classList.remove( hidden );
		this.elements.chatButton.setAttribute( 'aria-hidden', 'true' );
		this.elements.closeButton.setAttribute( 'aria-hidden', 'false' );
	}

	closeChatBox() {
		const { hasAnimations, visible, hidden } = this.getSettings( 'constants' );

		if ( this.elements.main.classList.contains( hasAnimations ) ) {
			this.chatBoxExitAnimation();
		} else {
			this.elements.content.classList.remove( visible );
		}
		this.elements.contentWrapper.classList.add( hidden );
		this.elements.chatButton.setAttribute( 'aria-hidden', 'false' );
		this.elements.closeButton.setAttribute( 'aria-hidden', 'true' );
	}

	onChatButtonClick() {
		const { hidden } = this.getSettings( 'constants' );

		if ( this.elements.contentWrapper.classList.contains( hidden ) ) {
			this.openChatBox();
		} else {
			this.closeChatBox();
		}
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

	removeChatButtonAnimationClasses() {
		const { chatButtonAnimation, visible } = this.getSettings( 'constants' );

		this.elements.chatButton.classList.remove( chatButtonAnimation );
		this.elements.chatButton.classList.add( visible );
	}

	initChatButtonEntranceAnimation() {
		const { none, chatButtonAnimation } = this.getSettings( 'constants' );

		const entranceAnimationControl = this.getResponsiveSetting( chatButtonAnimation );

		if ( none === entranceAnimationControl ) {
			return;
		}

		this.elements.chatButton.classList.add( entranceAnimationControl );
	}

	onInit( ...args ) {
		const { hasEntranceAnimation } = this.getSettings( 'constants' );

		super.onInit( ...args );

		if ( this.elements.messageBubbleTime ) {
			this.initMessageBubbleTime();
		}

		if ( this.elements.chatButton.classList.contains( hasEntranceAnimation ) ) {
			this.initChatButtonEntranceAnimation();
		}
	}
}
