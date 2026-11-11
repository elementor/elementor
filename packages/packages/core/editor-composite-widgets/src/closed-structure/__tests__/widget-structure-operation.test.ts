import { isWidgetStructureOperationRunning, runWidgetStructureOperation } from '../widget-structure-operation';

describe( 'runWidgetStructureOperation', () => {
	it( 'marks the operation as running only while it runs and returns its result', () => {
		// Act.
		const result = runWidgetStructureOperation( () => isWidgetStructureOperationRunning() );

		// Assert.
		expect( result ).toBe( true );
		expect( isWidgetStructureOperationRunning() ).toBe( false );
	} );

	it( 'stops running when the operation throws', () => {
		// Act.
		const run = () =>
			runWidgetStructureOperation( () => {
				throw new Error( 'failed' );
			} );

		// Assert.
		expect( run ).toThrow( 'failed' );
		expect( isWidgetStructureOperationRunning() ).toBe( false );
	} );
} );
