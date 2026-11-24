import { dispatchV1ReadyEvent } from 'test-utils';
import { __privateSetReady } from '@elementor/editor-v1-adapters';

import { addLegacyFilter } from '../add-legacy-filter';

const FILTER_NAME = 'navigator/element/test';

type WindowWithHooks = { elementor?: { hooks: { addFilter: jest.Mock } } };

function setHooks() {
	const addFilter = jest.fn();

	( window as unknown as WindowWithHooks ).elementor = { hooks: { addFilter } };

	return addFilter;
}

describe( 'addLegacyFilter', () => {
	afterEach( () => {
		delete ( window as unknown as WindowWithHooks ).elementor;
		__privateSetReady( false );
	} );

	it( 'should register the filter immediately when the hooks exist', () => {
		// Arrange
		const addFilter = setHooks();
		const callback = jest.fn();

		// Act
		addLegacyFilter( FILTER_NAME, callback );

		// Assert
		expect( addFilter ).toHaveBeenCalledTimes( 1 );
		expect( addFilter ).toHaveBeenCalledWith( FILTER_NAME, callback );
	} );

	it( 'should register the filter once v1 is ready when the hooks are not available yet', () => {
		// Arrange
		const callback = jest.fn();
		addLegacyFilter( FILTER_NAME, callback );
		const addFilter = setHooks();

		// Act
		dispatchV1ReadyEvent();

		// Assert
		expect( addFilter ).toHaveBeenCalledTimes( 1 );
		expect( addFilter ).toHaveBeenCalledWith( FILTER_NAME, callback );
	} );
} );
