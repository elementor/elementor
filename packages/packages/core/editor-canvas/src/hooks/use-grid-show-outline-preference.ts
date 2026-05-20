import { useEffect, useMemo, useState } from 'react';
import { ELEMENT_STYLE_CHANGE_EVENT, getElementStyles } from '@elementor/editor-elements';
import { booleanPropTypeUtil, numberPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { useActiveBreakpoint } from '@elementor/editor-responsive';

function normalizeBreakpoint( bp: string | null | undefined ): string {
	return bp ?? 'desktop';
}

function variantMatchesBreakpoint(
	variantBp: string | null | undefined,
	activeBp: string | null
): boolean {
	return normalizeBreakpoint( variantBp ) === normalizeBreakpoint( activeBp );
}

function getLocalStyleVariant( elementId: string, breakpoint: string | null ) {
	const styles = getElementStyles( elementId );

	if ( ! styles ) {
		return null;
	}

	const styleEntries = Object.values( styles );
	const localStyle = styleEntries.find( ( s ) => s.label === 'local' ) ?? styleEntries[ 0 ];

	if ( ! localStyle?.variants?.length ) {
		return null;
	}

	return (
		localStyle.variants.find(
			( v ) => variantMatchesBreakpoint( v.meta.breakpoint, breakpoint ) && v.meta.state === null
		) ??
		localStyle.variants.find(
			( v ) => variantMatchesBreakpoint( v.meta.breakpoint, 'desktop' ) && v.meta.state === null
		) ??
		localStyle.variants[ 0 ]
	);
}

export function getGridInnerFromProp( grid: unknown ): Record< string, unknown > | null {
	if ( ! grid || typeof grid !== 'object' ) {
		return null;
	}

	const asRecord = grid as Record< string, unknown >;

	if ( asRecord.$$type === 'grid' && asRecord.value && typeof asRecord.value === 'object' ) {
		return asRecord.value as Record< string, unknown >;
	}

	if ( 'columnsCount' in asRecord || 'rowsCount' in asRecord ) {
		return asRecord;
	}

	return null;
}

function readShowOutlineFromGridValue( grid: unknown ): boolean | null {
	if ( ! grid || typeof grid !== 'object' ) {
		return null;
	}

	const inner = getGridInnerFromProp( grid );

	if ( ! inner ) {
		return null;
	}

	const raw = inner.showOutline;

	if ( raw === undefined || raw === null ) {
		return null;
	}

	if ( typeof raw === 'boolean' ) {
		return raw;
	}

	if ( typeof raw === 'object' ) {
		const parsed = booleanPropTypeUtil.extract( raw as never );

		if ( parsed === null ) {
			return null;
		}

		return parsed;
	}

	return null;
}

export function hasCustomGridTracksInInner( inner: Record< string, unknown > ): boolean {
	const col = stringPropTypeUtil.extract( inner.columnsTemplate as never )?.trim() ?? '';
	const row = stringPropTypeUtil.extract( inner.rowsTemplate as never )?.trim() ?? '';

	return col.length > 0 || row.length > 0;
}

function extractCountField( inner: Record< string, unknown >, key: 'columnsCount' | 'rowsCount' ): number | null {
	const raw = inner[ key ];

	if ( raw === undefined || raw === null ) {
		return null;
	}

	if ( typeof raw === 'number' && Number.isFinite( raw ) ) {
		return Math.max( 1, Math.floor( raw ) );
	}

	if ( typeof raw === 'object' ) {
		const n = numberPropTypeUtil.extract( raw as never );

		if ( n === null || ! Number.isFinite( Number( n ) ) ) {
			return null;
		}

		return Math.max( 1, Math.floor( Number( n ) ) );
	}

	return null;
}

/**
 * Column/row counts from the saved grid style (panel), when not using custom track lists.
 */
export function extractGridTrackCountsFromStyles(
	elementId: string,
	breakpoint: string | null
): { columns: number; rows: number } | null {
	const variant = getLocalStyleVariant( elementId, breakpoint );

	if ( ! variant ) {
		return null;
	}

	const inner = getGridInnerFromProp( variant.props?.grid );

	if ( ! inner || hasCustomGridTracksInInner( inner ) ) {
		return null;
	}

	const columns = extractCountField( inner, 'columnsCount' );
	const rows = extractCountField( inner, 'rowsCount' );

	if ( columns === null && rows === null ) {
		return null;
	}

	return {
		columns: columns ?? 3,
		rows: rows ?? 2,
	};
}

export function extractGridShowOutline( elementId: string, breakpoint: string | null ): boolean {
	const variant = getLocalStyleVariant( elementId, breakpoint );

	if ( ! variant ) {
		return true;
	}

	const fromGrid = readShowOutlineFromGridValue( variant.props?.grid );

	if ( fromGrid === null ) {
		return true;
	}

	return fromGrid;
}

export function useGridShowOutlinePreference( elementId: string ): boolean {
	const breakpoint = useActiveBreakpoint();
	const [ revision, setRevision ] = useState( 0 );

	useEffect( () => {
		const onStyleChange = ( e: Event ) => {
			const targetId = ( e as CustomEvent< { elementId?: string } > ).detail?.elementId;

			if ( targetId !== undefined && targetId !== elementId ) {
				return;
			}

			setRevision( ( r ) => r + 1 );
		};

		window.addEventListener( ELEMENT_STYLE_CHANGE_EVENT, onStyleChange );

		return () => {
			window.removeEventListener( ELEMENT_STYLE_CHANGE_EVENT, onStyleChange );
		};
	}, [ elementId ] );

	return useMemo(
		() => extractGridShowOutline( elementId, breakpoint ),
		[ elementId, breakpoint, revision ]
	);
}
