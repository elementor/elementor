/**
 * @license
 * Copyright 2021 Elementor LTD
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {Heading} from '../heading.js';
import {fixture, html} from '@open-wc/testing';

const assert = chai.assert;

suite('ewc-heading', () => {
  test('is defined', () => {
    const el = document.createElement('e-heading');
    assert.instanceOf(el, Heading);
  });

  test('renders with default values', async () => {
    const el = await fixture(html`<e-heading></e-heading>`);
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: 0</button>
      <slot></slot>
    `
    );
  });

  test('renders with a set name', async () => {
    const el = await fixture(html`<e-heading name="Test"></e-heading>`);
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, Test!</h1>
      <button part="button">Click Count: 0</button>
      <slot></slot>
    `
    );
  });

  test('handles a click', async () => {
    const el = await fixture(html`<e-heading></e-heading>`);
    const button = el.shadowRoot.querySelector('button');
    button.click();
    await el.updateComplete;
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: 1</button>
      <slot></slot>
    `
    );
  });

  test('styling applied', async () => {
    const el = await fixture(html`<e-heading></e-heading>`);
    await el.updateComplete;
    assert.equal(getComputedStyle(el).paddingTop, '16px');
  });
});
