import Base from 'elementor/assets/dev/js/frontend/handlers/base';

export default class PlayingCards extends Base {
	cards = [];
	cardsState = [];
	cardsPositions = [];
	activeCardItem = null;
	disableCards = true;

	toggleCardFlip( card ) {
		card.classList.toggle( 'e-card-is-flipped' );

		this.cardsState.forEach( ( item ) => {
			if ( item.card === card ) {
				item.isFlipped = ! item.isFlipped;
			}
		} );
	}

	onCardClick = ( event ) => {
		if ( this.disableCards ) {
			return;
		}
		this.disableCards = true;

		const currentCardItem = this.cardsState.find( ( item ) => item.card === event.currentTarget );

		if ( currentCardItem ) {
			this.toggleCardFlip( currentCardItem.card );
			this.handleCardComparison( currentCardItem );
		}
	};

	handleCardComparison( currentCardItem ) {
		setTimeout( () => {
			this.compareCards( currentCardItem );
			this.disableCards = false;
		}, 1000 );
	}

	compareCards( currentCardItem ) {
		if ( ! this.activeCardItem ) {
			this.activeCardItem = currentCardItem;
		} else if ( this.activeCardItem === currentCardItem ) {
			this.activeCardItem = null;
		} else {
			this.matchOrReset( currentCardItem );
		}
	}

	matchOrReset( currentCardItem ) {
		if ( this.activeCardItem.value === currentCardItem.value ) {
			this.removeCardListeners( this.activeCardItem, currentCardItem );
		} else {
			this.flipBackCards( this.activeCardItem, currentCardItem );
		}

		this.activeCardItem = null;
	}

	removeCardListeners( ...cards ) {
		cards.forEach( ( item ) => item.card.removeEventListener( 'click', this.onCardClick ) );
	}

	flipBackCards( ...cards ) {
		cards.forEach( ( item ) => this.flipCard( item.card ) );
	}

	flipCard( card ) {
		card.classList.add( 'e-card-is-flipped' );

		this.cardsState.forEach( ( item ) => {
			if ( item.card === card ) {
				item.isFlipped = true;
			}
		} );
	}

	getAllCards() {
		return [ ...this.$element.find( '.e-playing-card' ) ];
	}

	initializeState() {
		this.cardsState = this.cards.map( ( card ) => {
			return {
				card,
				value: card.getAttribute( 'data-value' ),
				isFlipped: false,
			};
		} );
	}

	cloneInitialCards() {
		const initialCards = this.$element.find( '.e-playing-card' );

		Array.from( initialCards ).forEach( ( card ) => {
			const clonedCard = card.cloneNode( true );
			this.elements.$clonedCardsContainer.append( clonedCard );
			this.elements.$clonedCardsContainer.addClass( 'e-playing-cards-container-clone-show' );
		} );
	}

	shuffleArray( array ) {
		return [ ...array ].sort( () => 0.5 - Math.random() );
	}

	getInitialPositions() {
		this.cards.forEach( ( card ) => {
			this.cardsPositions.push( {
				x: card.offsetLeft,
				y: card.offsetTop,
			} );

			card.style.top = `${ card.offsetTop }px`;
			card.style.left = `${ card.offsetLeft }px`;
		} );
	}

	shuffleCards() {
		this.elements.$shuffleButton.hide();
		this.elements.$playAgainButton.show();

		this.cards.forEach( ( card ) => this.flipCard( card ) );

		const firstCardPosition = this.cardsPositions[ 0 ];

		const shuffledPositions = this.shuffleArray( this.cardsPositions );

		setTimeout( () => {
			this.cards.forEach( ( card ) => {
				card.style.transition = 'all 1s ease';
				card.style.position = 'absolute';
				card.style.top = `${ firstCardPosition.y }px`;
				card.style.left = `${ firstCardPosition.x }px`;
			} );
		}, 700 );

		setTimeout( () => {
			this.cards.forEach( ( card, index ) => {
				card.style.top = `${ shuffledPositions[ index ].y }px`;
				card.style.left = `${ shuffledPositions[ index ].x }px`;
				card.addEventListener( 'click', this.onCardClick );
			} );
		}, 2000 );

		setTimeout( () => {
			this.disableCards = false;
		}, 3000 );
	}

	play() {
		this.cloneInitialCards();
		this.cards = this.getAllCards();
		this.initializeState();
		this.getInitialPositions();

		this.elements.$playButton.hide();
		this.elements.$shuffleButton.show();
	}

	playAgain() {
		if ( this.disableCards ) {
			return;
		}

		this.activeCardItem = null;
		this.cards.forEach( ( card ) => this.flipCard( card ) );
		this.initializeState();
		this.shuffleCards();
	}

	getDefaultSettings() {
		return {
			selectors: {
				clonedCardsContainer: '.e-playing-cards-container-clone',
				playButton: '.cards-play',
				shuffleButton: '.cards-shuffle',
				playAgainButton: '.cards-play-again',
			},
			cardsVisible: true,
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			$clonedCardsContainer: this.$element.find( selectors.clonedCardsContainer ),
			$playButton: this.$element.find( selectors.playButton ),
			$shuffleButton: this.$element.find( selectors.shuffleButton ),
			$playAgainButton: this.$element.find( selectors.playAgainButton ),
		};
	}

	bindEvents() {
		this.elements.$playButton.on( 'click', this.play.bind( this ) );
		this.elements.$shuffleButton.on( 'click', this.shuffleCards.bind( this ) );
		this.elements.$playAgainButton.on( 'click', this.playAgain.bind( this ) );
	}

	unbindEvents() {
		this.elements.$playButton.off();
		this.elements.$shuffleButton.off();
		this.elements.$playAgainButton.off();
	}

	onVisibilityToggleButtonClick( event ) {
		const cardsVisible = ! this.getSettings( 'cardsVisible' );

		this.setSettings( { cardsVisible } );

		const button = event.target;
		const { $playingCards, $visibilityStatus, $cardTitles } = this.elements;

		$playingCards.toggleClass( 'e-playing-card-hidden' );

		button.innerText = cardsVisible
			? __( 'Hide', 'elementor' )
			: __( 'Show', 'elementor' );

		$visibilityStatus.text( cardsVisible
			? __( 'Cards visible', 'elementor' )
			: __( 'Cards hidden', 'elementor' ),
		);

		$cardTitles.each( function() {
			const { type, value } = this.dataset;

			this.innerText = cardsVisible
				? sprintf(
					// Translators: %1$s: Card type. %2$s: Card value
					__( 'Playing card of type %1$s and value %2$s', 'elementor' ), type, value )
				: __( 'Card hidden', 'elementor' );
		} );
	}
}
