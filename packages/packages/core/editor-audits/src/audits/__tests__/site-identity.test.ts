import { audit } from '../site-identity';
import { makeContext } from './fixtures';

const ALL_SET = {
	site_name_set: true,
	site_description_set: true,
	site_logo_set: true,
	site_favicon_set: true,
};

describe( audit.id, () => {
	it( 'passes when all site identity fields are set', async () => {
		expect( await audit.evaluate( makeContext( { pageContext: { site_identity: ALL_SET } } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'fails with one violation when site name is not set', async () => {
		const result = await audit.evaluate(
			makeContext( {
				pageContext: {
					site_identity: { ...ALL_SET, site_name_set: false },
				},
			} )
		);

		expect( result ).toEqual( {
			status: 'fail',
			violations: [
				{
					auditId: audit.id,
					label: 'Site name is missing or still uses the default.',
					targetHint: 'site-identity-settings',
				},
			],
		} );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].angieFix ).toBeUndefined();
		}
	} );

	it( 'fails with one violation when site description is not set', async () => {
		const result = await audit.evaluate(
			makeContext( {
				pageContext: {
					site_identity: { ...ALL_SET, site_description_set: false },
				},
			} )
		);

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 1 );
			expect( result.violations[ 0 ].label ).toBe( 'Site description is missing or still uses the default.' );
			expect( result.violations[ 0 ].targetHint ).toBe( 'site-identity-settings' );
			expect( result.violations[ 0 ].angieFix ).toBe( true );
		}
	} );

	it( 'fails with one violation when site logo is not set', async () => {
		const result = await audit.evaluate(
			makeContext( {
				pageContext: {
					site_identity: { ...ALL_SET, site_logo_set: false },
				},
			} )
		);

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].label ).toBe( 'Site logo is not set.' );
		}
	} );

	it( 'fails with one violation when site favicon is not set', async () => {
		const result = await audit.evaluate(
			makeContext( {
				pageContext: {
					site_identity: { ...ALL_SET, site_favicon_set: false },
				},
			} )
		);

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].label ).toBe( 'Site favicon is not set.' );
		}
	} );

	it( 'fails with four violations in name, description, logo, favicon order', async () => {
		const result = await audit.evaluate(
			makeContext( {
				pageContext: {
					site_identity: {
						site_name_set: false,
						site_description_set: false,
						site_logo_set: false,
						site_favicon_set: false,
					},
				},
			} )
		);

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 4 );
			expect( result.violations.map( ( v ) => v.label ) ).toEqual( [
				'Site name is missing or still uses the default.',
				'Site description is missing or still uses the default.',
				'Site logo is not set.',
				'Site favicon is not set.',
			] );
			expect( result.violations.every( ( v ) => v.targetHint === 'site-identity-settings' ) ).toBe( true );
			expect( result.violations.filter( ( v ) => v.angieFix ).map( ( v ) => v.label ) ).toEqual( [
				'Site description is missing or still uses the default.',
			] );
		}
	} );
} );
