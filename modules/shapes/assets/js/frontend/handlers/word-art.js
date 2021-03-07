export default class WordArtHandler extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				pathContainer: '.elementor-wordart',
				svg: '.elementor-wordart > svg',
			},
		};
	}

	getDefaultElements() {
		const { selectors } = this.getSettings();

		return {
			widgetWrapper: this.$element[ 0 ],
			pathContainer: this.$element[ 0 ].querySelector( selectors.pathContainer ),
			svg: this.$element[ 0 ].querySelector( selectors.svg ),
			textPath: this.$element[ 0 ].querySelector( selectors.textPath ),
		};
	}

	// Initialize the object.
	onInit() {
		this.elements = this.getDefaultElements();

		// Generate unique IDs using the wrapper's `data-id`.
		this.pathId = `elementor-path-${ this.elements.widgetWrapper.dataset.id }`;
		this.textPathId = `elementor-text-path-${ this.elements.widgetWrapper.dataset.id }`;

		if ( ! this.elements.svg ) {
			return;
		}

		this.addText();
	}

	// Set the start offset for the text.
	setOffset( offset ) {
		if ( ! this.elements.textPath ) {
			return;
		}

		this.elements.textPath.setAttribute( 'startOffset', offset );
	}

	// Auto align the text on the path using the alignment settings from the element.
	autoAlignText() {
		const { alignment, start_point: startPoint } = this.getElementSettings();
		let offset = '';

		// Set the offset value according to the alignment type.
		switch ( alignment ) {
			case 'end':
				offset = '100%';
				break;

			case 'middle':
				offset = '50%';
				break;

			case 'start':
			default:
				offset = '0';
				break;
		}

		if ( '' !== startPoint.size ) {
			offset = `${ startPoint.size }%`;
		}

		this.setOffset( offset );
	}

	// Handle element settings changes.
	onElementChange( setting ) {
		const { start_point: startPoint } = this.getElementSettings();

		switch ( setting ) {
			case 'alignment':
				this.autoAlignText();
				break;

			case 'start_point':
				const size = startPoint.size;

				if ( '' !== size ) {
					this.setOffset( `${ size }%` );
				} else {
					this.autoAlignText();
				}

				break;

			default:
				break;
		}
	}

	// Attach a unique id to the path.
	attachIdToPath() {
		const path = this.elements.svg.querySelector( '[data-path-anchor]' ) || this.elements.svg.querySelector( 'path' );
		path.id = this.pathId;
	}

	// Put the text from `data-text` on the path.
	addText() {
		let {
			text,
			startOffset,
			href,
			target,
			rel,
		} = this.elements.pathContainer.dataset;

		this.attachIdToPath();

		// Add link attributes.
		if ( href ) {
			text = `<a href="${ href }" rel="${ rel }" target="${ target }">${ text }</a>`;
		}

		// Generate the `textPath` element with its settings.
		this.elements.svg.innerHTML += `
			<text>
				<textPath id="${ this.textPathId }" href="#${ this.pathId }" startOffset="${ startOffset }%">
					${ text }
				</textPath>
			</text>
		`;

		// Regenerate the elements object to have access to `this.elements.textPath`.
		this.elements.textPath = this.elements.svg.querySelector( `#${ this.textPathId }` );
	}
}
