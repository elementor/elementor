import { renderHook } from '@testing-library/react';

import { useGridTracks } from '../use-grid-tracks';

type Style = {
	gridTemplateColumns: string;
	gridTemplateRows: string;
	columnGap: string;
	rowGap: string;
	paddingTop: string;
	paddingRight: string;
	paddingBottom: string;
	paddingLeft: string;
	'--e-a-border-color-bold': string;
};

const DEFAULT_STYLE: Style = {
	gridTemplateColumns: 'none',
	gridTemplateRows: 'none',
	columnGap: 'normal',
	rowGap: 'normal',
	paddingTop: '0px',
	paddingRight: '0px',
	paddingBottom: '0px',
	paddingLeft: '0px',
	'--e-a-border-color-bold': '',
};

function mockElement( style: Partial< Style > = {} ): HTMLElement {
	const resolved: Style = { ...DEFAULT_STYLE, ...style };
	const getComputedStyle = jest.fn().mockReturnValue( {
		gridTemplateColumns: resolved.gridTemplateColumns,
		gridTemplateRows: resolved.gridTemplateRows,
		columnGap: resolved.columnGap,
		rowGap: resolved.rowGap,
		paddingTop: resolved.paddingTop,
		paddingRight: resolved.paddingRight,
		paddingBottom: resolved.paddingBottom,
		paddingLeft: resolved.paddingLeft,
		getPropertyValue: ( name: string ) => ( name === '--e-a-border-color-bold' ? resolved[ name ] : '' ),
	} );

	return {
		ownerDocument: {
			defaultView: { getComputedStyle } as unknown as Window,
		},
	} as unknown as HTMLElement;
}

const RECT = new DOMRect( 0, 0, 320, 200 );

describe( 'useGridTracks', () => {
	it( 'returns the empty snapshot when the element is null', () => {
		const { result } = renderHook( () => useGridTracks( null, RECT ) );

		expect( result.current ).toEqual( {
			columns: [],
			rows: [],
			columnGap: 0,
			rowGap: 0,
			padding: { top: 0, right: 0, bottom: 0, left: 0 },
			borderColor: '',
		} );
	} );

	it( 'returns the empty snapshot when the element has no owner window', () => {
		const element = { ownerDocument: { defaultView: null } } as unknown as HTMLElement;

		const { result } = renderHook( () => useGridTracks( element, RECT ) );

		expect( result.current.columns ).toEqual( [] );
		expect( result.current.rows ).toEqual( [] );
	} );

	it( 'parses resolved track lists, gaps, and padding from computed style', () => {
		const element = mockElement( {
			gridTemplateColumns: '100px 100px 100px',
			gridTemplateRows: '80px 80px',
			columnGap: '10px',
			rowGap: '8px',
			paddingTop: '5px',
			paddingRight: '6px',
			paddingBottom: '7px',
			paddingLeft: '8px',
		} );

		const { result } = renderHook( () => useGridTracks( element, RECT ) );

		expect( result.current ).toEqual( {
			columns: [ 100, 100, 100 ],
			rows: [ 80, 80 ],
			columnGap: 10,
			rowGap: 8,
			padding: { top: 5, right: 6, bottom: 7, left: 8 },
			borderColor: '',
		} );
	} );

	it( 'reads the --e-a-border-color-bold CSS variable from the iframe', () => {
		const element = mockElement( {
			gridTemplateColumns: '100px',
			'--e-a-border-color-bold': '  #d5d8dc  ',
		} );

		const { result } = renderHook( () => useGridTracks( element, RECT ) );

		expect( result.current.borderColor ).toBe( '#d5d8dc' );
	} );

	it( 'reports gap as 0 when computed style returns "normal"', () => {
		const element = mockElement( {
			gridTemplateColumns: '100px 100px',
			columnGap: 'normal',
			rowGap: 'normal',
		} );

		const { result } = renderHook( () => useGridTracks( element, RECT ) );

		expect( result.current.columnGap ).toBe( 0 );
		expect( result.current.rowGap ).toBe( 0 );
	} );

	it( 'recomputes when the rect dimensions change', () => {
		const element = mockElement( { gridTemplateColumns: '100px' } );
		const getComputedStyle = element.ownerDocument?.defaultView?.getComputedStyle as jest.Mock;

		const { rerender } = renderHook( ( { rect } ) => useGridTracks( element, rect ), {
			initialProps: { rect: new DOMRect( 0, 0, 320, 200 ) },
		} );

		const callsBefore = getComputedStyle.mock.calls.length;

		rerender( { rect: new DOMRect( 0, 0, 400, 200 ) } );

		expect( getComputedStyle.mock.calls.length ).toBeGreaterThan( callsBefore );
	} );

	it( 'does not recompute when the same rect dimensions are passed again', () => {
		const element = mockElement( { gridTemplateColumns: '100px' } );
		const getComputedStyle = element.ownerDocument?.defaultView?.getComputedStyle as jest.Mock;

		const { rerender } = renderHook( ( { rect } ) => useGridTracks( element, rect ), {
			initialProps: { rect: new DOMRect( 0, 0, 320, 200 ) },
		} );

		const callsBefore = getComputedStyle.mock.calls.length;

		rerender( { rect: new DOMRect( 0, 0, 320, 200 ) } );

		expect( getComputedStyle.mock.calls.length ).toBe( callsBefore );
	} );
} );
