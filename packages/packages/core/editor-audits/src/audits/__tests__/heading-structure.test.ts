import { audit } from '../heading-structure';
import { makeContext, makeWidget } from './fixtures';

describe( audit.id, () => {
	it( 'is skipped with an empty tree', async () => {
		expect( await audit.evaluate( makeContext() ) ).toEqual( {
			status: 'skipped',
			reason: 'No elements',
		} );
	} );

	it( 'passes with one H1 and consecutive levels', async () => {
		const tree = [
			makeWidget( 'h1', 'heading', { title: 'One', header_size: 'h1' } ),
			makeWidget( 'h2', 'heading', { title: 'Two', header_size: 'h2' } ),
			makeWidget( 'h3', 'heading', { title: 'Three', header_size: 'h3' } ),
		];

		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails when no H1 is present', async () => {
		const tree = [ makeWidget( 'h2', 'heading', { title: 'Two', header_size: 'h2' } ) ];
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );
	} );

	it( 'flags a skipped heading level', async () => {
		const tree = [
			makeWidget( 'h1', 'heading', { title: 'One', header_size: 'h1' } ),
			makeWidget( 'h4', 'heading', { title: 'Four', header_size: 'h4' } ),
		];
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations.some( ( v ) => v.label.includes( 'skipped' ) ) ).toBe( true );
		}
	} );

	it( 'ignores heading widgets with empty title', async () => {
		const tree = [ makeWidget( 'h1', 'heading', { title: '', header_size: 'h1' } ) ];
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations.some( ( v ) => v.label.includes( 'No headings found' ) ) ).toBe( true );
		}
	} );

	it( 'ignores non-heading tags such as div', async () => {
		const tree = [
			makeWidget( 'h1', 'heading', { title: 'One', header_size: 'h1' } ),
			makeWidget( 'counter', 'counter', { title: 'Count', title_tag: 'div' } ),
		];

		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'reads icon-box title_size control', async () => {
		const tree = [
			makeWidget( 'h1', 'heading', { title: 'One', header_size: 'h1' } ),
			makeWidget( 'box', 'icon-box', { title_text: 'Box', title_size: 'h2' } ),
		];

		expect( ( await audit.evaluate( makeContext( { tree } ) ) ).status ).toBe( 'pass' );
	} );

	it( 'expands accordion repeater items', async () => {
		const tree = [
			makeWidget( 'h1', 'heading', { title: 'One', header_size: 'h1' } ),
			makeWidget( 'acc', 'accordion', {
				title_html_tag: 'h3',
				tabs: [ { tab_title: 'Tab 1' }, { tab_title: 'Tab 2' } ],
			} ),
		];
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations.some( ( v ) => v.label.includes( 'skipped' ) ) ).toBe( true );
		}
	} );

	it( 'counts divider heading only when look is line_text', async () => {
		const tree = [
			makeWidget( 'h1', 'heading', { title: 'One', header_size: 'h1' } ),
			makeWidget( 'div-ignored', 'divider', { look: 'line_icon', html_tag: 'h2', text: 'Ignored' } ),
			makeWidget( 'div-counted', 'divider', { look: 'line_text', html_tag: 'h2', text: 'Counted' } ),
		];

		expect( ( await audit.evaluate( makeContext( { tree } ) ) ).status ).toBe( 'pass' );
	} );

	it( 'emits one placeholder heading for dynamic posts widget', async () => {
		const tree = [
			makeWidget( 'h1', 'heading', { title: 'One', header_size: 'h1' } ),
			makeWidget( 'h2', 'heading', { title: 'Two', header_size: 'h2' } ),
			makeWidget( 'posts', 'posts', { show_title: 'yes', title_tag: 'h3' } ),
		];

		expect( ( await audit.evaluate( makeContext( { tree } ) ) ).status ).toBe( 'pass' );
	} );

	it( 'skips posts widget when show_title is off', async () => {
		const tree = [
			makeWidget( 'h1', 'heading', { title: 'One', header_size: 'h1' } ),
			makeWidget( 'posts', 'posts', { show_title: '', title_tag: 'h1' } ),
		];

		expect( ( await audit.evaluate( makeContext( { tree } ) ) ).status ).toBe( 'pass' );
	} );

	it( 'flags extra H1 from posts placeholder', async () => {
		const tree = [
			makeWidget( 'h1', 'heading', { title: 'One', header_size: 'h1' } ),
			makeWidget( 'posts', 'posts', { show_title: 'yes', title_tag: 'h1' } ),
		];
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations.some( ( v ) => v.label.includes( 'More than one H1 on the page.' ) ) ).toBe(
				true
			);
		}
	} );
} );
