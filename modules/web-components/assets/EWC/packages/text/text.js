import { LitElement, html, css, unsafeCSS } from 'lit';

export class Text extends LitElement {
	static get styles() {
		return css`
			:host([size="xs"]){
			  font-size: var(--ewc-alias-size-font-body, var(--ewc-size-font-body-xs)); }
		  	:host([size="s"]){
			  font-size: var(--ewc-alias-size-font-body, var(--ewc-size-font-body-s)); }
		  	:host([size="m"]){
			  font-size: var(--ewc-alias-size-font-body, var(--ewc-size-font-body-m)); }
		  	:host([size="l"]){
			  font-size: var(--ewc-alias-size-font-body, var(--ewc-size-font-body-l)); }
		  	:host([size="xl"]){
			  font-size: var(--ewc-alias-size-font-body, var(--ewc-size-font-body-xl)); }
		  	:host([size="xxl"]){
			  font-size: var(--ewc-alias-size-font-body, var(--ewc-size-font-body-xxl)); }
		  	:host([size="xxxl"]){
			  font-size: var(--ewc-alias-size-font-body, var(--ewc-size-font-body-xxxl)); }`;
	}

	static get properties() {
		return {
			align: { type: String, reflect: true },
			color: { type: String, reflect: true },
			font: { type: String, reflect: true },
			italic: { type: Boolean, reflect: true },
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
		this.type = 'p';
		this.color = 'gray-900';
		this.flex = null;
		this.grow = null;
		this.shrink = null;
		this.alignSelf = null;
		this.order = null;
	}

	render() {
		return html`
			<style>
				${ this.getFlexItemStyle() }
				${ this.getColorStyle() }
			</style>
			<slot></slot>`;
	}
}

window.customElements.define( 'e-text', Text );
