import Base from '../base';

const directionNext = 'next',
	directionPrevious = 'previous';

export default class NestedTitleKeyboardHandler extends Base {
	getDefaultSettings() {
		return {
			selectors: {
				itemTitle: '.e-n-tab-title',
				itemContainer: '.e-n-tabs-content > .e-con',
			},
			ariaAttributes: {
				titleStateAttribute: 'aria-selected',
				activeTitleSelector: '[aria-selected="true"]',
			},
			datasets: {
				titleIndex: 'data-tab-index',
			},
			keyDirection: {
				ArrowLeft: elementorFrontendConfig.is_rtl ? directionNext : directionPrevious,
				ArrowUp: directionPrevious,
				ArrowRight: elementorFrontendConfig.is_rtl ? directionPrevious : directionNext,
				ArrowDown: directionNext,
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			$itemTitles: this.findElement( selectors.itemTitle ),
			$itemContainers: this.findElement( selectors.itemContainer ),
		};
	}

	getKeyDirectionValue( event ) {
		const direction = this.getSettings( 'keyDirection' )[ event.key ];
		return directionNext === direction ? 1 : -1;
	}

	/**
	 * @param {HTMLElement} itemTitleElement
	 *
	 * @return {string}
	 */
	getTitleIndex( itemTitleElement ) {
		const { titleIndex: indexAttribute } = this.getSettings( 'datasets' );
		return itemTitleElement.getAttribute( indexAttribute );
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

	onInit( ...args ) {
		super.onInit( ...args );
	}

	bindEvents() {
		this.elements.$itemTitles.on( this.getTitleEvents() );
		this.elements.$itemContainers.children().on( 'keydown', this.handleContentElementEscapeEvent.bind( this ) );
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

	isElementFocused( event ) {
		return event.currentTarget.ownerDocument.activeElement === event.currentTarget;
	}

	isDirectionKey( event ) {
		const directionKeys = [ 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End' ];
		return directionKeys.includes( event.key );
	}

	isActivationKey( event ) {
		const activationKeys = [ 'Enter', 'Space' ];
		return activationKeys.includes( event.key );
	}

	handleTitleKeyboardNavigation( event ) {
		if ( this.isDirectionKey( event ) ) {
			event.preventDefault();

			const currentTitleIndex = parseInt( this.getTitleIndex( event.currentTarget ) ) || 1,
				numberOfTitles = this.elements.$itemTitles.length,
				titleIndexUpdated = this.getTitleIndexFocusUpdated( event, currentTitleIndex, numberOfTitles );

			this.changeTitleFocus( titleIndexUpdated );
			this.stopPropagations( event );
		} else if ( this.isActivationKey( event ) ) {
			event.preventDefault();

			const titleIndex = this.getTitleIndex( event.currentTarget );

			elementorFrontend.elements.$window.trigger( 'elementor/nested-elements/activate-by-keyboard', titleIndex );
		}
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

		this.setTitleTabindex( titleIndexUpdated );

		$newTitle.trigger( 'focus' );
	}

	setTitleTabindex( titleIndex ) {
		this.elements.$itemTitles.attr( 'tabindex', '-1' );

		const $newTitle = this.elements.$itemTitles.filter( this.getTitleFilterSelector( titleIndex ) );

		$newTitle.attr( 'tabindex', '0' );
	}

	handleContentElementEscapeEvent( event ) {
		if ( 'Escape' !== event.key ) {
			return;
		}

		const activeTitleFilter = this.getSettings( 'ariaAttributes' ).activeTitleSelector,
			$activeTitle = this.elements.$itemTitles.filter( activeTitleFilter );

		$activeTitle.trigger( 'focus' );
	}

	stopPropagations( event ) {
		event.stopPropagation();
	}
}
