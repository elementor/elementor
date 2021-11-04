import { buttonStyle } from './button-style.js';
import { LitElement, html } from 'lit';

export class Button extends LitElement {
	static styles = [ buttonStyle ];

	static get properties() {
		return {
			focused: { type: Boolean, reflect: true },
			tabIndex: { type: Number, reflect: true },
		};
	}

	constructor() {
		super();

		// At first, the component may get focus and accept tabbing.
		this.tabIndex = 0;
		this.focused = false;

		this.addEventListener( 'focus', ( e ) => {
			this._handleFocus( e );
		} );

		this.addEventListener( 'focusout', ( e ) => {
			this._handleBlur( e );
		} );
	}

	// When the component gets focus, pass focus to the first link inside it.
	// Then make tabIndex -1 so that the component may still get focus, but does NOT accept tabbing.
	_handleFocus( e ) {
		if ( e.target.matches( ':focus-visible' ) ) {
			if ( this._slottedLink ) {
				this.tabIndex = -1;
				this._slottedLink.focus();
			}

			this.focused = true;
		}
	}

	// When the component loses focus, make tabIndex 0 so that the component may accept tabbing again.
	_handleBlur( e ) {
		if ( this._slottedLink && e.target === this._slottedLink ) {
			this.tabIndex = 0;
		}

		this.focused = false;
	}

	get _slottedLink() {
		const slots = this.shadowRoot.querySelectorAll( 'slot' );
		let $link = false;
		slots.forEach( ( slot ) => {
			const nodes = slot.assignedNodes( { flatten: true } );
			if ( nodes.length && 'A' === nodes[ 0 ].nodeName ) {
				$link = nodes[ 0 ];
			}
		} );

		return $link;
	}

	render() {
		return html`
			<div class="bg-layer"></div>
			<slot name="icon"></slot>
			<slot></slot>`;
	}
}

window.customElements.define( 'e-button', Button );
