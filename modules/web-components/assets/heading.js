import { LitElement, html, css, unsafeCSS } from 'lit';

export class Heading extends LitElement {
	static get styles() {
		return css`
			:host(:first-child) { --ewc-heading-margin-top: 0; }
			:is(h1, h2, h3, h4, h5, h6) {
				color: var(--ewc-heading-color, var(--ewc-color-gray-900));
				font-size: var(--ewc-heading-font-size, var(--ewc-size-font-heading-xl));
				font-weight: 700;
				line-height: var(--ewc-heading-line-height, var(--ewc-line-height-heading-xl, 1.2));
				margin: 0;
				margin-top: var(--ewc-heading-margin-top, var(--ewc-heading-margin-top-default, var(--ewc-size-200)));
				margin-bottom: var(--ewc-heading-margin-bottom, var(--ewc-heading-margin-bottom-default, var(--ewc-size-50)));
			}

			:host([size="xxl"]) *, h1{ font-size: var(--ewc-heading-font-size, var(--ewc-size-font-heading-xxl));
				--ewc-heading-margin-top-default: var(--ewc-size-300); }

			:host([size="xl"]) *, h2{ font-size: var(--ewc-heading-font-size, var(--ewc-size-font-heading-xl))}

			:host([size="l"]) *, h3{ font-size: var(--ewc-heading-font-size, var(--ewc-size-font-heading-l))}

			:host([size="m"]) *, h4{ font-size: var(--ewc-heading-font-size, var(--ewc-size-font-heading-m));
				--ewc-heading-margin-top-default: var(--ewc-size-120);
				--ewc-heading-margin-bottom-default: var(--ewc-size-25); }

			:host([size="s"]) *, h5{ font-size: var(--ewc-heading-font-size, var(--ewc-size-font-heading-s));
				--ewc-heading-margin-top-default: var(--ewc-size-100);
				--ewc-heading-margin-bottom-default: 0; }

			:host([size="xs"]) *, h6{ font-size: var(--ewc-heading-font-size, var(--ewc-size-font-heading-xs));
				--ewc-heading-margin-top-default: var(--ewc-size-100);
				--ewc-heading-margin-bottom-default: 0; }`;
	}

	static get properties() {
		return {
			align: { type: String, reflect: true },
			color: { type: String, reflect: true },
			font: { type: String, reflect: true },
			italic: { type: Boolean, reflect: true },
			level: { type: String, reflect: true },
			size: { type: String, reflect: true },
			transform: { type: String, reflect: true },
			weight: { type: String, reflect: true },
		};
	}

	safeGetPropertyValue( value, validOptions ) {
		if ( ! value ) {
			return '';
		}

		if ( validOptions[ value ] ) {
			return validOptions[ value ];
		}

		if ( [ ...validOptions.keys() ].includes( value ) ) {
			return value;
		}

		return '';
	}

	getColorStyle() {
		const colors = [];
		colors.green = 'green-500';
		colors.celery = 'celery-500';
		colors.chartreuse = 'chartreuse-500';
		colors.seafoam = 'seafoam-500';
		colors.blue = 'blue-500';
		colors.purple = 'purple-500';
		colors.indigo = 'indigo-500';
		colors.fucsia = 'fucsia-500';
		colors.magenta = 'magenta-500';
		colors.red = 'red-500';
		colors.orange = 'orange-500';
		colors.yellow = 'yellow-500';
		colors.primary = 'primary';
		colors.secondary = 'secondary';
		colors.cta = 'cta';
		colors.success = 'success';
		colors.warning = 'warning';
		colors.error = 'error';
		colors.info = 'info';

		const color = 'var(--ewc-color-' + this.safeGetPropertyValue( this.color, colors ) + ')';

		return css`h1, h2, h3, h4, h5, h6{
			color: var( --ewc-heading-color, ${ unsafeCSS( color ) }) !important;
		}`;
	}

	getFlexItemStyle() {
		const flexOptions = [];
		flexOptions.grow = 'auto';
		flexOptions.shrink = '0 auto';
		flexOptions.stiff = 'none';
		flexOptions.flexible = '1';

		const growShrinkOptions = [ 0, 1, 2, 3, 4, 5, 6 ];
		const flexOrderOptions = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
		const alignOptions = [];
		alignOptions.auto = 'auto';
		alignOptions.start = 'flex-start';
		alignOptions.end = 'flex-end';
		alignOptions.center = 'center';
		alignOptions.baseline = 'baseline';
		alignOptions.stretch = 'stretch';

		const flex = this.safeGetPropertyValue( this.flex, flexOptions );
		const grow = this.safeGetPropertyValue( this.grow, growShrinkOptions );
		const order = this.safeGetPropertyValue( this.order, flexOrderOptions );
		const shrink = this.safeGetPropertyValue( this.shrink, growShrinkOptions );
		const alignSelf = this.safeGetPropertyValue( this.alignSelf, alignOptions );

		return css`:host{
			--ewc-flex-flex: ${ unsafeCSS( flex ) };
			--ewc-flex-grow: ${ unsafeCSS( grow ) };
			--ewc-flex-order: ${ unsafeCSS( order ) };
			--ewc-flex-shrink: ${ unsafeCSS( shrink ) };
			--ewc-flex-align-self: ${ unsafeCSS( alignSelf ) };
		}`;
	}

	constructor() {
		super();
		this.level = '2';
		this.color = 'gray-900';
		this.flex = null;
		this.grow = null;
		this.shrink = null;
		this.alignSelf = null;
		this.order = null;
	}

	headingTemplate( slot ) {
		let template = html`<h2>${ slot }</h2>`;

		switch ( this.level ) {
			case '1': template = html`<h1>${ slot }</h1>`;
				break;
			case '2': template = html`<h2>${ slot }</h2>`;
				break;
			case '3': template = html`<h3>${ slot }</h3>`;
				break;
			case '4': template = html`<h4>${ slot }</h4>`;
				break;
			case '5': template = html`<h5>${ slot }</h5>`;
				break;
			case '6': template = html`<h6>${ slot }</h6>`;
				break;
		}

		return template;
	}

	render() {
		const slot = html`<slot></slot>`;

		return html`
			<style>
				${ this.getFlexItemStyle() }
				${ this.getColorStyle() }
			</style>
			${ this.headingTemplate( slot ) }`;
	}
}

window.customElements.define( 'e-heading', Heading );
