import Base from '../base';

export default class NestedTitleKeyboardHandler extends Base {
	getDefaultSettings() {
		return {
			selectors: {
				itemTitle: '.e-n-tab-title',
				$itemContainer: '.e-n-tabs-content > .e-con',
			},
			ariaAttributes: {
				titleStateAttribute: 'aria-selected',
				activeTitleSelector: '[aria-selected="true"]',
			},
			datasets: {
				titleIndex: 'data-tab-index',
			},
			keyDirection: {
				ArrowLeft: elementorFrontendConfig.is_rtl ? 'next' : 'previous',
				ArrowUp: 'previous',
				ArrowRight: elementorFrontendConfig.is_rtl ? 'previous' : 'next',
				ArrowDown: 'next',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			$itemTitles: this.findElement( selectors.itemTitle ),
			$itemContainers: this.findElement( selectors.$itemContainer ),
		};
	}

	/**
	 * @param {HTMLElement} itemTitleElement
	 *
	 * @return {string}
	 */
	getTitleIndex( itemTitleElement ) {
		const indexAttribute = this.getSettings( 'datasets' ).titleIndex;
		return itemTitleElement.getAttribute( indexAttribute );
	}

	/**
	 * @param {string|number} titleIndex
	 *
	 * @return {string}
	 */
	getTitleFilterSelector( titleIndex ) {
		const indexAttribute = this.getSettings( 'datasets' ).titleIndex;
		return `[${ indexAttribute }="${ titleIndex }"]`;
	}

	bindEvents() {
		this.elements.$itemTitles.on( this.getTitleEvents() );
		this.elements.$itemContainers.children().on( 'keydown', this.handleContentElementEscapeEvent.bind( this ) );
	}

	unbindEvents() {
		this.elements.$itemTitles.off();
		this.elements.$itemContainers.children().off();
	}

	handleTitleKeyboardNavigation( event ) {
		const directionKeys = [ 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End' ],
			activationKeys = [ 'Enter', 'Space' ];

		if ( directionKeys.includes( event.key ) ) {
			event.preventDefault();

			const currentTitleIndex = parseInt( this.getTitleIndex( event.currentTarget ) ) || 1,
				numberOfTitles = this.elements.$itemTitles.length,
				titleIndexUpdated = this.getTitleIndexFocusUpdated( event, currentTitleIndex, numberOfTitles );

			this.changeTitleFocus( currentTitleIndex, titleIndexUpdated );
		} else if ( activationKeys.includes( event.key ) ) {
			event.preventDefault();

			const titleIndex = this.getTitleIndex( event.currentTarget );

			elementorFrontend.elements.$window.trigger( 'elementor/nested-elements/activate-by-keyboard', titleIndex );
		}
	}

	getTitleEvents() {
		return {
			keydown: this.handleTitleKeyboardNavigation.bind( this ),
		};
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
				const direction = this.getSettings( 'keyDirection' )[ event.key ],
					directionValue = 'next' === direction ? 1 : -1,
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

	changeTitleFocus( currentTitleIndex, titleIndexUpdated ) {
		const $currentTitle = this.elements.$itemTitles.filter( this.getTitleFilterSelector( currentTitleIndex ) ),
			$newTitle = this.elements.$itemTitles.filter( this.getTitleFilterSelector( titleIndexUpdated ) );

		$currentTitle.attr( 'tabindex', '-1' );
		$newTitle.attr( 'tabindex', '0' );
		$newTitle.trigger( 'focus' );
	}

	handleContentElementEscapeEvent( event ) {
		if ( 'Escape' !== event.key ) {
			return;
		}

		const activeTitleFilter = this.getSettings( 'ariaAttributes' ).activeTitleSelector,
			$activeTitle = this.elements.$itemTitles.filter( activeTitleFilter );

		$activeTitle.trigger( 'focus' );
	}
}
