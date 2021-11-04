import {LitElement, html, css, unsafeCSS} from '../../node_modules/lit';

/**
 * An example element.
 *
 * @slot - This element has a slot
 */
export class Box extends LitElement {
    static get styles() {
        return css`
		  :host { display: block }
          :host {
			border-radius: var(--ewc-box-radius, var(--ewc-box-radius-alias));
			flex-shrink: var(--ewc-flex-shrink, 0) }
          :host([elevation="subtle"]) { box-shadow: rgba(0, 0, 0, 0.08)  0 1px 2px 0; }
          :host([elevation="paper"])  { box-shadow: rgba(0, 0, 0, 0.1)   0 1px 3px 0, rgba(0, 0, 0, 0.06) 0 1px 2px 0; }
          :host([elevation="card"])   { box-shadow: rgba(0, 0, 0, 0.1)   0 4px 6px -1px, rgba(0, 0, 0, 0.06) 0 2px 4px -1px; }
          :host([elevation="panel"])  { box-shadow: rgba(0, 0, 0, 0.1)   0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px; }
          :host([elevation="float"])  { box-shadow: rgba(0, 0, 0, 0.1)   0 20px 25px -5px, rgba(0, 0, 0, 0.04) 0 10px 10px -5px; }
          :host([elevation="air"])    { box-shadow: rgba(0, 0, 0, 0.25)  0 25px 50px -12px; }

		  :host([overflow="hidden"]) { overflow: hidden; }
		  :host([overflow="auto"])   { overflow: auto; }
		  :host([stiff])   { flex-grow: 0; flex-shrink: 0; }
        `;
    }

    static get properties() {
        return {
            alignSelf:  {type: String, reflect: true},
            background:  {type: String, reflect: true},
            overflow:  {type: String, reflect: true},
            radius:  {type: String, reflect: true},
            borderColor:  {type: String, reflect: true},
            borderWidth:  {type: String, reflect: true},
            display:  {type: String, reflect: true},
            elevation:  {type: String, reflect: true},
            flex:  {type: String, reflect: true},
            grow:  {type: String, reflect: true},
            height:  {type: String, reflect: true},
            order:  {type: String, reflect: true},
            maxWidth:  {type: String, reflect: true},
            ring:  {type: String, reflect: true},
            shrink:  {type: String, reflect: true},
            width:  {type: String, reflect: true},
            margin:  {type: String, reflect: true},
			marginBlock:  {type: String, reflect: true},
            marginTop:  {type: String, reflect: true},
            marginBottom:  {type: String, reflect: true},
			marginInline:  {type: String, reflect: true},
			marginStart:  {type: String, reflect: true},
            marginEnd:  {type: String, reflect: true},
            padding:  {type: String, reflect: true},
            paddingTop:  {type: String, reflect: true},
            paddingBottom:  {type: String, reflect: true},
            paddingStart:  {type: String, reflect: true},
            paddingEnd:  {type: String, reflect: true},
        }
    }

    safeGetPropertyValue( value, validOptions ) {
        if ( ! ! value && ! ! validOptions[value] ) return validOptions[value];
        return ! ! value && [ ...validOptions.keys() ].includes( value ) ? value : '';
    }

