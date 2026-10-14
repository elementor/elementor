jest.mock( 'elementor-controls/base-data', () => ( {
	extend: ( properties ) => properties,
} ) );

describe( 'ControlWysiwygItemView', () => {
	let control;

	beforeEach( () => {
		global.wp = {
			editor: {
				autop: jest.fn( ( content ) => `<p>${ content.replace( /\n\n/g, '</p>\n<p>' ) }</p>` ),
			},
		};

		control = require( 'elementor-controls/wysiwyg' );
	} );

	afterEach( () => {
		delete global.wp;
	} );

	describe( 'needsAutop', () => {
		it( 'returns false for empty or non-string content', () => {
			expect( control.needsAutop( '' ) ).toBe( false );
			expect( control.needsAutop( null ) ).toBe( false );
			expect( control.needsAutop( undefined ) ).toBe( false );
			expect( control.needsAutop( 42 ) ).toBe( false );
		} );

		it( 'returns false when wp.editor.autop is not available', () => {
			delete global.wp;

			expect( control.needsAutop( 'line one\n\nline two' ) ).toBe( false );
		} );

		it( 'returns true for plain text with bare line breaks', () => {
			expect( control.needsAutop( 'line one\n\nline two' ) ).toBe( true );
		} );

		it( 'returns true for inline markup without block tags', () => {
			expect( control.needsAutop( 'line <strong>one</strong><br />\nline <a href="#">two</a>' ) ).toBe( true );
		} );

		it.each( [
			[ '<p>', '<p>line one</p>\n<p>line two</p>' ],
			[ '<p class="x">', '<p class="x">line one</p>' ],
			[ '<div>', '<div>line one\n\nline two</div>' ],
			[ '<ul>', '<ul><li>one</li></ul>' ],
			[ '<h2>', '<h2>Title</h2>\n\nline one\n\nline two' ],
			[ '<blockquote>', '<blockquote>quote</blockquote>' ],
			[ '<pre>', '<pre>code\ncode</pre>' ],
			[ '<table>', '<table><tr><td>cell</td></tr></table>' ],
			[ '<hr />', 'line one<hr />line two' ],
			[ '<P>', '<P>upper case</P>' ],
		] )( 'returns false when the content contains a %s block tag', ( tag, content ) => {
			expect( control.needsAutop( content ) ).toBe( false );
		} );

		it( 'does not treat inline tags that share a prefix with a block tag as block tags', () => {
			expect( control.needsAutop( '<pre-x>not a pre</pre-x>' ) ).toBe( true );
		} );
	} );

	describe( 'onEditorBeforeSetContent', () => {
		it( 'runs autop on load for content without block tags', () => {
			const event = { load: true, format: 'html', content: 'line one\n\nline two' };

			control.onEditorBeforeSetContent( event );

			expect( wp.editor.autop ).toHaveBeenCalledWith( 'line one\n\nline two' );
			expect( event.content ).toBe( '<p>line one</p>\n<p>line two</p>' );
		} );

		it( 'keeps content with block tags verbatim on load', () => {
			const content = '<p>line one</p>\n<br /><br />\n<p>line two</p>';
			const event = { load: true, format: 'html', content };

			control.onEditorBeforeSetContent( event );

			expect( wp.editor.autop ).not.toHaveBeenCalled();
			expect( event.content ).toBe( content );
		} );

		it( 'does not run autop when the content is not loaded from the textarea', () => {
			const event = { load: false, format: 'html', content: 'line one\n\nline two' };

			control.onEditorBeforeSetContent( event );

			expect( wp.editor.autop ).not.toHaveBeenCalled();
			expect( event.content ).toBe( 'line one\n\nline two' );
		} );

		it( 'does not run autop for raw format content', () => {
			const event = { load: true, format: 'raw', content: 'line one\n\nline two' };

			control.onEditorBeforeSetContent( event );

			expect( wp.editor.autop ).not.toHaveBeenCalled();
		} );
	} );
} );
