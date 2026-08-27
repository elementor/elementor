import { audit } from '../hidden-elements';
import { makeContainer, makeContext, makeWidget } from './fixtures';

describe( audit.id, () => {
	it( 'is skipped with an empty tree', async () => {
		expect( await audit.evaluate( makeContext() ) ).toEqual( {
			status: 'skipped',
			reason: 'No elements',
		} );
	} );

	it( 'passes when element is visible on all devices', async () => {
		const tree = [ makeWidget( 'w1', 'text' ) ];

		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'passes when element is hidden on only one device', async () => {
		const tree = [ makeWidget( 'w1', 'text', { hide_desktop: true } ) ];

		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'passes when element is hidden on two devices', async () => {
		const tree = [ makeWidget( 'w1', 'text', { hide_desktop: true, hide_tablet: true } ) ];

		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails when a widget is hidden on all three devices', async () => {
		const tree = [ makeWidget( 'w1', 'text', { hide_desktop: true, hide_tablet: true, hide_mobile: true } ) ];
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].elementId ).toBe( 'w1' );
		}
	} );

	it( 'fails when a container is hidden on all devices', async () => {
		const tree = [ makeContainer( 'c1', { hide_desktop: true, hide_tablet: true, hide_mobile: true } ) ];
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].elementId ).toBe( 'c1' );
		}
	} );
} );
