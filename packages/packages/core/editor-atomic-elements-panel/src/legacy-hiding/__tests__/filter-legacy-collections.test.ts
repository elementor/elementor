import { filterLegacyCollections } from '../filter-legacy-collections';
import { type LegacyCollection, type LegacyCollections, type LegacyModel } from '../types';

class FakeModel implements LegacyModel {
	constructor( private readonly attributes: Record< string, unknown > ) {}

	get( key: string ) {
		return this.attributes[ key ];
	}

	toJSON() {
		return { ...this.attributes };
	}
}

class FakeCollection implements LegacyCollection {
	models: LegacyModel[];

	resetInput: unknown[] = [];

	constructor( models: LegacyModel[] = [] ) {
		this.models = models;
	}

	clone() {
		return new FakeCollection( [ ...this.models ] );
	}

	reset( models: unknown[] ) {
		this.resetInput = models;
		this.models = models.map( ( model ) =>
			model instanceof FakeModel ? model : new FakeModel( model as Record< string, unknown > )
		);

		return this;
	}
}

const element = ( attributes: Record< string, unknown > ) => new FakeModel( attributes );

const category = ( name: string, items?: LegacyModel[] ) => new FakeModel( { name, title: name, items } );

const collectionsOf = ( elements: LegacyModel[], categories: LegacyModel[] ): LegacyCollections => ( {
	elementsCollection: new FakeCollection( elements ),
	categoriesCollection: new FakeCollection( categories ),
} );

const typesOf = ( models: LegacyModel[] ) =>
	models.map( ( model ) => model.get( 'widgetType' ) || model.get( 'elType' ) );

const widgetTypes = ( collection: LegacyCollection ) => typesOf( collection.models );

const categoryNames = ( collections: LegacyCollections ) =>
	collections.categoriesCollection.models.map( ( model ) => model.get( 'name' ) );

const categoryItems = ( collections: LegacyCollections, name: string ) => {
	const found = collections.categoriesCollection.models.find( ( model ) => model.get( 'name' ) === name );

	return typesOf( ( found?.get( 'items' ) ?? [] ) as LegacyModel[] );
};

const HIDDEN = new Set( [ 'e-heading', 'e-flexbox', 'e-form' ] );

