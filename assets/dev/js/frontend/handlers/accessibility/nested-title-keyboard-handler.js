import Base from '../base';

export default class NestedTitleKeyboardHandler extends Base {
	__construct( settings ) {
		super.__construct( settings );

		this.directionNext = 'next';
		this.directionPrevious = 'previous';
		this.focusableElementSelector = 'audio, button, canvas, details, iframe, input, select, summary, textarea, video, [accesskey], [contenteditable], [href], [tabindex]:not([tabindex="-1"])';
	}

	getDefaultSettings() {
		return {
			selectors: {
				itemTitle: '.e-n-tab-title',
				itemContainer: '.e-n-tabs-content > .e-con',
			},
			ariaAttributes: {
				titleStateAttribute: 'aria-selected',
				activeTitleSelector: '[aria-selected="true"]',
				titleControlAttribute: 'aria-controls',
			},
			datasets: {
				titleIndex: 'data-tab-index',
			},
			keyDirection: {
				ArrowLeft: elementorFrontendConfig.is_rtl ? this.directionNext : this.directionPrevious,
				ArrowUp: this.directionPrevious,
				ArrowRight: elementorFrontendConfig.is_rtl ? this.directionPrevious : this.directionNext,
				ArrowDown: this.directionNext,
				Tab: this.directionNext,
				ShiftTab: this.directionPrevious,
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			$itemTitles: this.findElement( selectors.itemTitle ),
			$itemContainers: this.findElement( selectors.itemContainer ),
			$focusableContainerElements: this.getFocusableElements( this.findElement( selectors.itemContainer ) ),
		};
	}

	getFocusableElements( $elements ) {
		return $elements
			.find( this.focusableElementSelector )
			.not( '[disabled], [inert]' );
	}

	getKeyDirectionValue( event ) {
		const direction = this.getSettings( 'keyDirection' )[ event.key ];
		return this.directionNext === direction ? 1 : -1;
	}

	/**
	 * @param {HTMLElement} itemTitleElement
	 *
	 * @return {string}
	 */
	getTitleIndex( itemTitleElement ) {
		const { titleIndex: indexAttribute } = this.getSettings( 'datasets' );
		return parseInt( itemTitleElement?.getAttribute( indexAttribute ) );
	}

	/**
	 * @param {string|number} titleIndex
	 *
	 * @return {string}
	 */
	getTitleFilterSelector( titleIndex ) {
		const { titleIndex: indexAttribute } = this.getSettings( 'datasets' );
		return `[${ indexAttribute }="${ titleIndex }"]`;
	}

	getActiveTitleElement() {
		const activeTitleFilter = this.getSettings( 'ariaAttributes' ).activeTitleSelector;
		return this.elements.$itemTitles.filter( activeTitleFilter );
	}

	onInit( ...args ) {
		super.onInit( ...args );
	}

	bindEvents() {
		this.elements.$itemTitles.on( this.getTitleEvents() );
		this.elements.$focusableContainerElements.on( this.getContentElementEvents() );
	}

	unbindEvents() {
		this.elements.$itemTitles.off();
		this.elements.$itemContainers.children().off();
	}

	getTitleEvents() {
		return {
			keydown: this.handleTitleKeyboardNavigation.bind( this ),
		};
	}

	getContentElementEvents() {
		return {
			keydown: this.handleContentElementKeyboardNavigation.bind( this ),
		};
	}

	isHomeOrEndKey( event ) {
		const directionKeys = [ 'Home', 'End' ];
		return directionKeys.includes( event.key );
	}

	isActivationKey( event ) {
		const activationKeys = [ 'Enter', ' ' ];
		return activationKeys.includes( event.key );
	}

	handleTitleKeyboardNavigation( event ) {
		if ( event.shiftKey && 'Tab' === event.key ) {
			this.closeActiveContentElements();
		} else if ( 'Tab' === event.key ) {
			const currentTitleIndex = this.getTitleIndex( event.currentTarget ),
				$activeTitle = this.getActiveTitleElement(),
				activeTitleIndex = this.getTitleIndex( $activeTitle[ 0 ] ) || false,
				isActiveTitle = currentTitleIndex === activeTitleIndex;

			if ( ! isActiveTitle ) {
				return;
			}

			const activeTitleControl = $activeTitle.attr( this.getSettings( 'ariaAttributes' ).titleControlAttribute ),
				activeContentSelector = `#${ activeTitleControl }`,
				$activeContainer = this.elements.$itemContainers.filter( activeContentSelector );

			this.setTabindexFocusableContentElements( $activeContainer, '0' );
			this.focusFirstFocusableContainerElement( event, activeTitleControl );
		} else if ( this.isHomeOrEndKey( event ) ) {
			event.preventDefault();

			const currentTitleIndex = this.getTitleIndex( event.currentTarget ) || 1,
				numberOfTitles = this.elements.$itemTitles.length,
				titleIndexUpdated = this.getTitleIndexFocusUpdated( event, currentTitleIndex, numberOfTitles );

			this.changeTitleFocus( titleIndexUpdated );
			event.stopPropagation();
		} else if ( this.isActivationKey( event ) ) {
			event.preventDefault();

			if ( this.handeTitleLinkEnterOrSpaceEvent( event ) ) {
				return;
			}

			const titleIndex = this.getTitleIndex( event.currentTarget );

			elementorFrontend.elements.$window.trigger( 'elementor/nested-elements/activate-by-keyboard', { widgetId: this.getID(), titleIndex } );
		} else if ( 'Escape' === event.key ) {
			this.handleTitleEscapeKeyEvents( event );
		}
	}

	handeTitleLinkEnterOrSpaceEvent( event ) {
		const isLinkElement = 'a' === event?.currentTarget?.tagName?.toLowerCase();

		if ( ! elementorFrontend.isEditMode() && isLinkElement ) {
			event?.currentTarget?.click();
			event.stopPropagation();
		}

		return isLinkElement;
	}

	getTitleIndexFocusUpdated( event, currentTitleIndex, numberOfTitles ) {
		let titleIndexUpdated = 0;

		switch ( event.key ) {
			case 'Home':
				titleIndexUpdated = 1;
				break;
			case 'End':
				titleIndexUpdated = numberOfTitles;
				break;
			default:
				const directionValue = this.getKeyDirectionValue( event ),
					isEndReached = numberOfTitles < currentTitleIndex + directionValue,
					isStartReached = 0 === currentTitleIndex + directionValue;

				if ( isEndReached ) {
					titleIndexUpdated = 1;
				} else if ( isStartReached ) {
					titleIndexUpdated = numberOfTitles;
				} else {
					titleIndexUpdated = currentTitleIndex + directionValue;
				}
		}

		return titleIndexUpdated;
	}

	changeTitleFocus( titleIndexUpdated ) {
		const $newTitle = this.elements.$itemTitles.filter( this.getTitleFilterSelector( titleIndexUpdated ) );

		this.closeActiveContentElements();
		this.setTitleTabindex( titleIndexUpdated );

		$newTitle.trigger( 'focus' );
	}

	setTitleTabindex( titleIndex ) {}

	handleTitleEscapeKeyEvents() {}

	handleContentElementKeyboardNavigation( event ) {
		if ( 'Tab' === event.key && ! event.shiftKey ) {
			this.handleContentElementTabEvents( event );
		} else if ( 'Escape' === event.key ) {
			event.preventDefault();
			event.stopPropagation();
			this.handleContentElementEscapeEvents( event );
		}
	}

	handleContentElementEscapeEvents() {
		this.getActiveTitleElement().trigger( 'focus' );
	}

	setTabindexFocusableContentElements( $containers, $tabindexValue ) {
		this.getFocusableElements( $containers ).attr( 'tabindex', $tabindexValue );
	}

	handleContentElementTabEvents( event ) {
		const $currentElement = jQuery( event.currentTarget ),
			containerSelector = this.getSettings( 'selectors' ).itemContainer,
			$currentContainer = $currentElement.closest( containerSelector ),
			$focusableContainerElements = this.getFocusableElements( $currentContainer ),
			$lastFocusableElement = $focusableContainerElements.last(),
			isCurrentElementLastFocusableElement = $currentElement.is( $lastFocusableElement );

		if ( ! isCurrentElementLastFocusableElement ) {
			return;
		}

		const $activeTitle = this.getActiveTitleElement(),
			activeTitleIndex = this.getTitleIndex( $activeTitle[ 0 ] );

		if ( this.isLastTitle( activeTitleIndex ) ) {
			this.closeActiveContentElements();
			return;
		}

		event.preventDefault();

		const nextTitleIndex = activeTitleIndex + 1;

		this.changeTitleFocus( nextTitleIndex );
		this.setTabindexFocusableContentElements( $currentContainer, '-1' );

		event.stopPropagation();
	}

	focusFirstFocusableContainerElement( event, titleControl ) {
		const currentContainerSelector = `#${ titleControl }`,
			$activeContainer = this.elements.$itemContainers.filter( currentContainerSelector ),
			$firstFocusableContainer = this.getFocusableElements( $activeContainer ).first();

		if ( 0 === $firstFocusableContainer.length ) {
			return;
		}

		event.preventDefault();
		$firstFocusableContainer[ 0 ]?.focus();
		event.stopPropagation();
	}

	isLastTitle( titleIndex ) {
		return this.elements.$itemTitles.length === titleIndex;
	}

	closeActiveContentElements() {}
}