    getSafeStyle() {
		const flexOptions = [];
		flexOptions['grow'] = 'auto';
		flexOptions['shrink'] = '0 auto';
		flexOptions['stiff'] = 'none';
		flexOptions['flexible'] = '1';

		const growShrinkOptions = [ 0, 1, 2, 3, 4, 5, 6 ];
		const flexOrderOptions = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
		const alignOptions = [];
		alignOptions['auto'] = 'auto';
		alignOptions['start'] = 'flex-start';
		alignOptions['end'] = 'flex-end';
		alignOptions['center'] = 'center';
		alignOptions['baseline'] = 'baseline';
		alignOptions['stretch'] = 'stretch';

		const radiusOptions = [ 'none', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl',
			'round-100', 'round-200', 'round-300', 'round-400', 'round-600' ];

		const flex = this.safeGetPropertyValue( this.flex, flexOptions );
		const grow = this.safeGetPropertyValue( this.grow, growShrinkOptions );
		const order = this.safeGetPropertyValue( this.order, flexOrderOptions );
		const shrink = this.safeGetPropertyValue( this.shrink, growShrinkOptions );
		const alignSelf = this.safeGetPropertyValue( this.alignSelf, alignOptions );
		const safeRadius = ! ! this.radius && radiusOptions.includes( this.radius ) ? this.radius : false;
		const radius = safeRadius && 'var(--ewc-size-radius-' + safeRadius + ')';

		return ( css`
			:host {
				--ewc-flex-flex: ${ flex ? unsafeCSS( flex ) : unsafeCSS( '-' )};
				--ewc-flex-grow: ${ grow ? unsafeCSS( grow ) : unsafeCSS( '-' )};
				--ewc-flex-order: ${ order ? unsafeCSS( order ) : unsafeCSS( '-' )};
				--ewc-flex-shrink: ${ shrink ? unsafeCSS( shrink ) : unsafeCSS( '-' )};
				--ewc-flex-align-self: ${ alignSelf ? unsafeCSS( alignSelf ) : unsafeCSS( 'inherit' )};
			}
			:host { --ewc-box-radius: ${ radius ? unsafeCSS( radius ) : unsafeCSS( '0' )}; }`
		);
    }

    getStyleTag() {
		return html`<style>
			:host {
				display:  	${this.display ? this.display : 'block'};
				width:    	var(--ewc-box-width,        var(--ewc-width-${this.width}));
				max-width:	var(--ewc-box-max-width,    var(--ewc-width-${this.maxWidth}));
				height:   	var(--ewc-box-height,       var(--ewc-height-${this.height}, var(--ewc-size-${this.height}, auto)));

				margin:               var(--ewc-box-margin,           var(--ewc-size-${this.margin}));
				padding:              var(--ewc-box-padding,          var(--ewc-size-${this.padding}));

				margin-inline:	      var(--ewc-box-margin-inline,     var(--ewc-size-${this.marginInline}));

				margin-top:           var(--ewc-box-margin-top,       var(--ewc-size-${this.marginTop}));
				margin-bottom:        var(--ewc-box-margin-bottom,    var(--ewc-size-${this.marginBottom}));
				margin-inline-start:  var(--ewc-box-margin-start,     var(--ewc-size-${this.marginStart}, var(--ewc-size-${this.marginInline})));
				margin-inline-end:    var(--ewc-box-margin-end,       var(--ewc-size-${this.marginEnd}, var(--ewc-size-${this.marginInline})));

				padding-top:          var(--ewc-box-padding-top,      var(--ewc-size-${this.paddingTop},    var(--ewc-size-${this.padding})));
				padding-bottom:       var(--ewc-box-padding-bottom,   var(--ewc-size-${this.paddingBottom}, var(--ewc-size-${this.padding})));
				padding-inline-start: var(--ewc-box-padding-start,    var(--ewc-size-${this.paddingStart},  var(--ewc-size-${this.padding})));
				padding-inline-end:   var(--ewc-box-padding-end,      var(--ewc-size-${this.paddingEnd},    var(--ewc-size-${this.padding})));

				background: var(--ewc-box-background,   var(--ewc-color-${this.background}));

				border: var(--ewc-box-border-width, var(--ewc-size-border-${this.borderWidth}, ${this.borderWidth ? '1px' : '0'}))
						var(--ewc-box-border-style, solid)
						var(--ewc-box-border-color, var(--ewc-color-${this.borderColor}, transparent));
			}

			${this.getSafeStyle()}
		</style>`;
    }

    constructor() {
        super();
        this.flex = null;
        this.grow = null;
        this.shrink = null;
        this.alignSelf = null;
        this.order = null;
        this.radius = null;
        this.padding = null;
    }

    render() {
		return html`
			${this.getStyleTag()}
			<slot></slot>`;
    }
}

window.customElements.define('e-box', Box);
