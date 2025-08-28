import {
	buildOperationsArray,
	createBatchPayload,
} from '../batch-operations';
import { type TVariablesList } from '../storage';

describe( 'batch-operations', () => {
	const createMockVariables = (): TVariablesList => ( {
		'e-gv-1': {
			type: 'color',
			label: 'Primary',
			value: '#FF0000',
		},
		'e-gv-2': {
			type: 'color',
			label: 'Secondary',
			value: '#00FF00',
		},
		'e-gv-3': {
			type: 'color',
			label: 'Deleted Color',
			value: '#0000FF',
			deleted: true,
		},
	} );

	describe( 'buildOperationsArray', () => {
		let originalVariables: TVariablesList;

		beforeEach( () => {
			originalVariables = createMockVariables();
		} );

		it( 'should detect all CRUD operations correctly', () => {
			// Arrange.
			const currentVariables: TVariablesList = {
				'e-gv-1': {
					...originalVariables[ 'e-gv-1' ],
					label: 'Updated Primary',
					value: '#FF00FF',
				},
				'e-gv-2': {
					...originalVariables[ 'e-gv-2' ],
					deleted: true,
				},
				'e-gv-3': {
					type: 'color',
					label: 'Restored Color',
					value: '#0000FF',
				},
				'tmp-123': {
					type: 'color',
					label: 'New Color',
					value: '#FFFF00',
				},
			};

			// Act.
			const operations = buildOperationsArray( originalVariables, currentVariables );

			// Assert.
			const createOps = operations.filter( ( op ) => op.type === 'create' );
			const updateOps = operations.filter( ( op ) => op.type === 'update' );
			const deleteOps = operations.filter( ( op ) => op.type === 'delete' );
			const restoreOps = operations.filter( ( op ) => op.type === 'restore' );

			expect( createOps ).toHaveLength( 1 );
			expect( createOps[ 0 ] ).toEqual( {
				type: 'create',
				variable: {
					id: 'tmp-123',
					type: 'color',
					label: 'New Color',
					value: '#FFFF00',
				},
			} );

			expect( updateOps ).toHaveLength( 1 );
			expect( updateOps[ 0 ] ).toEqual( {
				type: 'update',
				id: 'e-gv-1',
				variable: {
					label: 'Updated Primary',
					value: '#FF00FF',
				},
			} );

			expect( deleteOps ).toHaveLength( 1 );
			expect( deleteOps[ 0 ] ).toEqual( {
				type: 'delete',
				id: 'e-gv-2',
			} );

			expect( restoreOps ).toHaveLength( 1 );
			expect( restoreOps[ 0 ] ).toEqual( {
				type: 'restore',
				id: 'e-gv-3',
				label: 'Restored Color',
			} );
		} );

		it( 'should not send delete operations for new temporary variables', () => {
			// Arrange.
			const currentVariables: TVariablesList = {
				...originalVariables,
				'tmp-123': {
					type: 'color',
					label: 'Temp Color',
					value: '#FFFF00',
					deleted: true,
				},
			};

			// Act.
			const operations = buildOperationsArray( originalVariables, currentVariables );
			const deleteOps = operations.filter( ( op ) => op.type === 'delete' );

			// Assert.
			expect( deleteOps ).toHaveLength( 0 );
		} );
	} );

	describe( 'API utilities', () => {
		it( 'should create batch payload with watermark and operations', () => {
			// Arrange.
			const operations = [
				{
					type: 'create' as const,
					variable: {
						id: 'tmp-123',
						type: 'color',
						label: 'Test',
						value: '#FF0000',
					},
				},
			];

			// Act.
			const payload = createBatchPayload( operations, 9989 );

			// Assert.
			expect( payload ).toEqual( {
				watermark: 9989,
				operations,
			} );
		} );
	} );
} );
