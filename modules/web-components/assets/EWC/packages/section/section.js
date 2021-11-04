import { LitElement, html, css } from '../../node_modules/lit';

export class Button extends LitElement {
	static get styles() {
		return css`
        .btn {
            display: inline-flex;
            align-items: center;
            gap: .5rem;
            z-index: 1;
        }

        ::slotted(a) {
            color: inherit;
            text-decoration: none;
            display: flex;
            z-index: 2;
        }

        ::slotted(a):before, .bg-layer {
            content: '';
            display: block;
            position: absolute;
            inset: -2px;
        }

        :host {
            position: relative;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            gap: .5rem;
            padding: 7px 19px;
            font-size: .875rem;
            font-weight: 600;
            line-height: 20px; /* Specifically not inherit our <body> default */
            white-space: nowrap;
            vertical-align: middle;
            cursor: pointer;
            user-select: none;
            border: 2px solid;
            border-radius: var(--ewc-btn-radius, var(--ewc-alias-btn-radius, var(--ewc-size-radius-m, 6px)));
            appearance: none; /* Corrects inability to style clickable input types in iOS. */
        }

        :host([grow]) {
            width: 100%;
            --ewc-flex-grow: 1;
        }

        /* Default button */

        :host {
            border-color: var(--ewc-btn-color, var(--ewc-alias-btn-color, var(--ewc-color-gray-300)));
            box-shadow: var(--ewc-btn-shadow), var(--ewc-btn-inset-shadow);
            transition: 0.2s cubic-bezier(0.3, 0, 0.5, 1);
            transition-property: color, background-color, border-color;
        }

        :host([size="tiny"])    { padding: 2px 11px;  font-size: .6875rem;  --ewc-alias-btn-radius: var(--ewc-size-radius-xs)}
        :host([size="mini"])    { padding: 5px 13px;  font-size: .75rem;    --ewc-alias-btn-radius: var(--ewc-size-radius-s)}
        :host([size="small"])   { padding: 7px 15px;  font-size: .8125rem;  --ewc-alias-btn-radius: var(--ewc-size-radius-s)}
        :host([size="medium"])  { padding: 9px 17px;  font-size: .9rem;     --ewc-alias-btn-radius: var(--ewc-size-radius-m)}
        :host([size="large"])   { padding: 11px 19px; font-size: 1rem;      --ewc-alias-btn-radius: var(--ewc-size-radius-m)}
        :host([size="big"])     { padding: 13px 23px; font-size: 1.1225rem; --ewc-alias-btn-radius: var(--ewc-size-radius-m)}
        :host([size="huge"])    { padding: 15px 23px; font-size: 1.25rem;   --ewc-alias-btn-radius: var(--ewc-size-radius-l)}
        :host([size="massive"]) { padding: 19px 31px; font-size: 1.5rem;    --ewc-alias-btn-radius: var(--ewc-size-radius-l)}

        :host([color="primary"])   { --ewc-alias-btn-color: var(--ewc-color-primary)}
        :host([color="secondary"]) { --ewc-alias-btn-color: var(--ewc-color-secondary)}
        :host([color="danger"])    { --ewc-alias-btn-color: var(--ewc-color-error)}
        :host([color="success"])   { --ewc-alias-btn-color: var(--ewc-color-success)}
        :host([color="warning"])   { --ewc-alias-btn-color: var(--ewc-color-warning)}
        :host([color="info"])      { --ewc-alias-btn-color: var(--ewc-color-info)}

        :host([color="magenta"])   { --ewc-alias-btn-color: var(--ewc-color-magenta-500)}
        :host([color="fuchsia"])   { --ewc-alias-btn-color: var(--ewc-color-fuchsia-500)}
        :host([color="purple"])    { --ewc-alias-btn-color: var(--ewc-color-purple-500)}
        :host([color="indigo"])    { --ewc-alias-btn-color: var(--ewc-color-indigo-500)}
        :host([color="blue"])      { --ewc-alias-btn-color: var(--ewc-color-blue-500)}
        :host([color="teal"])      { --ewc-alias-btn-color: var(--ewc-color-seafoam-500)}
        :host([color="green"])     { --ewc-alias-btn-color: var(--ewc-color-green-500)}
        :host([color="celery"])    { --ewc-alias-btn-color: var(--ewc-color-celery-500)}
        :host([color="lime"])      { --ewc-alias-btn-color: var(--ewc-color-chartreuse-500)}
        :host([color="yellow"])    { --ewc-alias-btn-color: var(--ewc-color-yellow-500)}
        :host([color="orange"])    { --ewc-alias-btn-color: var(--ewc-color-orange-500)}
        :host([color="red"])       { --ewc-alias-btn-color: var(--ewc-color-red-500)}

        :host(:not([color])), :host([color="default"]) { color: var(--ewc-color-gray-800)}

        :host(:not(:is([outline],[quiet]))) {
            color: #fff;
            background-color: var(--ewc-btn-color, var(--ewc-alias-btn-color, var(--ewc-color-gray-300)));
        }

        :host(:is([outline],[quiet])) {
            color: var(--ewc-btn-color, var(--ewc-alias-btn-color, var(--ewc-color-gray-800)));
            border-color: currentColor;
        }

        :host(:is([outline],[quiet])) .bg-layer {
            background-color: currentColor;
            opacity: calc(1 - var(--ewc-btn-color-brightness, 1));
        }

        :host([pill]) {
            --ewc-alias-btn-radius: var(--ewc-size-radius-round-600, 6rem);
        }

        :host([quiet]) {
            border-color: transparent;
            --ewc-btn-color-brightness: .95;
        }

        :host(:not([color])), :host([color="default"]) {
            color: var(--ewc-color-gray-800);
        }

        .bg-layer {
            transition: 0.2s cubic-bezier(0.3, 0, 0.5, 1);
            border-radius: var(--ewc-btn-radius, var(--ewc-alias-btn-radius, var(--ewc-size-radius-m, 6px)));
        }

        :host(:not(:is([outline],[quiet]))) .bg-layer {
            background-color: black;
            mix-blend-mode: multiply;
            opacity: calc(1 - var(--ewc-btn-color-brightness, 1));
        }

        :host(:hover),
        :host(.hover) {
            --ewc-btn-color-brightness: .9;
            transition-duration: 0.1s;
        }

        :host(:active), :host(:active) .bg-layer {
            --ewc-btn-color-brightness: .8;
            transition: none;
        }

        :host(.selected),
        :host([aria-selected=true]) {
            --ewc-btn-color-brightness: .8;
            box-shadow: var(--color-shadow-inset);
        }

        :host(:disabled),
        :host(.disabled),
        :host([aria-disabled=true]) {
            color: var(--color-text-disabled);
            background-color: var(--color-btn-bg);
            border-color: var(--color-btn-border);
        }

        /* Keep :focus after :disabled. Allows to see the focus ring even on disabled buttons */
        :host(:focus),
        :host(.focus) {
            border-color: var(--color-btn-focus-border);
            outline: none;
            box-shadow: var(--color-btn-focus-shadow);
        }

        :host(:hover) { text-decoration: none; }

        :host(:disabled),
        :host(.disabled),
        :host([aria-disabled=true]) {
            cursor: default;
        }

        :host(:disabled) .e-icon,
        :host(.disabled) .e-icon,
        :host([aria-disabled=true]) .e-icon{
            color: var(--color-icon-tertiary);
        }

        i {
            font-style: normal;
            font-weight: 600;
            opacity: 0.75;
        }

        .e-icon {
            position: relative;
            margin-right: .5rem;
            color: var(--color-text-tertiary);
            vertical-align: text-bottom;
            z-index: 1;
        }

        .e-icon:only-child {
            margin-right: 0;
        }

        .Counter {
            margin-left: 2px;
            color: inherit;
            text-shadow: none;
            vertical-align: top;
            background-color: var(--color-btn-counter-bg);
        }

        .dropdown-caret {
            margin-left: .25rem;
            opacity: 0.8;
        }`;
    }

	render() {
		return html`
            <div class="bg-layer"></div>
            <slot class="btn"></slot>`;
	}
}

window.customElements.define( 'e-button', Button );