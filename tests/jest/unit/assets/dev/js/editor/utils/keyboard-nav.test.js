import {
	escapeFromPanelField,
	findNextFocusableAfter,
	getEscapeAnchor,
	isEditableTarget,
	isInsideOverlay,
} from 'elementor-editor-utils/keyboard-nav';

describe( 'keyboard-nav - escapeFromPanelField', () => {
	let panel;

	const renderPanel = ( html ) => {
		document.body.innerHTML = `<div id="elementor-panel-inner">${ html }</div>`;

		panel = document.getElementById( 'elementor-panel-inner' );

		return panel;
	};

	const pressEscape = () => {
		const event = new KeyboardEvent( 'keydown', { key: 'Escape', bubbles: true, cancelable: true } );

		document.activeElement.dispatchEvent( event );

		return event;
	};

	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'blurs an escaped V1 control input and parks focus on the control wrapper', () => {
		renderPanel( `
			<div class="elementor-control elementor-control-type-text">
				<label>Title</label>
				<input type="text" id="title" />
			</div>
		` );

		const input = document.getElementById( 'title' );
		const wrapper = panel.querySelector( '.elementor-control' );

		input.focus();

		panel.addEventListener( 'keydown', ( event ) => escapeFromPanelField( event, panel ) );

		const event = pressEscape();

		expect( document.activeElement ).toBe( wrapper );
		expect( wrapper.getAttribute( 'tabindex' ) ).toBe( '-1' );
		expect( event.defaultPrevented ).toBe( true );
	} );

	it( 'parks focus on the V4 settings field wrapper', () => {
		renderPanel( `
			<span data-type="settings-field">
				<textarea id="content"></textarea>
			</span>
		` );

		const textarea = document.getElementById( 'content' );

		textarea.focus();

		panel.addEventListener( 'keydown', ( event ) => escapeFromPanelField( event, panel ) );

		pressEscape();

		expect( document.activeElement ).toBe( panel.querySelector( '[data-type="settings-field"]' ) );
	} );

	it( 'stops propagation so the global esc shortcut does not run', () => {
		renderPanel( '<div class="elementor-control"><input type="text" id="title" /></div>' );

		document.getElementById( 'title' ).focus();

		panel.addEventListener( 'keydown', ( event ) => escapeFromPanelField( event, panel ) );

		const windowHandler = jest.fn();

		window.addEventListener( 'keydown', windowHandler );

		pressEscape();

		expect( windowHandler ).not.toHaveBeenCalled();

		window.removeEventListener( 'keydown', windowHandler );
	} );

	it( 'lets the global esc shortcut run when nothing editable is focused', () => {
		renderPanel( '<div class="elementor-control"><button id="reset">Reset</button></div>' );

		document.getElementById( 'reset' ).focus();

		panel.addEventListener( 'keydown', ( event ) => escapeFromPanelField( event, panel ) );

		const windowHandler = jest.fn();

		window.addEventListener( 'keydown', windowHandler );

		const event = pressEscape();

		expect( windowHandler ).toHaveBeenCalled();
		expect( event.defaultPrevented ).toBe( false );

		window.removeEventListener( 'keydown', windowHandler );
	} );

	it( 'ignores an event that was already default prevented', () => {
		renderPanel( '<div class="elementor-control"><input type="text" id="title" /></div>' );

		const input = document.getElementById( 'title' );

		input.focus();

		input.addEventListener( 'keydown', ( event ) => event.preventDefault() );
		panel.addEventListener( 'keydown', ( event ) => escapeFromPanelField( event, panel ) );

		pressEscape();

		expect( document.activeElement ).toBe( input );
	} );

	it( 'ignores fields inside an overlay that owns the escape key', () => {
		renderPanel( `
			<div role="dialog">
				<div class="elementor-control"><input type="text" id="title" /></div>
			</div>
		` );

		const input = document.getElementById( 'title' );

		input.focus();

		panel.addEventListener( 'keydown', ( event ) => escapeFromPanelField( event, panel ) );

		pressEscape();

		expect( document.activeElement ).toBe( input );
	} );

	it( 'ignores the second escape press, so the panel can still be exited', () => {
		renderPanel( '<div class="elementor-control"><input type="text" id="title" /></div>' );

		document.getElementById( 'title' ).focus();

		panel.addEventListener( 'keydown', ( event ) => escapeFromPanelField( event, panel ) );

		pressEscape();

		const secondEvent = pressEscape();

		expect( secondEvent.defaultPrevented ).toBe( false );
	} );

	it( 'moves focus past the escaped control when tabbing from the wrapper', () => {
		renderPanel( `
			<div class="elementor-control"><input type="text" id="title" /></div>
			<div class="elementor-control"><input type="text" id="subtitle" /></div>
		` );

		document.getElementById( 'title' ).focus();

		panel.addEventListener( 'keydown', ( event ) => escapeFromPanelField( event, panel ) );

		pressEscape();

		const wrapper = panel.querySelector( '.elementor-control' );

		wrapper.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Tab', bubbles: true, cancelable: true } ) );

		expect( document.activeElement ).toBe( document.getElementById( 'subtitle' ) );
	} );

	it( 'cleans up the temporary tabindex once focus leaves the wrapper', () => {
		renderPanel( `
			<div class="elementor-control"><input type="text" id="title" /></div>
			<div class="elementor-control"><input type="text" id="subtitle" /></div>
		` );

		document.getElementById( 'title' ).focus();

		panel.addEventListener( 'keydown', ( event ) => escapeFromPanelField( event, panel ) );

		pressEscape();

		const wrapper = panel.querySelector( '.elementor-control' );

		document.getElementById( 'subtitle' ).focus();

		expect( wrapper.hasAttribute( 'tabindex' ) ).toBe( false );
	} );
} );

