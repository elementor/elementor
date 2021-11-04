import { css } from 'lit';

export const buttonStyle = css`
  ::slotted(*) {
	z-index: 2;
	color: inherit !important;
	text-decoration: none !important;
  }

  slot:not([name]) {
	order: 2;
	display: inline-block;
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
	vertical-align: middle;
	border-style: solid;
	white-space: nowrap;
	cursor: pointer;
	appearance: none;
	user-select: none;
	gap: var(--ewc-btn-gap, .5em);
	padding: var(--ewc-btn-padding, var(--ewc-alias-btn-padding, 7px 19px));
	font-size: var(--ewc-btn-font-size, var(--ewc-alias-btn-font-size, .875rem));
	font-weight: var(--ewc-btn-font-weight, 600);
	line-height: var(--ewc-btn-line-height, 20px);
	border-width: var(--ewc-btn-border-width, 2px);
	border-color: var(--ewc-btn-color, var(--ewc-alias-btn-color, var(--ewc-color-gray-300)));
	border-radius: var(--ewc-btn-radius, var(--ewc-alias-btn-radius, var(--ewc-size-radius-m, 6px)));
	box-shadow: var(--ewc-btn-shadow, none), var(--ewc-btn-inset-shadow, none);
	transition: 0.2s cubic-bezier(0.3, 0, 0.5, 1);
	transition-property: color, background-color, border-color;
  }

  :host:before {
	content: '';
	display: block;
	position: absolute;
	inset: calc(-1 * var(--ewc-btn-border-width, 2px));
	z-index: 1;
	border-radius: inherit;
	outline-color: var(--ewc-btn-focus-color,
		var(--ewc-btn-color,
		var(--ewc-alias-btn-color,
		var(--ewc-color-primary,
		currentColor))));
	outline-width: calc( var(--ewc-btn-focus-ring-width, var(--ewc-size-border-thick, 3px)) * var(--ewc-btn-focus-state, 0));
	outline-style: solid;
	opacity: calc( var( --ewc-btn-focus-ring-opacity, 0.33) * var(--ewc-btn-focus-state, 0));
	transition: opacity .1s, outline-width .2s;
  }

  /* Default button */

  :host([size="tiny"])    { --ewc-alias-btn-padding: 0 8px;     --ewc-alias-btn-font-size: .6875rem;  --ewc-alias-btn-radius: var(--ewc-size-radius-xs)}
  :host([size="mini"])    { --ewc-alias-btn-padding: 2px 12px;  --ewc-alias-btn-font-size: .75rem;    --ewc-alias-btn-radius: var(--ewc-size-radius-s)}
  :host([size="small"])   { --ewc-alias-btn-padding: 4px 14px;  --ewc-alias-btn-font-size: .8125rem;  --ewc-alias-btn-radius: var(--ewc-size-radius-s)}
  :host([size="medium"])  { --ewc-alias-btn-padding: 8px 18px;  --ewc-alias-btn-font-size: .9rem;     --ewc-alias-btn-radius: var(--ewc-size-radius-m)}
  :host([size="large"])   { --ewc-alias-btn-padding: 12px 20px; --ewc-alias-btn-font-size: 1.1225rem; --ewc-alias-btn-radius: var(--ewc-size-radius-m)}
  :host([size="big"])     { --ewc-alias-btn-padding: 16px 24px; --ewc-alias-btn-font-size: 1.25rem;   --ewc-alias-btn-radius: var(--ewc-size-radius-l)}
  :host([size="huge"])    { --ewc-alias-btn-padding: 20px 32px; --ewc-alias-btn-font-size: 1.5rem;    --ewc-alias-btn-radius: var(--ewc-size-radius-l)}
  :host([size="massive"]) { --ewc-alias-btn-padding: 24px 36px; --ewc-alias-btn-font-size: 1.75rem;   --ewc-alias-btn-radius: var(--ewc-size-radius-l)}

  :host([color="primary"])   { --ewc-alias-btn-color: var(--ewc-color-primary)}
  :host([color="secondary"]) { --ewc-alias-btn-color: var(--ewc-color-secondary)}
  :host([color="danger"])    { --ewc-alias-btn-color: var(--ewc-color-danger)}
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
	color: var(--ewc-btn-text-color);
	--ewc-btn-text-color: #fff;
	background-color: var(--ewc-btn-color, var(--ewc-alias-btn-color, var(--ewc-color-gray-300)));
  }

  :host(:is([outline],[quiet])) {
	color: var(--ewc-btn-color, var(--ewc-alias-btn-color, var(--ewc-color-gray-800)));
	border-color: currentColor;
  }

  :host([pill]) {
	--ewc-alias-btn-radius: var(--ewc-size-radius-round-600, 6rem);
  }

  :host([quiet]) {
	border-color: transparent;
	--ewc-btn-color-brightness: .95;
  }

  :host(:is([color="default"], :not([color]))) {
	color: var(--ewc-color-gray-800);
  }

  .bg-layer {
	background-color: var(--ewc-btn-bg-layer-color, currentColor);
	opacity: calc(1 - var(--ewc-btn-color-brightness, 1));
	transition: 0.2s cubic-bezier(0.3, 0, 0.5, 1);
	border-radius: var(--ewc-btn-radius, var(--ewc-alias-btn-radius, var(--ewc-size-radius-m, 6px)));
  }

  :host(:not(:is([outline],[quiet]))) .bg-layer {
	background-color: black;
	mix-blend-mode: multiply;
	opacity: calc(1 - var(--ewc-btn-color-brightness, 1));
  }

  :host(:is(:hover,[hover])) {
	--ewc-btn-color-brightness: .9;
	transition-duration: 0.1s;
  }

  :host(:active), :host(:active) .bg-layer {
	--ewc-btn-color-brightness: .8;
	transition: none;
  }

  :host(:is(.selected, [selected], [aria-selected=true])) {
	--ewc-btn-color-brightness: .8;
	box-shadow: var(--color-shadow-inset);
  }

  :host(:is(.disabled, [disabled] :disabled, [aria-disabled=true])) {
	color: var(--color-text-disabled);
	background-color: var(--color-btn-bg);
	border-color: var(--color-btn-border);
  }

  :host(:focus),
  ::slotted(a:focus) {
	outline: 0 none;
  }

  :host([focused]) {
	--ewc-btn-focus-state: 1;
  }

  :host(:hover) { text-decoration: none; }

  :host(:is(:disabled, .disabled, [aria-disabled=true], [disabled])) {
	opacity: 0.75;
	cursor: default;
  }

  :host([grow]) {
	width: 100%;
	--ewc-flex-grow: 1;
  }

  i {
	font-style: normal;
	font-weight: 600;
	opacity: 0.75;
  }

  ::slotted(e-icon) {
	--ewc-alias-icon-padding: 0;
  }`;
