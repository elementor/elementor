import { createMockStyleDefinition } from 'test-utils';
import {
	__createStore as createStore,
	__dispatch as dispatch,
	__getState as getState,
	__registerSlice as registerSlice,
} from '@elementor/store';

import {
	selectClassLabels,
	selectData,
	selectFrontendInitialData,
	selectIsDirty,
	selectPreviewInitialData,
	slice,
} from '../store';

const classLabelsFor = ( order: string[], items: Record< string, ReturnType< typeof createMockStyleDefinition > > ) =>
	Object.fromEntries( order.map( ( id ) => [ id, items[ id ]?.label ?? id ] ) );

describe( 'store', () => {
	beforeEach( () => {
		registerSlice( slice );
		createStore();
	} );

	describe( 'mergeExistingClasses', () => {
		it( 'should merge classes into data and initialData without marking as dirty', () => {
			// Arrange
			const initialClass = createMockStyleDefinition( { id: 'initial-class' } );
			const newClass = createMockStyleDefinition( { id: 'new-class' } );
			const order = [ 'initial-class', 'new-class' ];

			dispatch(
				slice.actions.load( {
					frontend: { items: { 'initial-class': initialClass }, order },
					preview: { items: { 'initial-class': initialClass }, order },
					classLabels: classLabelsFor( order, { 'initial-class': initialClass, 'new-class': newClass } ),
				} )
			);

			// Act
			dispatch(
				slice.actions.mergeExistingClasses( {
					preview: { 'new-class': newClass },
					frontend: { 'new-class': newClass },
				} )
			);

			// Assert
			const data = selectData( getState() );
			const frontendInitial = selectFrontendInitialData( getState() );
			const previewInitial = selectPreviewInitialData( getState() );
			const isDirty = selectIsDirty( getState() );

			expect( data.items ).toEqual( {
				'initial-class': initialClass,
				'new-class': newClass,
			} );
			expect( data.order ).toEqual( order );

			expect( frontendInitial.items ).toEqual( {
				'initial-class': initialClass,
				'new-class': newClass,
			} );

			expect( previewInitial.items ).toEqual( {
				'initial-class': initialClass,
				'new-class': newClass,
			} );

			expect( isDirty ).toBe( false );
		} );

		it( 'should not overwrite existing classes', () => {
			// Arrange
			const existingClass = createMockStyleDefinition( { id: 'existing', label: 'Original' } );
			const duplicateClass = createMockStyleDefinition( { id: 'existing', label: 'Duplicate' } );
			const order = [ 'existing' ];

			dispatch(
				slice.actions.load( {
					frontend: { items: { existing: existingClass }, order },
					preview: { items: { existing: existingClass }, order },
					classLabels: classLabelsFor( order, { existing: existingClass } ),
				} )
			);

			// Act
			dispatch(
				slice.actions.mergeExistingClasses( {
					preview: { existing: duplicateClass },
					frontend: { existing: duplicateClass },
				} )
			);

			// Assert
			const data = selectData( getState() );
			expect( data.items.existing.label ).toBe( 'Original' );
		} );

		it( 'should not change order array length when merging', () => {
			// Arrange
			const existingClass = createMockStyleDefinition( { id: 'existing' } );
			const order = [ 'existing' ];

			dispatch(
				slice.actions.load( {
					frontend: { items: { existing: existingClass }, order },
					preview: { items: { existing: existingClass }, order },
					classLabels: classLabelsFor( order, { existing: existingClass } ),
				} )
			);

			// Act
			dispatch(
				slice.actions.mergeExistingClasses( {
					preview: { existing: existingClass },
					frontend: { existing: existingClass },
				} )
			);

			// Assert
			const data = selectData( getState() );
			expect( data.order ).toEqual( order );
		} );

		it( 'should preserve dirty state when set before merge', () => {
			// Arrange
			const initialClass = createMockStyleDefinition( { id: 'initial' } );
			const newClass = createMockStyleDefinition( { id: 'new' } );
			const createdClass = createMockStyleDefinition( { id: 'created' } );
			const order = [ 'initial', 'new' ];

			dispatch(
				slice.actions.load( {
					frontend: { items: { initial: initialClass }, order },
					preview: { items: { initial: initialClass }, order },
					classLabels: classLabelsFor( order, {
						initial: initialClass,
						new: newClass,
					} ),
				} )
			);

			dispatch( slice.actions.add( createdClass ) );
			expect( selectIsDirty( getState() ) ).toBe( true );

			// Act
			dispatch(
				slice.actions.mergeExistingClasses( {
					preview: { new: newClass },
					frontend: { new: newClass },
				} )
			);

			// Assert - dirty state should still be true because we added a class
			expect( selectIsDirty( getState() ) ).toBe( true );
		} );
	} );

	describe( 'updateAfterTemplateImport', () => {
		it( 'should add imported classes to all data sources without resetting existing data', () => {
			// Arrange - simulate initial state with existing classes
			const existingPublishedClass = createMockStyleDefinition( {
				id: 'existing-published',
				label: 'Existing Class',
			} );
			const existingDraftClass = createMockStyleDefinition( {
				id: 'existing-draft',
				label: 'Existing Draft Class',
			} );

			dispatch(
				slice.actions.load( {
					frontend: {
						items: { 'existing-published': existingPublishedClass },
						order: [ 'existing-published' ],
					},
					preview: {
						items: { 'existing-published': existingPublishedClass, 'existing-draft': existingDraftClass },
						order: [ 'existing-draft', 'existing-published' ],
					},
					classLabels: classLabelsFor( [ 'existing-draft', 'existing-published' ], {
						'existing-draft': existingDraftClass,
						'existing-published': existingPublishedClass,
					} ),
				} )
			);

			// Imported classes from template
			const importedClass1 = createMockStyleDefinition( { id: 'g-imported-1', label: 'Imported Primary' } );
			const importedClass2 = createMockStyleDefinition( { id: 'g-imported-2', label: 'Imported Secondary' } );
			const importedItems = {
				'g-imported-1': importedClass1,
				'g-imported-2': importedClass2,
			};
			const importedOrder = [ 'g-imported-1', 'g-imported-2' ];

			// Act
			dispatch(
				slice.actions.updateAfterTemplateImport( {
					addedItems: importedItems,
					addedIdsOrder: importedOrder,
					addedClassLabels: {
						'g-imported-1': 'Imported Primary',
						'g-imported-2': 'Imported Secondary',
					},
				} )
			);

			// Assert - current data should contain both existing and imported
			const data = selectData( getState() );
			expect( data.items ).toEqual( {
				'existing-draft': existingDraftClass,
				'existing-published': existingPublishedClass,
				'g-imported-1': importedClass1,
				'g-imported-2': importedClass2,
			} );
			expect( data.order ).toEqual( [ 'existing-draft', 'existing-published', 'g-imported-1', 'g-imported-2' ] );

			// Assert - frontend initial data should be updated
			const frontendInitial = selectFrontendInitialData( getState() );
			expect( frontendInitial.items ).toEqual( {
				'existing-published': existingPublishedClass,
				'g-imported-1': importedClass1,
				'g-imported-2': importedClass2,
			} );
			expect( frontendInitial.order ).toEqual( [ 'existing-published', 'g-imported-1', 'g-imported-2' ] );

			// Assert - preview initial data should be updated
			const previewInitial = selectPreviewInitialData( getState() );
			expect( previewInitial.items ).toEqual( {
				'existing-published': existingPublishedClass,
				'existing-draft': existingDraftClass,
				'g-imported-1': importedClass1,
				'g-imported-2': importedClass2,
			} );
			expect( previewInitial.order ).toEqual( [
				'existing-draft',
				'existing-published',
				'g-imported-1',
				'g-imported-2',
			] );

			// Assert - class labels should be updated
			const classLabels = selectClassLabels( getState() );
			expect( classLabels ).toEqual( {
				'existing-draft': 'Existing Draft Class',
				'existing-published': 'Existing Class',
				'g-imported-1': 'Imported Primary',
				'g-imported-2': 'Imported Secondary',
			} );
		} );

		it( 'should preserve user changes made in the current session', () => {
			// Arrange - load initial data
			const initialClass1 = createMockStyleDefinition( { id: 'class-1', label: 'Original Label' } );
			const initialClass2 = createMockStyleDefinition( { id: 'class-2', label: 'Original Label' } );
			const order = [ 'class-1', 'class-2' ];

			dispatch(
				slice.actions.load( {
					frontend: { items: { 'class-1': initialClass1, 'class-2': initialClass2 }, order },
					preview: { items: { 'class-1': initialClass1, 'class-2': initialClass2 }, order },
					classLabels: classLabelsFor( order, { 'class-1': initialClass1, 'class-2': initialClass2 } ),
				} )
			);

			// User makes changes in the current session
			// User creates a new class
			const userCreatedClass = createMockStyleDefinition( { id: 'user-created', label: 'User Created' } );
			dispatch( slice.actions.add( userCreatedClass ) );

			// User updates an existing class
			dispatch(
				slice.actions.update( {
					style: {
						id: 'class-1',
						label: 'User Modified Label',
					},
				} )
			);

			// User deletes an existing class
			dispatch( slice.actions.delete( 'class-2' ) );

			// Verify state before import
			const stateBeforeImport = selectData( getState() );
			expect( stateBeforeImport.items[ 'class-1' ].label ).toBe( 'User Modified Label' );
			expect( stateBeforeImport.items[ 'user-created' ] ).toBeDefined();
			expect( stateBeforeImport.order ).toEqual( [ 'user-created', 'class-1' ] );
			expect( selectIsDirty( getState() ) ).toBe( true );

			// Act - import new classes from template
			const importedClass = createMockStyleDefinition( { id: 'g-imported', label: 'Imported' } );
			dispatch(
				slice.actions.updateAfterTemplateImport( {
					addedItems: { 'g-imported': importedClass },
					addedIdsOrder: [ 'g-imported' ],
					addedClassLabels: { 'g-imported': 'Imported' },
				} )
			);

			// Assert - user changes should be preserved
			const data = selectData( getState() );
			expect( data.items[ 'class-1' ].label ).toBe( 'User Modified Label' );
			expect( data.items[ 'user-created' ] ).toBeDefined();
			expect( data.items[ 'g-imported' ] ).toBeDefined();

			// Order should include all classes: existing + user created + imported
			expect( data.order ).toEqual( [ 'user-created', 'class-1', 'g-imported' ] );
		} );

		it( 'should append imported classes to the end of the order', () => {
			// Arrange
			const class1 = createMockStyleDefinition( { id: 'class-1' } );
			const class2 = createMockStyleDefinition( { id: 'class-2' } );
			const order = [ 'class-1', 'class-2' ];

			dispatch(
				slice.actions.load( {
					frontend: { items: { 'class-1': class1, 'class-2': class2 }, order },
					preview: { items: { 'class-1': class1, 'class-2': class2 }, order },
					classLabels: classLabelsFor( order, { 'class-1': class1, 'class-2': class2 } ),
				} )
			);

			// Act - import classes
			const imported1 = createMockStyleDefinition( { id: 'imported-1' } );
			const imported2 = createMockStyleDefinition( { id: 'imported-2' } );
			dispatch(
				slice.actions.updateAfterTemplateImport( {
					addedItems: { 'imported-1': imported1, 'imported-2': imported2 },
					addedIdsOrder: [ 'imported-1', 'imported-2' ],
					addedClassLabels: { 'imported-1': 'Imported 1', 'imported-2': 'Imported 2' },
				} )
			);

			// Assert - imported classes should be at the end
			const data = selectData( getState() );
			expect( data.order ).toEqual( [ 'class-1', 'class-2', 'imported-1', 'imported-2' ] );
		} );

		it( 'should not modify isDirty state', () => {
			// Arrange - clean state
			const existingClass = createMockStyleDefinition( { id: 'existing' } );
			dispatch(
				slice.actions.load( {
					frontend: { items: { existing: existingClass }, order: [ 'existing' ] },
					preview: { items: { existing: existingClass }, order: [ 'existing' ] },
					classLabels: { existing: 'Existing' },
				} )
			);

			expect( selectIsDirty( getState() ) ).toBe( false );

			// Act - import classes
			const imported = createMockStyleDefinition( { id: 'imported' } );
			dispatch(
				slice.actions.updateAfterTemplateImport( {
					addedItems: { imported },
					addedIdsOrder: [ 'imported' ],
					addedClassLabels: { imported: 'Imported' },
				} )
			);

			// Assert - isDirty should remain false (import doesn't mark as dirty)
			expect( selectIsDirty( getState() ) ).toBe( false );
		} );
	} );
} );
