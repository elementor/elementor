import { getAppliedClassContext, setAppliedClassContext } from '../applied-class-context';

describe( 'applied-class-context', () => {
	afterEach( () => {
		setAppliedClassContext( null );
	} );

	it( 'should return null by default', () => {
		expect( getAppliedClassContext() ).toBeNull();
	} );

	it( 'should return the last value set', () => {
		// Act.
		setAppliedClassContext( 'local' );

		// Assert.
		expect( getAppliedClassContext() ).toBe( 'local' );

		// Act.
		setAppliedClassContext( 'my-button-class' );

		// Assert.
		expect( getAppliedClassContext() ).toBe( 'my-button-class' );
	} );
} );
