import { type McpToolDescriptor } from '../adapters/types';
import { getModelContext } from '../utils/get-model-context';

const createTool = (): McpToolDescriptor => ( {
	name: 'test-tool',
	description: 'test',
	inputSchema: { type: 'object', properties: {} },
	execute: async () => 'ok',
} );

const setModelContext = ( target: object, modelContext: object ): void => {
	Object.defineProperty( target, 'modelContext', {
		configurable: true,
		value: modelContext,
	} );
};

const deleteModelContext = ( target: object ): void => {
	Reflect.deleteProperty( target, 'modelContext' );
};

describe( 'getModelContext', () => {
	afterEach( () => {
		deleteModelContext( document );
		deleteModelContext( navigator );
	} );

	it( 'binds registerTool so it can be called without the host receiver', () => {
		// Arrange.
		const host = {
			registerTool() {
				if ( this !== host ) {
					throw new TypeError( 'Illegal invocation' );
				}
			},
		};
		setModelContext( document, host );

		// Act.
		const modelContext = getModelContext();
		const detachedRegisterTool = modelContext?.registerTool;

		// Assert.
		expect( detachedRegisterTool ).toBeDefined();
		expect( () => detachedRegisterTool?.( createTool() ) ).not.toThrow();
	} );
} );
