import { html } from 'https://cdn.jsdelivr.net/npm/lit-html';
import { LitElement } from 'https://cdn.jsdelivr.net/npm/lit';

class Counter extends LitElement {
	static properties = {
		count: { state: true },
	};

	constructor() {
		super();
		this.count = 0;
	}

	render() {
		return html`
      <h3>Count: ${this.count}</h3>
      <e-button @click=${() => this.count--}>-</e-button>
      <e-button @click=${() => this.count++}>+</e-button>
    `;
	}
}

customElements.define('my-counter', Counter);
