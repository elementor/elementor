import { escapeHTML } from 'elementor-frontend/utils/utils';

export default class TextPathHandler extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				pathContainer: '.e-text-path',
				svg: '.e-text-path > svg',
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
	 * @return {void}
	 */
	onInit() {
		this.elements = this.getDefaultElements();

		this.fetchSVG().then( () => {
			// Generate unique IDs using the wrapper's `data-id`.
			this.pathId = `e-path-${ this.elements.widgetWrapper.dataset.id }`;
			this.textPathId = `e-text-path-${ this.elements.widgetWrapper.dataset.id }`;

			if ( ! this.elements.svg ) {
				return;
			}

			this.initTextPath();
		} );
	}

	/**
	 * Fetch & Inject the SVG markup.
	 *
	 * @return {Promise} success
	 */
	fetchSVG() {
		const { url } = this.elements.pathContainer.dataset;

		if ( ! url || ! url.endsWith( '.svg' ) ) {
			return Promise.reject( url );
		}

		return fetch( url )
			.then( ( res ) => res.text() )
			.then( ( svg ) => {
				this.elements.pathContainer.innerHTML = svg;

				// Re-initialize the elements, so the SVG tag will be added.
				this.elements = this.getDefaultElements();
			} );
	}

	/**
	 *  Gets a text offset (relative to the starting point) as a string or int, and set it as percents to the
	 *  `startOffset` attribute of the `<textPath>` element.
	 *
	 * @param {string|number} offset The text start offset.
	 *
	 * @return {void}
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
	 * @param {Object} setting The settings object from the editor.
	 *
	 * @return {void}
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
	 * Attach a unique ID to the `path` element in the SVG, based on the container's ID.
	 * This function selects the first `path` with a `data-path-anchor` attribute, or defaults to the first `path` element.
	 *
	 * @return {void}
	 */
	attachIdToPath() {
		// Prioritize the custom `data` attribute over the `path` element, and fallback to the first `path`.
		const path = this.elements.svg.querySelector( '[data-path-anchor]' ) || this.elements.svg.querySelector( 'path' );
		path.id = this.pathId;
	}

	/**
	 * Initialize & build the SVG markup of the widget using the settings from the panel.
	 *
	 * @return {void}
	 */
	initTextPath() {
		const { start_point: startPoint } = this.getElementSettings();
		const text = this.elements.pathContainer.dataset.text;

		this.attachIdToPath();

		// Generate the `textPath` element with its settings.
		this.elements.svg.innerHTML += `
			<text>
				<textPath id="${ this.textPathId }" href="#${ this.pathId }"></textPath>
			</text>
		`;

		// Regenerate the elements object to have access to `this.elements.textPath`.
		this.elements.textPath = this.elements.svg.querySelector( `#${ this.textPathId }` );

		this.setOffset( startPoint.size );
		this.setText( text );
	}

	/**
	 * Sets the text on the SVG path, including the link (if set) and its properties.
	 *
	 * @param {string} newText The new text to put in the text path.
	 *
	 * @return {void}
	 */
	setText( newText ) {
		const {
			is_external: isExternal,
			nofollow,
		} = this.getElementSettings().link;

		const { linkUrl: url } = this.elements.pathContainer.dataset;

		const target = isExternal ? '_blank' : '',
			rel = nofollow ? 'nofollow' : '';

		// Add link attributes.
		if ( url ) {
			newText = `<a href="${ escapeHTML( url ) }" rel="${ rel }" target="${ target }">${ escapeHTML( newText ) }</a>`;
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
	 * Determine if the text direction of the widget should be RTL or not, based on the site direction and the widget's settings.
	 *
	 * @return {boolean} is RTL
	 */
	isRTL() {
		const { text_path_direction: direction } = this.getElementSettings();
		let isRTL = elementorFrontend.config.is_rtl;

		if ( direction ) {
			isRTL = ( 'rtl' === direction );
		}

		return isRTL;
	}

	/**
	 * Determine if it should RTL the text (reversing it, etc.).
	 *
	 * @return {boolean} should RTL
	 */
	shouldReverseText() {
		if ( ! this.isRTL() ) {
			return false;
		}

		const isFirefox = elementorFrontend.utils.environment.firefox;

		if ( isFirefox ) {
			return false;
		}

		const isChromium = elementorFrontend.utils.environment.blink;

		if ( isChromium ) {
			return ! this.isFixedChromiumVersion();
		}

		return true;
	}

	/**
	 * Chromium >= 96 fixed the issue with RTL text in SVG.
	 *
	 * @see https://chromium-review.googlesource.com/c/chromium/src/+/3159942
	 * @see https://chromium.googlesource.com/chromium/src/+/4f1bc7d6ff8bfbf6348613bdb970fcdc2a706b5a/chrome/VERSION
	 */
	isFixedChromiumVersion() {
		const FIXED_CHROMIUM_VERSION = 96;
		const currentChromiumVersion = parseInt( navigator.userAgent.match( /(?:Chrom(?:e|ium)|Edg)\/([0-9]+)\./ )[ 1 ] );

		return currentChromiumVersion >= FIXED_CHROMIUM_VERSION;
	}

	/**
	 * Reverse the text path to support RTL.
	 *
	 * @return {void}
	 */
	reverseToRTL() {
		// Make sure to use the inner `a` tag if exists.
		let parentElement = this.elements.textPath;
		parentElement = parentElement.querySelector( 'a' ) || parentElement;

		// Catch all RTL chars and reverse their order.
		const pattern = /([\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC\s$&+,:;=?@#|'<>.^*()%!-]+)/ig;

		// Reverse the text.
		parentElement.textContent = parentElement.textContent.replace( pattern, ( word ) => {
			return word.split( '' ).reverse().join( '' );
		} );

		// Add a11y attributes.
		parentElement.setAttribute( 'aria-hidden', true );
	}
}
