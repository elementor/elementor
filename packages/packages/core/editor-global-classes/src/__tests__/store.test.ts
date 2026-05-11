import { createMockStyleDefinition } from 'test-utils';
import {
	__createStore as createStore,
	__dispatch as dispatch,
	__getState as getState,
	__registerSlice as registerSlice,
} from '@elementor/store';

import { selectData, selectFrontendInitialData, selectIsDirty, selectPreviewInitialData, slice } from '../store';

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

		it( 'should not change order when merge does not introduce new item ids', () => {
			const existingClass = createMockStyleDefinition( { id: 'existing' } );
			const order = [ 'existing' ];

			dispatch(
				slice.actions.load( {
					frontend: { items: { existing: existingClass }, order },
					preview: { items: { existing: existingClass }, order },
					classLabels: classLabelsFor( order, { existing: existingClass } ),
				} )
			);

			dispatch(
				slice.actions.mergeExistingClasses( {
					preview: { existing: existingClass },
					frontend: { existing: existingClass },
				} )
			);

			const data = selectData( getState() );
			expect( data.order ).toEqual( order );
		} );

		it( 'should append item ids missing from order on load', () => {
			const classA = createMockStyleDefinition( { id: 'a' } );
			const classB = createMockStyleDefinition( { id: 'b' } );

			dispatch(
				slice.actions.load( {
					frontend: { items: { a: classA, b: classB }, order: [ 'a' ] },
					preview: { items: { a: classA, b: classB }, order: [ 'a' ] },
					classLabels: classLabelsFor( [ 'a', 'b' ], { a: classA, b: classB } ),
				} )
			);

			expect( selectPreviewInitialData( getState() ).order ).toEqual( [ 'a', 'b' ] );
			expect( selectFrontendInitialData( getState() ).order ).toEqual( [ 'a', 'b' ] );
		} );

		it( 'should append merged class ids to orders when those ids were missing from order', () => {
			const initialClass = createMockStyleDefinition( { id: 'initial' } );
			const mergedClass = createMockStyleDefinition( { id: 'merged' } );

			dispatch(
				slice.actions.load( {
					frontend: { items: { initial: initialClass }, order: [ 'initial' ] },
					preview: { items: { initial: initialClass }, order: [ 'initial' ] },
					classLabels: classLabelsFor( [ 'initial', 'merged' ], {
						initial: initialClass,
						merged: mergedClass,
					} ),
				} )
			);

			dispatch(
				slice.actions.mergeExistingClasses( {
					preview: { merged: mergedClass },
					frontend: { merged: mergedClass },
				} )
			);

			const expectedOrder = [ 'initial', 'merged' ];

			expect( selectData( getState() ).order ).toEqual( expectedOrder );
			expect( selectFrontendInitialData( getState() ).order ).toEqual( expectedOrder );
			expect( selectPreviewInitialData( getState() ).order ).toEqual( expectedOrder );
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
} );
