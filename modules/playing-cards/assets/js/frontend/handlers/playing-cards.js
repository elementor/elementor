export default class PlayingCardsHandler extends elementorModules.frontend
	.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				card: ".e-playing-cards-item",
			},
		};
	}

	getDefaultElements() {
		const { selectors } = this.getSettings();
		const [widgetWrapper] = this.$element;
		const cards = widgetWrapper.querySelectorAll(selectors.card);

		return {
			widgetWrapper,
			cards,
		};
	}

	toggleCard({ currentTarget: element }) {
		element.classList.toggle("open");
		element.classList.toggle("closed");
	}

	addEvents() {
		this.elements.cards.forEach((card) => {
			const handleClick = this.toggleCard.bind(this);
			card.addEventListener("click", handleClick);
		});
	}

	onInit() {
		this.elements = this.getDefaultElements();
		this.addEvents();
	}
}