describe( 'filterLegacyCollections', () => {
	it( 'should remove hidden atoms and keep v3 widgets', () => {
		// Arrange.
		const atomHeading = element( { elType: 'widget', widgetType: 'e-heading', atomic: true } );
		const flexbox = element( { elType: 'e-flexbox', atomic: true } );
		const heading = element( { elType: 'widget', widgetType: 'heading' } );
		const container = element( { elType: 'container' } );
		const collections = collectionsOf(
			[ atomHeading, flexbox, heading, container ],
			[ category( 'v4-elements', [ atomHeading, flexbox ] ), category( 'basic', [ heading, container ] ) ]
		);

		// Act.
		const result = filterLegacyCollections( collections, HIDDEN );

		// Assert.
		expect( widgetTypes( result.elementsCollection ) ).toEqual( [ 'heading', 'container' ] );
		expect( categoryItems( result, 'basic' ) ).toEqual( [ 'heading', 'container' ] );
	} );

	it( 'should remove hidden promotion tiles', () => {
		// Arrange.
		const formPromotion = element( { name: 'e-form', widgetType: 'e-form', promotionType: 'atomic-form' } );
		const heading = element( { elType: 'widget', widgetType: 'heading' } );
		const collections = collectionsOf(
			[ formPromotion, heading ],
			[ category( 'basic', [ formPromotion, heading ] ) ]
		);

		// Act.
		const result = filterLegacyCollections( collections, HIDDEN );

		// Assert.
		expect( widgetTypes( result.elementsCollection ) ).toEqual( [ 'heading' ] );
		expect( categoryItems( result, 'basic' ) ).toEqual( [ 'heading' ] );
	} );

	it( 'should keep preset tiles built on a hidden atom', () => {
		// Arrange.
		const preset = element( { elType: 'e-flexbox', title: 'Hero', custom: { originalWidget: 'e-flexbox' } } );
		const collections = collectionsOf( [ preset ], [ category( 'v4-elements', [ preset ] ) ] );

		// Act.
		const result = filterLegacyCollections( collections, HIDDEN );

		// Assert.
		expect( result.elementsCollection.models ).toEqual( [ preset ] );
		expect( categoryItems( result, 'v4-elements' ) ).toEqual( [ 'e-flexbox' ] );
	} );

	it( 'should drop a category the filter emptied', () => {
		// Arrange.
		const atomHeading = element( { elType: 'widget', widgetType: 'e-heading' } );
		const heading = element( { elType: 'widget', widgetType: 'heading' } );
		const collections = collectionsOf(
			[ atomHeading, heading ],
			[ category( 'v4-elements', [ atomHeading ] ), category( 'basic', [ heading ] ) ]
		);

		// Act.
		const result = filterLegacyCollections( collections, HIDDEN );

		// Assert.
		expect( categoryNames( result ) ).toEqual( [ 'basic' ] );
	} );

	it( 'should always drop the atomic-form category', () => {
		// Arrange.
		const collections = collectionsOf( [], [ category( 'atomic-form' ), category( 'atomic-form-empty', [] ) ] );

		// Act.
		const result = filterLegacyCollections( collections, new Set() );

		// Assert.
		expect( categoryNames( result ) ).toEqual( [ 'atomic-form-empty' ] );
	} );

	it( 'should drop the atomic-form category when its items are empty but nothing was removed', () => {
		// Arrange.
		const heading = element( { elType: 'widget', widgetType: 'heading' } );
		const collections = collectionsOf(
			[ heading ],
			[ category( 'atomic-form', [] ), category( 'basic', [ heading ] ) ]
		);

		// Act.
		const result = filterLegacyCollections( collections, HIDDEN );

		// Assert.
		expect( categoryNames( result ) ).toEqual( [ 'basic' ] );
	} );

	it( 'should keep an already-empty non-atomic category', () => {
		// Arrange.
		const collections = collectionsOf( [], [ category( 'pro-elements' ) ] );

		// Act.
		const result = filterLegacyCollections( collections, HIDDEN );

		// Assert.
		expect( categoryNames( result ) ).toEqual( [ 'pro-elements' ] );
		expect( result.categoriesCollection.models[ 0 ].get( 'items' ) ).toBeUndefined();
	} );

	it( 'should keep a category that still has visible items', () => {
		// Arrange.
		const atomHeading = element( { elType: 'widget', widgetType: 'e-heading' } );
		const heading = element( { elType: 'widget', widgetType: 'heading' } );
		const collections = collectionsOf(
			[ atomHeading, heading ],
			[ category( 'favorites', [ atomHeading, heading ] ) ]
		);

		// Act.
		const result = filterLegacyCollections( collections, HIDDEN );

		// Assert.
		expect( categoryNames( result ) ).toEqual( [ 'favorites' ] );
		expect( categoryItems( result, 'favorites' ) ).toEqual( [ 'heading' ] );
	} );

	it( 'should not mutate the input', () => {
		// Arrange.
		const atomHeading = element( { elType: 'widget', widgetType: 'e-heading' } );
		const heading = element( { elType: 'widget', widgetType: 'heading' } );
		const basicItems = [ atomHeading, heading ];
		const v4Items = [ atomHeading ];
		const basic = category( 'basic', basicItems );
		const v4 = category( 'v4-elements', v4Items );
		const collections = collectionsOf( [ atomHeading, heading ], [ basic, v4 ] );

		// Act.
		const result = filterLegacyCollections( collections, HIDDEN );

		// Assert.
		expect( result.elementsCollection ).not.toBe( collections.elementsCollection );
		expect( result.categoriesCollection ).not.toBe( collections.categoriesCollection );
		expect( collections.elementsCollection.models ).toEqual( [ atomHeading, heading ] );
		expect( collections.categoriesCollection.models ).toEqual( [ basic, v4 ] );
		expect( basic.get( 'items' ) ).toBe( basicItems );
		expect( basicItems ).toEqual( [ atomHeading, heading ] );
		expect( v4.get( 'items' ) ).toBe( v4Items );
		expect( v4Items ).toEqual( [ atomHeading ] );
	} );

	it( 'should not throw on odd data', () => {
		// Arrange.
		const collections = collectionsOf(
			[ element( { custom: null } ), {} as LegacyModel ],
			[ new FakeModel( { name: 'odd', items: 'not-an-array' } ), {} as LegacyModel ]
		);

		// Act & Assert.
		expect( () => filterLegacyCollections( collections, HIDDEN ) ).not.toThrow();
	} );

	it( 'should pass a non-model category entry through unchanged', () => {
		// Arrange.
		const oddCategory = { name: 'odd' } as unknown as LegacyModel;
		const basic = category( 'basic', [] );
		const collections = collectionsOf( [], [ oddCategory, basic ] );

		// Act.
		const result = filterLegacyCollections( collections, HIDDEN );

		// Assert.
		const resetInput = ( result.categoriesCollection as FakeCollection ).resetInput;
		expect( resetInput ).toHaveLength( 2 );
		expect( resetInput[ 0 ] ).toBe( oddCategory );
		expect( resetInput[ 1 ] ).toEqual( basic.toJSON() );
	} );
} );
