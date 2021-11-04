import { css } from 'lit';
import { Icon } from '@spectrum-web-components/icon/src/Icon.js';

export class EIcon extends Icon {
    constructor() {
        super();
    }

    static get styles() {
        return [
            super.styles || [],
            css`:host {
                display: inline-flex;
                font-size: var(--ewc-icon-size, var(--ewc-alias-icon-size,  var(--ewc-icon-size-m, 1.25rem)));
                padding: var(--ewc-icon-padding, var(--ewc-alias-icon-padding, var(--ewc-size-50)));
                align-items: center;
                justify-content: center;

                --ewc-alias-icon-size: 1rem;
                --ewc-icon-size-s: .75rem;
                --ewc-icon-size-m: 1rem;
                --ewc-icon-size-l: 1.5rem;
                --ewc-icon-size-xl: 2rem;
                --ewc-icon-size-xxl: 3rem;

                --ewc-icon-padding-s: .25rem;
                --ewc-icon-padding-m: .5rem;
                --ewc-icon-padding-l: .75rem;
                --ewc-icon-padding-xl: 1rem;
                --ewc-icon-padding-xxl: 1.5rem;
            }

            ::slotted(:is(svg,i,a)) {
                display: inline-block;
                color: var(--ewc-icon-color, var(--ewc-alias-icon-color, currentColor));
                height: 1em;
                width: 1em;
                line-height: 1;
                text-align: center;
                fill: currentColor;
            }

            :host([size="s"]) { --ewc-alias-icon-size: var(--ewc-icon-size-s) }
            :host([size="m"]) { --ewc-alias-icon-size: var(--ewc-icon-size-m) }
            :host([size="l"]) { --ewc-alias-icon-size: var(--ewc-icon-size-l) }
            :host([size="xl"]) { --ewc-alias-icon-size: var(--ewc-icon-size-xl) }
            :host([size="xxl"]) { --ewc-alias-icon-size: var(--ewc-icon-size-xxl) }

            :host(:is([stacked],[bordered])) {
                padding: var(--ewc-icon-padding, var(--ewc-alias-icon-padding, var(--ewc-size-50)));
            }

            :host([stacked]) {
                background-color: var(--ewc-icon-color ,var(--ewc-alias-icon-color ,var(--ewc-color-gray-200)));
            }

            :host([stacked]:is([color])) ::slotted(:is(svg,i,a)) {
                color: #fff;
            }

            :host([bordered]) {
                border-style: var(--ewc-icon-border-style, solid);
                border-color: var(--ewc-icon-border-color, var(--ewc-alias-icon-color, var(--ewc-color-gray-300)));
                border-width: var(--ewc-icon-border-color, 1px);
            }

            :host([color="blue"])       { --ewc-alias-icon-color: var(--ewc-color-blue-500) }
            :host([color="celery"])     { --ewc-alias-icon-color: var(--ewc-color-celery-500) }
            :host([color="error"])      { --ewc-alias-icon-color: var(--ewc-color-error) }
            :host([color="fuchsia"])    { --ewc-alias-icon-color: var(--ewc-color-fuchsia-500) }
            :host([color="green"])      { --ewc-alias-icon-color: var(--ewc-color-green-500) }
            :host([color="indigo"])     { --ewc-alias-icon-color: var(--ewc-color-indigo-500) }
            :host([color="lime"])       { --ewc-alias-icon-color: var(--ewc-color-lime) }
            :host([color="magenta"])    { --ewc-alias-icon-color: var(--ewc-color-magenta-500) }
            :host([color="orange"])     { --ewc-alias-icon-color: var(--ewc-color-orange-500) }
            :host([color="primary"])    { --ewc-alias-icon-color: var(--ewc-color-primary) }
            :host([color="purple"])     { --ewc-alias-icon-color: var(--ewc-color-purple-500) }
            :host([color="secondary"])  { --ewc-alias-icon-color: var(--ewc-color-secondary) }
            :host([color="success"])    { --ewc-alias-icon-color: var(--ewc-color-success) }
            :host([color="teal"])       { --ewc-alias-icon-color: var(--ewc-color-teal-500) }
            :host([color="warning"])    { --ewc-alias-icon-color: var(--ewc-color-warning) }
            :host([color="yellow"])     { --ewc-alias-icon-color: var(--ewc-color-yellow-500) }

            :host(:is([padding="s"],[size="s"]:not([padding]))) { --ewc-alias-icon-padding: var(--ewc-icon-padding-s) }
            :host(:is([padding="m"],[size="m"]:not([padding]))) { --ewc-alias-icon-padding: var(--ewc-icon-padding-m) }
            :host(:is([padding="l"],[size="l"]:not([padding]))) { --ewc-alias-icon-padding: var(--ewc-icon-padding-l) }
            :host(:is([padding="xl"],[size="xl"]:not([padding]))) { --ewc-alias-icon-padding: var(--ewc-icon-padding-xl) }
            :host(:is([padding="xxl"],[size="xxl"]:not([padding]))) { --ewc-alias-icon-padding: var(--ewc-icon-padding-xxl) }

            :host([circular]) { border-radius: 100%; }`,
        ];
    }
}

customElements.define( 'e-icon', EIcon );
