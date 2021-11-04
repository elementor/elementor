import { html, css } from '../../node_modules/lit';
import { Box } from '../box/box';

/**
 * An example element.
 *
 * @slot - This element has a slot
 */
export class Flex extends Box {

    static get styles() {
        return [ super.styles, css`
		  	:host { display: flex; }
            :host([direction="row"])            { flex-direction: row }
            :host([direction="row-reverse"])    { flex-direction: row-reverse }
            :host([direction="column"])         { flex-direction: column }
            :host([direction="column-reverse"]) { flex-direction: column-reverse }

            :host([wrap])            	{ flex-wrap: wrap }
            :host([wrap="reverse"])     { flex-wrap: wrap-reverse }

            :host([justifyContent="start"])    { justify-content: flex-start }
            :host([justifyContent="end"])      { justify-content: flex-end }
            :host([justifyContent="center"])   { justify-content: center }
            :host([justifyContent="between"])  { justify-content: space-between }
            :host([justifyContent="around"])   { justify-content: space-around }
            :host([justifyContent="evenly"])   { justify-content: space-evenly }

            :host([alignItems="start"])      { align-items: flex-start }
            :host([alignItems="end"])        { align-items: flex-end }
            :host([alignItems="center"])     { align-items: center }
            :host([alignItems="baseline"])   { align-items: baseline }
            :host([alignItems="stretch"])    { align-items: stretch }

            :host([alignContent="start"])    { align-content: flex-start }
            :host([alignContent="end"])      { align-content: flex-end }
            :host([alignContent="center"])   { align-content: center }
            :host([alignContent="between"])  { align-content: space-between }
            :host([alignContent="around"])   { align-content: space-around }
            :host([alignContent="around"])   { align-content: space-evenly }
            :host([alignContent="stretch"])  { align-content: stretch }

            // Item
            .flex-flex-grow        { flex: auto }
            .flex-flex-shrink      { flex: 0 auto }
            .flex-flex-inflexible  { flex: none }
            .flex-flex-flexible    { flex: 1 }

            .flex-1       		{ flex: 1 }
            .flex-auto    		{ flex: auto }
            .flex-grow-0  		{ flex-grow: 0 }
            .flex-shrink-0		{ flex-shrink: 0 }

            .flex-self-auto     { align-self: auto }
            .flex-self-start    { align-self: flex-start }
            .flex-self-end      { align-self: flex-end }
            .flex-self-center   { align-self: center }
            .flex-self-baseline { align-self: baseline }
            .flex-self-stretch  { align-self: stretch }

            .flex-order-0		{ order: 0 }
            .flex-order-1		{ order: 10 }
            .flex-order-2		{ order: 20 }
            .flex-order-3		{ order: 30 }
            .flex-order-4		{ order: 40 }
            .flex-order-5		{ order: 50 }
            .flex-order-6		{ order: 60 }
            .flex-order-7		{ order: 70 }
            .flex-order-8		{ order: 80 }
            .flex-order-9		{ order: 90 }
            .flex-order-10		{ order: 100 }
            .flex-order-none	{ order: inherit }
        `];
    }

    static get properties() {
        return {
            alignItems:     {type: String, reflect: true},
            alignContent:   {type: String, reflect: true},
            direction:      {type: String, reflect: true},
            flex:           {type: String, reflect: true},
            fullWidth:      {type: Boolean, reflect: true},
            gap:            {type: String, reflect: true},
            grow:           {type: String, reflect: true},
            justifyContent: {type: String, reflect: true},
            shrink:         {type: String, reflect: true},
            wrap:           {type: Boolean, reflect: true},
            wrapReverse:    {type: Boolean, reflect: true},
        }
    }

	getFlexStyles() {
		return html`
			<style>
				:host {
					gap: var(--ewc-flex-gap, var(--ewc-size-${this.gap}));
				}
			</style>`;
	}

    constructor() {
        super();
        this.direction = null;
        this.flex = null;
        this.gap = null;
        this.justifyContent = null;
        this.alignContent = null;
        this.alignItems = null;
        this.wrap = null;
        this.grow = null;
        this.shrink = null;
        this.alignSelf = null;
    }

    render() {
      return html`
		  ${this.getStyleTag()}
		  ${this.getFlexStyles()}
		  <slot></slot>`;
    }
}

window.customElements.define( 'e-flex', Flex );
