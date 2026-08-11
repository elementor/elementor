import { __createPanel, __registerPanel, createPanel, registerPanel } from '../index';

describe( 'editor-panels exports', () => {
	it( 'should expose public and compatibility aliases', () => {
		expect( createPanel ).toBe( __createPanel );
		expect( registerPanel ).toBe( __registerPanel );
	} );
} );
