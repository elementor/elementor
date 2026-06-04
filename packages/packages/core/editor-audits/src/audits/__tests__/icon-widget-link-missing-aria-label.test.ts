import { audit } from '../icon-widget-link-missing-aria-label';
import { makeContext, makeWidget } from './fixtures';

describe( audit.id, () => {
	it( 'passes when icon link has an aria-label custom attribute', async () => {
		const tree = [
			makeWidget( 'icn', 'icon', {
				link: { url: 'https://example.com' },
				custom_attributes: 'aria-label|Open homepage',
			} ),
		];

		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'passes when the icon has no link at all', async () => {
		const tree = [ makeWidget( 'icn', 'icon', { link: { url: '' } } ) ];
		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails when icon link has no aria-label custom attribute', async () => {
		const tree = [ makeWidget( 'icn', 'icon', { link: { url: 'https://example.com' }, custom_attributes: '' } ) ];
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );
	} );
} );
