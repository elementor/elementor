import * as React from 'react';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ELEMENT_STYLE_CHANGE_EVENT } from '@elementor/editor-elements';
import { useActiveBreakpoint } from '@elementor/editor-responsive';

import {
	extractGridTrackCountsFromStyles,
	useGridShowOutlinePreference,
} from '../hooks/use-grid-show-outline-preference';
import type { ElementOverlayProps } from '../types/element-overlay';

function isCssGridDisplay( display: string ): boolean {
	return display === 'grid' || display === 'inline-grid';
}

export type GridLayoutSnapshot = {
	display: string;
	columns: string;
	rows: string;
	columnGap: string;
	rowGap: string;
	gridAutoFlow: string;
	cellCount: number;
};

/** Count top-level grid tracks (handles spaces inside minmax(), etc.). */
export function countGridTracks( template: string ): number {
	const v = template.trim();

	if ( ! v || v === 'none' ) {
		return 1;
	}

	let depth = 0;
	let tracks = 0;
	let token = '';

	for ( let i = 0; i < v.length; i++ ) {
		const ch = v[ i ];

		if ( ch === '(' ) {
			depth++;
		} else if ( ch === ')' ) {
			depth--;
		}

		if ( depth === 0 && /\s/.test( ch ) ) {
			if ( token.trim() ) {
				tracks++;
				token = '';
			}
		} else {
			token += ch;
		}
	}

	if ( token.trim() ) {
		tracks++;
	}

	if ( tracks === 1 ) {
		const repeatMatch = /^\s*repeat\s*\(\s*(\d+)\s*,/i.exec( v );

		if ( repeatMatch ) {
			return Math.max( 1, parseInt( repeatMatch[ 1 ], 10 ) );
		}
	}

	return Math.max( 1, tracks );
}

export type ReadGridLayoutSnapshotOptions = {
	elementId?: string;
	breakpoint?: string | null;
	/**
	 * Atomic `e-grid` can briefly (or in edge cases) compute as non-grid before editor styles apply.
	 * Use saved grid counts from the document model so the guide still renders.
	 */
	assumeEGridHost?: boolean;
};

/**
 * `getComputedStyle` must use the window that owns the node. The editor runs in the top document while
 * the preview canvas lives in an iframe — `window.getComputedStyle(iframeNode)` is invalid and breaks grid detection.
 */
export function getComputedStyleInOwnerWindow( element: HTMLElement ): CSSStyleDeclaration {
	const view = element.ownerDocument?.defaultView;

	if ( view ) {
		return view.getComputedStyle( element );
	}

	return window.getComputedStyle( element );
}

function isAtomicEGridPreviewRoot( el: HTMLElement ): boolean {
	return el.matches( '[data-element_type="e-grid"]' ) || el.classList.contains( 'e-grid-base' );
}

export type ResolveGridOutlineHostOptions = {
	/** When true, use `data-element_type` / `e-grid-base` if computed display is not grid yet. */
	isEGrid?: boolean;
};

/**
 * DOM node that receives grid tracks (atomic `e-grid` uses the root; boxed containers may use `.e-con-inner`).
 */
export function resolveGridOutlineHost(
	root: HTMLElement,
	opts?: ResolveGridOutlineHostOptions
): HTMLElement | null {
	if ( ! root.isConnected ) {
		return null;
	}

	if ( isCssGridDisplay( getComputedStyleInOwnerWindow( root ).display ) ) {
		return root;
	}

	const inner = root.querySelector( ':scope > .e-con-inner' );

	if ( inner instanceof HTMLElement && isCssGridDisplay( getComputedStyleInOwnerWindow( inner ).display ) ) {
		return inner;
	}

	if ( opts?.isEGrid && isAtomicEGridPreviewRoot( root ) ) {
		return root;
	}

	return null;
}

export function readGridLayoutSnapshot(
	element: HTMLElement,
	options?: ReadGridLayoutSnapshotOptions
): GridLayoutSnapshot | null {
	if ( ! element.isConnected ) {
		return null;
	}

	const cs = getComputedStyleInOwnerWindow( element );

	if ( ! isCssGridDisplay( cs.display ) ) {
		if ( options?.assumeEGridHost && options.elementId != null ) {
			const fromModel = extractGridTrackCountsFromStyles( options.elementId, options.breakpoint ?? null );
			const colTracks = fromModel?.columns ?? 3;
			const rowTracks = fromModel?.rows ?? 2;
			const gapCol = cs.columnGap && cs.columnGap !== 'normal' ? cs.columnGap : '0px';
			const gapRow = cs.rowGap && cs.rowGap !== 'normal' ? cs.rowGap : '0px';

			return {
				display: 'grid',
				columns: `repeat(${ colTracks }, minmax(0, 1fr))`,
				rows: `repeat(${ rowTracks }, minmax(0, 1fr))`,
				columnGap: gapCol,
				rowGap: gapRow,
				gridAutoFlow: cs.gridAutoFlow || 'row',
				cellCount: colTracks * rowTracks,
			};
		}

		return null;
	}

	const columnsComputed = cs.gridTemplateColumns;
	const rowsComputed = cs.gridTemplateRows;

	const modelCounts =
		options?.elementId != null
			? extractGridTrackCountsFromStyles( options.elementId, options.breakpoint ?? null )
			: null;

	let colTracks: number;
	let rowTracks: number;
	let columnsCss: string;
	let rowsCss: string;

	if ( modelCounts ) {
		colTracks = modelCounts.columns;
		rowTracks = modelCounts.rows;
		columnsCss = `repeat(${ colTracks }, minmax(0, 1fr))`;
		rowsCss = `repeat(${ rowTracks }, minmax(0, 1fr))`;
	} else {
		colTracks = countGridTracks( columnsComputed );
		rowTracks = countGridTracks( rowsComputed );
		columnsCss =
			columnsComputed && columnsComputed !== 'none' ? columnsComputed : `repeat(${ colTracks }, minmax(0, 1fr))`;
		rowsCss = rowsComputed && rowsComputed !== 'none' ? rowsComputed : `repeat(${ rowTracks }, minmax(0, 1fr))`;
	}

	return {
		display: 'grid',
		columns: columnsCss,
		rows: rowsCss,
		columnGap: cs.columnGap,
		rowGap: cs.rowGap,
		gridAutoFlow: cs.gridAutoFlow,
		cellCount: colTracks * rowTracks,
	};
}

type Props = ElementOverlayProps;

function mountOutlineDom(
	host: HTMLElement,
	layout: GridLayoutSnapshot,
	elementId: string
): HTMLDivElement {
	const doc = host.ownerDocument;
	const root = doc.createElement( 'div' );

	root.classList.add( 'e-atomic-grid-outline' );
	root.setAttribute( 'data-e-grid-outline', elementId );
	root.setAttribute( 'aria-hidden', 'true' );
	Object.assign( root.style, {
		position: 'absolute',
		inset: '0',
		boxSizing: 'border-box',
		pointerEvents: 'none',
		zIndex: '2147483646',
		display: 'grid',
		gridTemplateColumns: layout.columns,
		gridTemplateRows: layout.rows,
		columnGap: layout.columnGap,
		rowGap: layout.rowGap,
		gridAutoFlow: layout.gridAutoFlow,
	} );

	for ( let i = 0; i < layout.cellCount; i++ ) {
		const cell = doc.createElement( 'div' );
		cell.classList.add( 'e-atomic-grid-outline-item' );
		Object.assign( cell.style, {
			minWidth: '0',
			minHeight: '0',
			width: '100%',
			height: '100%',
			boxSizing: 'border-box',
		} );
		root.appendChild( cell );
	}

	host.appendChild( root );

	return root;
}

/**
 * Editor-only grid cell guide (parity with v3 `.e-grid-outline` on container grid).
 * Uses nodes from the preview document (not React portals) so the overlay reliably appears in the iframe.
 */
export function GridOutlineOverlay( { element, isSelected: _isSelected, id, widgetType }: Props ): React.ReactElement | false {
	// Model `widgetType` can be missing in some editor states; the preview node still carries `data-element_type`.
	const isEGrid = widgetType === 'e-grid' || isAtomicEGridPreviewRoot( element );
	const breakpoint = useActiveBreakpoint();
	const showOutlinePref = useGridShowOutlinePreference( id );
	const [ isHovered, setIsHovered ] = useState( false );

	const isVisible = isEGrid && ( showOutlinePref || isHovered );

	const snapshotOpts = React.useMemo(
		() => ( {
			elementId: id,
			breakpoint,
			assumeEGridHost: isEGrid,
		} ),
		[ id, breakpoint, isEGrid ]
	);

	const hostOpts = React.useMemo( () => ( { isEGrid } ), [ isEGrid ] );

	useEffect( () => {
		const el = element;
		const onEnter = () => setIsHovered( true );
		const onLeave = () => setIsHovered( false );

		el.addEventListener( 'mouseenter', onEnter );
		el.addEventListener( 'mouseleave', onLeave );

		return () => {
			el.removeEventListener( 'mouseenter', onEnter );
			el.removeEventListener( 'mouseleave', onLeave );
		};
	}, [ element ] );

	const [ layout, setLayout ] = useState< GridLayoutSnapshot | null >( () => {
		const host = resolveGridOutlineHost( element, hostOpts );

		return host ? readGridLayoutSnapshot( host, snapshotOpts ) : null;
	} );

	const refreshLayout = useCallback( () => {
		const host = resolveGridOutlineHost( element, hostOpts );

		setLayout( host ? readGridLayoutSnapshot( host, snapshotOpts ) : null );
	}, [ element, hostOpts, snapshotOpts ] );

	useEffect( () => {
		refreshLayout();
	}, [ refreshLayout, isVisible ] );

	useEffect( () => {
		if ( ! isVisible ) {
			return;
		}

		const previewWin = element.ownerDocument?.defaultView;

		if ( ! previewWin ) {
			return;
		}

		const ro = new previewWin.ResizeObserver( () => refreshLayout() );
		ro.observe( element );

		const host = resolveGridOutlineHost( element, hostOpts );

		if ( host && host !== element ) {
			ro.observe( host );
		}

		const onAtomicRender = ( e: Event ) => {
			const detail = ( e as CustomEvent< { id?: string } > ).detail;
			if ( detail?.id === id ) {
				refreshLayout();
			}
		};

		window.addEventListener( 'elementor/preview/atomic-widget/render', onAtomicRender );

		const onStyleChange = ( e: Event ) => {
			const targetId = ( e as CustomEvent< { elementId?: string } > ).detail?.elementId;

			if ( targetId !== undefined && targetId !== id ) {
				return;
			}

			refreshLayout();
		};

		window.addEventListener( ELEMENT_STYLE_CHANGE_EVENT, onStyleChange );

		return () => {
			ro.disconnect();
			window.removeEventListener( 'elementor/preview/atomic-widget/render', onAtomicRender );
			window.removeEventListener( ELEMENT_STYLE_CHANGE_EVENT, onStyleChange );
		};
	}, [ element, hostOpts, id, isVisible, refreshLayout ] );

	const gridHost = resolveGridOutlineHost( element, hostOpts );
	const shouldMount = isVisible && !! layout && !! gridHost && layout.cellCount >= 1;

	useLayoutEffect( () => {
		if ( ! shouldMount || ! gridHost || ! layout ) {
			return;
		}

		const hostCs = getComputedStyleInOwnerWindow( gridHost );
		let positionRestore: string | null = null;

		if ( hostCs.position === 'static' ) {
			positionRestore = gridHost.style.position;
			gridHost.style.position = 'relative';
		}

		const root = mountOutlineDom( gridHost, layout, id );

		return () => {
			root.remove();

			if ( positionRestore !== null ) {
				gridHost.style.position = positionRestore;
			}
		};
	}, [ shouldMount, gridHost, layout, id ] );

	return false;
}
