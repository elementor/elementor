export default class TextPathHandler extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				pathContainer: '.elementor-text-path',
				svg: '.elementor-text-path > svg',
			},
		};
	}

	getDefaultElements() {
		const { selectors } = this.getSettings();
		const element = this.$element[ 0 ];

		return {
			widgetWrapper: element,
			pathContainer: element.querySelector( selectors.pathContainer ),
			svg: element.querySelector( selectors.svg ),
			textPath: element.querySelector( selectors.textPath ),
		};
	}

	/**
	 * Initialize the object.
	 *
	 * @returns {void}
	 */
	onInit() {
		this.elements = this.getDefaultElements();

		// Generate unique IDs using the wrapper's `data-id`.
		this.pathId = `elementor-path-${ this.elements.widgetWrapper.dataset.id }`;
		this.textPathId = `elementor-text-path-${ this.elements.widgetWrapper.dataset.id }`;

		if ( ! this.elements.svg ) {
			return;
		}

		this.initTextPath();
	}

	/**
	 * Set the start offset for the text.
	 *
	 * @param offset {string|int} The text start offset.
	 *
	 * @returns {void}
	 */
	setOffset( offset ) {
		if ( ! this.elements.textPath ) {
			return;
		}

		if ( this.isRTL() ) {
			offset = 100 - parseInt( offset );
		}

		this.elements.textPath.setAttribute( 'startOffset', offset + '%' );
	}

	/**
	 * Handle element settings changes.
	 *
	 * @param setting {Object} The settings object from the editor.
	 *
	 * @returns {void}
	 */
	onElementChange( setting ) {
		const {
			start_point: startPoint,
			text,
		} = this.getElementSettings();

		switch ( setting ) {
			case 'start_point':
				this.setOffset( startPoint.size );
				break;

			case 'text':
				this.setText( text );
				break;

			case 'text_path_direction':
				this.setOffset( startPoint.size );
				this.setText( text );
				break;

			default:
				break;
		}
	}

	/**
	 * Attach a unique id to the path.
	 *
	 * @returns {void}
	 */
	attachIdToPath() {
		const path = this.elements.svg.querySelector( '[data-path-anchor]' ) || this.elements.svg.querySelector( 'path' );
		path.id = this.pathId;
	}

	/**
	 * Initialize the text path element.
	 *
	 * @returns {void}
	 */
	initTextPath() {
		const {
			text,
			startOffset,
		} = this.elements.pathContainer.dataset;

		this.attachIdToPath();

		// Generate the `textPath` element with its settings.
		this.elements.svg.innerHTML += `
			<text>
				<textPath id="${ this.textPathId }" href="#${ this.pathId }"></textPath>
			</text>
		`;

		// Regenerate the elements object to have access to `this.elements.textPath`.
		this.elements.textPath = this.elements.svg.querySelector( `#${ this.textPathId }` );

		this.setOffset( startOffset );
		this.setText( text );
	}

	/**
	 * Set the new text into the path.
	 *
	 * @param newText {string} The new text to put in the text path.
	 *
	 * @returns {void}
	 */
	setText( newText ) {
		let {
			href,
			target,
			rel,
		} = this.elements.pathContainer.dataset;

		// Add link attributes.
		if ( href ) {
			newText = `<a href="${ href }" rel="${ rel }" target="${ target }">${ newText }</a>`;
		}

		// Set the text.
		this.elements.textPath.innerHTML = newText;

		// Remove the cloned element if exists.
		const existingClone = this.elements.svg.querySelector( `#${ this.textPathId }-clone` );

		if ( existingClone ) {
			existingClone.remove();
		}

		// Reverse the text if needed.
		if ( this.shouldReverseText() ) {
			// Keep an invisible selectable copy of original element for better a11y.
			const clone = this.elements.textPath.cloneNode();
			clone.id += '-clone';
			clone.classList.add( 'elementor-hidden' );
			clone.textContent = newText;

			this.elements.textPath.parentNode.appendChild( clone );
			this.reverseToRTL();
		}
	}

	/**
	 * Determine if the current layout should be RTL.
	 *
	 * @returns {boolean}
	 */
	isRTL() {
		const { text_path_direction: direction } = this.getElementSettings();
		let isRTL = elementorCommon.config.isRTL;

		if ( direction ) {
			isRTL = ( 'rtl' === direction );
		}

		return isRTL;
	}

	/**
	 * Determine if it should RTL the text (reversing it, etc.).
	 *
	 * @returns {boolean}
	 */
	shouldReverseText() {
		return ( this.isRTL() && -1 === navigator.userAgent.indexOf( 'Firefox' ) );
	}

	/**
	 * Reverse the text path to support RTL.
	 *
	 * @returns {void}
	 */
	reverseToRTL() {
		// Make sure to use the inner `a` tag if exists.
		let parentElement = this.elements.textPath;
		parentElement = parentElement.querySelector( 'a' ) || parentElement;

		const pattern = /([\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC\s$&+,:;=?@#|'<>.^*()%!-]+)/ig;

		// Reverse the text.
		parentElement.textContent = parentElement.textContent.replace( pattern, ( word ) => {
			return word.split( '' ).reverse().join( '' );
		} );

		// Add a11y attributes.
		parentElement.setAttribute( 'aria-hidden', true );
	}
}