describe( 'keyboard-nav - escape helpers', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	it.each( [
		[ '<input type="text" />', true ],
		[ '<input type="hidden" />', false ],
		[ '<textarea></textarea>', true ],
		[ '<select></select>', true ],
		[ '<div contenteditable="true"></div>', true ],
		[ '<button></button>', false ],
		[ '<div class="monaco-editor"><textarea></textarea></div>', true ],
	] )( 'isEditableTarget( %s ) is %s', ( html, expected ) => {
		document.body.innerHTML = html;

		const element = document.body.querySelector( 'input, textarea, select, [contenteditable], button' );

		expect( isEditableTarget( element ) ).toBe( expected );
	} );

	it( 'isEditableTarget handles a missing element', () => {
		expect( isEditableTarget( null ) ).toBe( false );
	} );

	it( 'isInsideOverlay detects MUI popovers', () => {
		document.body.innerHTML = '<div class="MuiPopover-root"><input type="text" /></div>';

		expect( isInsideOverlay( document.querySelector( 'input' ) ) ).toBe( true );
	} );

	it( 'getEscapeAnchor falls back to the Monaco container parent', () => {
		document.body.innerHTML = `
			<div id="css-control">
				<div class="monaco-editor"><textarea></textarea></div>
			</div>
		`;

		const anchor = getEscapeAnchor( document.querySelector( 'textarea' ) );

		expect( anchor ).toBe( document.getElementById( 'css-control' ) );
	} );

	it( 'getEscapeAnchor falls back to the parent element', () => {
		document.body.innerHTML = '<div id="holder"><input type="text" /></div>';

		expect( getEscapeAnchor( document.querySelector( 'input' ) ) ).toBe( document.getElementById( 'holder' ) );
	} );

	it( 'findNextFocusableAfter skips the element subtree', () => {
		document.body.innerHTML = `
			<div id="root">
				<div id="first"><input id="inner" type="text" /></div>
				<button id="next">Next</button>
			</div>
		`;

		const next = findNextFocusableAfter( document.getElementById( 'first' ), document.getElementById( 'root' ) );

		expect( next ).toBe( document.getElementById( 'next' ) );
	} );

	it( 'findNextFocusableAfter returns null when nothing follows', () => {
		document.body.innerHTML = '<div id="root"><div id="first"><input type="text" /></div></div>';

		const next = findNextFocusableAfter( document.getElementById( 'first' ), document.getElementById( 'root' ) );

		expect( next ).toBeNull();
	} );
} );
