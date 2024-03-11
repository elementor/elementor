import { escapeHTML } from 'elementor-frontend/utils/utils';

export default class PlayingCardsHandler extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				card: '.card',
				doneCard: '.done',
			},
		};
	}

	getDefaultElements() {
		const { selectors } = this.getSettings();
		const element = this.$element[ 0 ];
		return {
			widgetWrapper: element,
			cards: element.querySelectorAll( selectors.card ),
		};
	}

	buildReplayButton() {
		const { selectors } = this.getSettings();
		const replayButton = document.createElement('button');
		replayButton.textContent = 'Replay';
		replayButton.addEventListener('click', () => {
			const doneCards = this.elements.widgetWrapper.querySelectorAll( selectors.doneCard );
			doneCards.forEach(el => {
				this.unflipCard(el);
			})
			this.elements.widgetWrapper.removeChild(this.replayButton);
		});
		this.replayButton = replayButton;
	}

	checkRemainedCards() {
		const { selectors } = this.getSettings();
		const doneCards = this.elements.widgetWrapper.querySelectorAll( selectors.doneCard );
		if(doneCards.length === this.elements.cards.length) {
			this.elements.widgetWrapper.appendChild(this.replayButton);
		}
	}

	async onCardClick(e) {
		const el = e.target;
		if(el.classList.contains('flip') || el.classList.contains('flipped') || el.classList.contains('done')) {
			return;
		}
		const isFirstCard = this.opened[0] === undefined;
		const isSecondCard = this.opened[0] !== undefined && this.opened[1] === undefined;
		if(isFirstCard) {
			this.opened[0] = el;
		}
		else if(isSecondCard) {
			this.opened[1] = el;
		}
		if(isFirstCard || isSecondCard) {
			await this.flipCard(el);
			if(isSecondCard) {
				if(this.opened[0].dataset?.src === this.opened[1].dataset?.src) {
					this.opened[0].classList.add('done');
					this.opened[1].classList.add('done');
					this.checkRemainedCards();
				}
				else {
					await new Promise(resolve => setTimeout(resolve, 1000));
					this.unflipCard(this.opened[0]);
					await new Promise(resolve => setTimeout(resolve, 100));
					this.unflipCard(this.opened[1]);
				}
				this.opened = [undefined, undefined];
			}
		}
	}

	async flipCard(el) {
		el.classList.add('flip');
		await new Promise(resolve => setTimeout(resolve, 200));
		el.style.backgroundImage = `url(${el.dataset.src})`;
		el.classList.remove('flip');
		el.classList.add('flipped');
		return true;
	}
	async unflipCard(el) {
		await new Promise(resolve => setTimeout(resolve, 100));
		el.classList.add('flip');
		el.classList.remove('done');
		await new Promise(resolve => setTimeout(resolve, 200));
		el.classList.remove('flip');
		el.classList.remove('flipped');
		el.style.backgroundImage = '';
		return true;
	}

	bindEvents() {
		[...this.elements.cards].forEach(el => el.addEventListener('click', this.onCardClick.bind(this)));
	}
	/**
	 * Initialize the object.
	 *
	 * @return {void}
	 */
	onInit() {
		this.elements = this.getDefaultElements();
		this.opened = [undefined, undefined];
		this.buildReplayButton();
		this.bindEvents();
	}
}

