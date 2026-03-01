import { getDefaultName } from '../variables-manager-create-menu';

import type { TVariablesList } from '../../../storage';

const makeVars = ( entries: Array< { label: string; type: string } > ): TVariablesList =>
	Object.fromEntries(
		entries.map( ( entry, i ) => [
			`var-${ i }`,
			{ label: entry.label, type: entry.type, value: '' },
		] )
	);

describe( 'getDefaultName', () => {
	it( 'returns baseName-1 when there are no existing variables', () => {
		expect( getDefaultName( {}, 'size' ) ).toBe( 'size-1' );
	} );

	it( 'returns baseName-2 when baseName-1 already exists (same type)', () => {
		const variables = makeVars( [ { label: 'size-1', type: 'global-size-variable' } ] );
		expect( getDefaultName( variables, 'size' ) ).toBe( 'size-2' );
	} );

	it( 'returns baseName-3 when baseName-1 and baseName-2 already exist', () => {
		const variables = makeVars( [
			{ label: 'size-1', type: 'global-size-variable' },
			{ label: 'size-2', type: 'global-size-variable' },
		] );
		expect( getDefaultName( variables, 'size' ) ).toBe( 'size-3' );
	} );

	it( 'returns baseName-3 when baseName-1 is a standard type and baseName-2 is a custom type', () => {
		// Bug scenario: custom size variable occupies "size-2" but was previously ignored
		const variables = makeVars( [
			{ label: 'size-1', type: 'global-size-variable' },
			{ label: 'size-2', type: 'global-custom-size-variable' },
		] );
		expect( getDefaultName( variables, 'size' ) ).toBe( 'size-3' );
	} );

	it( 'fills the first gap in numbering (1 and 3 exist, returns baseName-2)', () => {
		const variables = makeVars( [
			{ label: 'size-1', type: 'global-size-variable' },
			{ label: 'size-3', type: 'global-size-variable' },
		] );
		expect( getDefaultName( variables, 'size' ) ).toBe( 'size-2' );
	} );

	it( 'is case-insensitive (Size-1 and size-2 both count)', () => {
		const variables = makeVars( [
			{ label: 'Size-1', type: 'global-size-variable' },
			{ label: 'size-2', type: 'global-size-variable' },
		] );
		expect( getDefaultName( variables, 'size' ) ).toBe( 'size-3' );
	} );
} );
