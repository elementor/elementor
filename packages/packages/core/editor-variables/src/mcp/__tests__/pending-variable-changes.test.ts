import { __privateRunCommandSync as runCommandSync, registerDataHook } from '@elementor/editor-v1-adapters';

import { service } from '../../service';
import {
	applyPlannedVariableChange,
	getPendingAbilityOperations,
	resetPendingVariableChanges,
	savePendingVariableChanges,
	syncPendingVariableChangesWithDocumentSave,
} from '../pending-variable-changes';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateRunCommandSync: jest.fn(),
	registerDataHook: jest.fn(),
} ) );

jest.mock( '../../service', () => ( {
	service: {
		variables: jest.fn( () => ( {} ) ),
		applyLocalChange: jest.fn(),
		saveOperations: jest.fn(),
	},
} ) );

describe( 'pending-variable-changes', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		resetPendingVariableChanges();
		jest.mocked( service.saveOperations ).mockResolvedValue( {
			success: true,
			watermark: 1,
			operations: 1,
		} as never );
	} );

	it( 'marks the document as modified when a change is applied', () => {
		// Act.
		applyPlannedVariableChange( {
			action: 'create',
			id: 'e-gv-a1b2c3d',
			type: 'global-color-variable',
			label: 'brand',
			value: '#000',
		} );

		// Assert.
		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/save/set-is-modified',
			{ status: true },
			{ internal: true }
		);
	} );

	it( 'saves all pending changes in one batch, keeping the planned ids', async () => {
		// Arrange.
		applyPlannedVariableChange( {
			action: 'create',
			id: 'e-gv-a1b2c3d',
			type: 'global-color-variable',
			label: 'brand',
			value: '#000',
		} );
		applyPlannedVariableChange( { action: 'update', id: 'e-gv-a1b2c3d', label: 'brand', value: '#fff' } );
		applyPlannedVariableChange( { action: 'delete', id: 'e-gv-old' } );

		// Act.
		await savePendingVariableChanges();

		// Assert.
		expect( service.saveOperations ).toHaveBeenCalledWith( [
			{
				type: 'create',
				variable: { id: 'e-gv-a1b2c3d', type: 'global-color-variable', label: 'brand', value: '#000' },
			},
			{ type: 'update', id: 'e-gv-a1b2c3d', variable: { label: 'brand', value: '#fff' } },
			{ type: 'delete', id: 'e-gv-old' },
		] );
		expect( getPendingAbilityOperations() ).toHaveLength( 0 );
	} );

	it( 'keeps the changes queued when the save fails', async () => {
		// Arrange.
		jest.mocked( service.saveOperations ).mockRejectedValueOnce( new Error( 'conflict' ) );
		applyPlannedVariableChange( { action: 'delete', id: 'e-gv-old' } );

		// Act & Assert.
		await expect( savePendingVariableChanges() ).rejects.toThrow( 'conflict' );
		expect( getPendingAbilityOperations() ).toEqual( [ { action: 'delete', id: 'e-gv-old' } ] );
	} );

	it( 'does not call the server when nothing is pending', async () => {
		// Act.
		await savePendingVariableChanges();

		// Assert.
		expect( service.saveOperations ).not.toHaveBeenCalled();
	} );

	it( 'saves pending changes when the document is saved', () => {
		// Arrange.
		syncPendingVariableChangesWithDocumentSave();
		const [ type, command, callback ] = jest.mocked( registerDataHook ).mock.calls[ 0 ];
		applyPlannedVariableChange( { action: 'delete', id: 'e-gv-old' } );

		// Act.
		const result = ( callback as unknown as () => boolean )();

		// Assert.
		expect( type ).toBe( 'dependency' );
		expect( command ).toBe( 'document/save/save' );
		expect( result ).toBe( true );
		expect( service.saveOperations ).toHaveBeenCalledTimes( 1 );
	} );
} );
