import { mockHistoryManager } from 'test-utils';

import { type WindowWithHistoryManager } from '../get-history-manager';
import { undoable } from '../undoable';

describe( 'undoable', () => {
	const historyMock = mockHistoryManager();

	beforeEach( () => {
		historyMock.beforeEach();
	} );

	afterEach( () => {
		historyMock.afterEach();
	} );

	it( 'should create an action with the ability to undo and redo', () => {
		// Arrange.
		let value: string | null = null;

		// Act.
		const action = undoable(
			{
				do: ( { suffix }: { suffix: string } ) => {
					value = `do-${ suffix }`;

					return 'do-return';
				},
				undo: ( { suffix }, doReturn ) => {
					value = `undo-${ suffix }, ${ doReturn }`;
				},
			},
			{ title: 'title' }
		);

		// Assert.
		expect( value ).toBeNull();

		// Act.
		action( { suffix: 'suffix' } );

		// Assert.
		expect( value ).toBe( 'do-suffix' );

		// Act.
		historyMock.instance.undo();

		// Assert.
		expect( value ).toBe( 'undo-suffix, do-return' );

		// Act.
		historyMock.instance.redo();

		// Assert.
		expect( value ).toBe( 'do-suffix' );
	} );

	it( 'should be able to customize redo', () => {
		// Arrange.
		let value: string | null = null;

		const action = undoable(
			{
				do: () => 'do-return',
				undo: () => {},
				redo: ( { suffix }: { suffix: string }, doReturn ) => ( value = `redo-${ suffix }-${ doReturn }` ),
			},
			{ title: 'title' }
		);

		// Act.
		action( { suffix: 'suffix' } );

		historyMock.instance.redo();

		// Assert.
		expect( value ).toBe( 'redo-suffix-do-return' );
	} );

	it( 'should be able to customize the title and subtitle', () => {
		// Act.
		const action = undoable(
			{
				do: () => 'do-return',
				undo: () => {},
			},
			{
				title: ( { suffix }: { suffix: string }, doReturn ) => `title-${ suffix }-${ doReturn }`,
				subtitle: 'subtitle',
			}
		);

		// Assert.
		expect( historyMock.instance.get() ).toBe( null );

		// Act.
		action( { suffix: 'suffix' } );

		// Assert.
		expect( historyMock.instance.get()?.title ).toBe( 'title-suffix-do-return' );
		expect( historyMock.instance.get()?.subTitle ).toBe( 'subtitle' );
	} );

	it( 'should fail if history manager is not available', () => {
		// Arrange.
		( window as unknown as WindowWithHistoryManager ).elementor = {
			documents: {},
		};

		// Act.
		const action = undoable( { do: () => {}, undo: () => {} }, { title: 'Title' } );

		// Assert.
		expect( () => action() ).toThrow( 'Cannot access History manager.' );
	} );

	it( 'should pass the last redo value to the undo function', () => {
		// Arrange.
		let value: string | null = null;

		const action = undoable(
			{
				do: () => 'do-return',
				undo: ( _, doReturn ) => ( value = `undo-${ doReturn }` ),
				redo: () => 'redo-return',
			},
			{ title: 'title' }
		);

		// Act.
		action();

		// Assert.
		expect( value ).toBe( null );

		// Act.
		historyMock.instance.undo();

		// Assert.
		expect( value ).toBe( 'undo-do-return' );

		// Act.
		historyMock.instance.redo();
		historyMock.instance.undo();

		// Assert.
		expect( value ).toBe( 'undo-redo-return' );
	} );

	it( 'should have proper types', () => {
		undoable(
			// @ts-expect-error - `do` cannot be async.
			{ do: async () => 'do-return' },
			{}
		);

		undoable(
			// @ts-expect-error - `undo` cannot be async.
			{ undo: async () => 'undo-return' },
			{}
		);

		undoable(
			// @ts-expect-error - `redo` cannot be async.
			{ redo: async () => 'redo-return' },
			{}
		);

		undoable(
			{
				do: () => 'do-return',
				undo: () => 'undo-return',

				// @ts-expect-error - `redo` must have the same return type as `do`.
				redo: () => 1,
			},
			{
				title: 'title',
			}
		);
	} );
} );
