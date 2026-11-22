import { getNavigationTarget } from '../get-navigation-target';

const COLUMNS = 3;

const item = ( navItem: string, groupId: string ) => {
	const element = document.createElement( 'button' );

	element.dataset.navItem = navItem;
	element.dataset.groupId = groupId;

	return element;
};

const buildItems = () => {
	const header = item( 'header', 'a' );
	const tiles = [ 1, 2, 3, 4 ].map( () => item( 'tile', 'a' ) );
	const nextHeader = item( 'header', 'b' );

	return { header, tiles, nextHeader, items: [ header, ...tiles, nextHeader ] };
};

describe( 'getNavigationTarget', () => {
	it( 'should move between items horizontally and mirror the direction in RTL', () => {
		// Arrange.
		const { items, tiles } = buildItems();

		// Act.
		const ltr = getNavigationTarget( {
			items,
			current: tiles[ 0 ],
			key: 'ArrowRight',
			columns: COLUMNS,
			isRtl: false,
		} );
		const rtl = getNavigationTarget( {
			items,
			current: tiles[ 1 ],
			key: 'ArrowRight',
			columns: COLUMNS,
			isRtl: true,
		} );

		// Assert.
		expect( ltr ).toBe( tiles[ 1 ] );
		expect( rtl ).toBe( tiles[ 0 ] );
	} );

	it( 'should move a row down and up within a group, and from the first row up to the header', () => {
		// Arrange.
		const { items, header, tiles } = buildItems();

		// Act.
		const down = getNavigationTarget( {
			items,
			current: tiles[ 0 ],
			key: 'ArrowDown',
			columns: COLUMNS,
			isRtl: false,
		} );
		const up = getNavigationTarget( {
			items,
			current: tiles[ 3 ],
			key: 'ArrowUp',
			columns: COLUMNS,
			isRtl: false,
		} );
		const toHeader = getNavigationTarget( {
			items,
			current: tiles[ 1 ],
			key: 'ArrowUp',
			columns: COLUMNS,
			isRtl: false,
		} );

		// Assert.
		expect( down ).toBe( tiles[ 3 ] );
		expect( up ).toBe( tiles[ 0 ] );
		expect( toHeader ).toBe( header );
	} );

	it( 'should move from the header to its first tile and from the last row to the next header', () => {
		// Arrange.
		const { items, header, tiles, nextHeader } = buildItems();

		// Act.
		const fromHeader = getNavigationTarget( {
			items,
			current: header,
			key: 'ArrowDown',
			columns: COLUMNS,
			isRtl: false,
		} );
		const fromLastRow = getNavigationTarget( {
			items,
			current: tiles[ 3 ],
			key: 'ArrowDown',
			columns: COLUMNS,
			isRtl: false,
		} );

		// Assert.
		expect( fromHeader ).toBe( tiles[ 0 ] );
		expect( fromLastRow ).toBe( nextHeader );
	} );

	it( 'should land on the last tile when moving down into a partially filled last row', () => {
		// Arrange.
		const { items, tiles } = buildItems();

		// Act.
		const target = getNavigationTarget( {
			items,
			current: tiles[ 2 ],
			key: 'ArrowDown',
			columns: COLUMNS,
			isRtl: false,
		} );

		// Assert.
		expect( target ).toBe( tiles[ 3 ] );
	} );
} );
