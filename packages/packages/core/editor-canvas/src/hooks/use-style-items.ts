import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { type BreakpointId, useBreakpoints } from '@elementor/editor-responsive';
import { isClassState, type StyleDefinition, type StyleDefinitionClassState } from '@elementor/editor-styles';
import { type StylesProvider, stylesRepository } from '@elementor/editor-styles-repository';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { type RendererStyleDefinition, type StyleItem, type StyleRenderer } from '../renderers/create-styles-renderer';
import { abortPreviousRuns } from '../utils/abort-previous-runs';
import { removeProviderPregeneratedLinks, resetRemovedProviders } from '../utils/pregenerated-links-removal';
import { signalizedProcess } from '../utils/signalized-process';
import { useOnMount } from './use-on-mount';
import { useStylePropResolver } from './use-style-prop-resolver';
import { useStyleRenderer } from './use-style-renderer';

type StylesCollection = Record< string, StyleDefinition >;

type StyleItemsCache = {
	orderedIds: string[];
	itemsById: Map< string, StyleItem[] >;
};

type ProviderAndStyleItems = { provider: StylesProvider; items: StyleItem[] };

type ProviderAndSubscriber = {
	provider: StylesProvider;
	subscriber: ( previous?: StylesCollection, current?: StylesCollection ) => Promise< void >;
};

type ProviderAndStyleItemsMap = Record< string, ProviderAndStyleItems >;

export function useStyleItems() {
	const resolve = useStylePropResolver();
	const renderStyles = useStyleRenderer( resolve );
	const breakpoints = useBreakpoints();

	const [ styleItems, setStyleItems ] = useState< ProviderAndStyleItemsMap >( {} );
	const styleItemsCacheRef = useRef< Map< string, StyleItemsCache > >( new Map() );

	const providerAndSubscribers = useMemo( () => {
		const createEmptyCache = () => {
			return { orderedIds: [], itemsById: new Map() };
		};

		const getCache = ( provider: StylesProvider ): StyleItemsCache => {
			const providerKey = safeGetKey( provider );

			if ( ! providerKey ) {
				return createEmptyCache();
			}

			if ( ! styleItemsCacheRef.current.has( providerKey ) ) {
				styleItemsCacheRef.current.set( providerKey, createEmptyCache() );
			}

			return styleItemsCacheRef.current.get( providerKey ) as StyleItemsCache;
		};

		return stylesRepository.getProviders().map(
			( provider ): ProviderAndSubscriber => ( {
				provider,
				subscriber: createProviderSubscriber( {
					provider,
					renderStyles,
					setStyleItems,
					getCache: () => getCache( provider ),
				} ),
			} )
		);
	}, [ renderStyles ] );

	useEffect( () => {
		const unsubscribes = providerAndSubscribers.map( ( { provider, subscriber } ) =>
			provider.subscribe( subscriber )
		);

		return () => {
			unsubscribes.forEach( ( unsubscribe ) => unsubscribe() );
		};
	}, [ providerAndSubscribers ] );

	useOnMount( () => {
		registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
			resetRemovedProviders();

			const promises = providerAndSubscribers.map( async ( { subscriber } ) => subscriber() );

			await Promise.all( promises );
		} );
	} );

	const breakpointSorter = useMemo(
		() => createBreakpointSorter( breakpoints.map( ( breakpoint ) => breakpoint.id ) ),
		[ breakpoints ]
	);

	return useMemo(
		() =>
			Object.values( styleItems )
				.sort( prioritySorter )
				.flatMap( ( { items } ) => items )
				.sort( stateSorter )
				.sort( breakpointSorter ),
		[ styleItems, breakpointSorter ]
	);
}

function prioritySorter(
	{ provider: providerA }: ProviderAndStyleItems,
	{ provider: providerB }: ProviderAndStyleItems
) {
	return providerA.priority - providerB.priority;
}

function stateSorter( { state: stateA }: StyleItem, { state: stateB }: StyleItem ) {
	if (
		isClassState( stateA as StyleDefinitionClassState ) &&
		! isClassState( stateB as StyleDefinitionClassState )
	) {
		return -1;
	}

	if (
		! isClassState( stateA as StyleDefinitionClassState ) &&
		isClassState( stateB as StyleDefinitionClassState )
	) {
		return 1;
	}

	return 0;
}

function createBreakpointSorter( breakpointsOrder: BreakpointId[] ) {
	return ( { breakpoint: breakpointA }: StyleItem, { breakpoint: breakpointB }: StyleItem ) =>
		breakpointsOrder.indexOf( breakpointA as BreakpointId ) -
		breakpointsOrder.indexOf( breakpointB as BreakpointId );
}

function safeGetKey( provider: StylesProvider ): string | null {
	try {
		return provider.getKey();
	} catch {
		return null;
	}
}

type CreateProviderSubscriberArgs = {
	provider: StylesProvider;
	renderStyles: StyleRenderer;
	setStyleItems: Dispatch< SetStateAction< ProviderAndStyleItemsMap > >;
	getCache: () => StyleItemsCache;
};

function createProviderSubscriber( { provider, renderStyles, setStyleItems, getCache }: CreateProviderSubscriberArgs ) {
	return abortPreviousRuns( ( abortController, previous?: StylesCollection, current?: StylesCollection ) =>
		signalizedProcess( abortController.signal )
			.then( ( _, signal ) => {
				const cache = getCache();
				const hasDiffInfo = current !== undefined && previous !== undefined;
				const hasCache = cache.orderedIds.length > 0;

				if ( hasCache && provider.isPregeneratedLink ) {
					// if styles were rendered already (i.e. hasCache = true), we can safely remove the pregenerated css rules imported via <link /> tags
					removeProviderPregeneratedLinks( provider.getKey(), provider.isPregeneratedLink );
				}

				if ( hasDiffInfo && hasCache ) {
					return updateItems( cache, previous, current, signal );
				}

				return createItems( cache, signal );
			} )
			.then( ( items ) => {
				setStyleItems( ( prev ) => ( {
					...prev,
					[ provider.getKey() ]: { provider, items },
				} ) );
			} )
			.execute()
	);

	async function updateItems(
		cache: StyleItemsCache,
		previous: StylesCollection,
		current: StylesCollection,
		signal: AbortSignal
	) {
		const changedIds = getChangedStyleIds( previous, current );

		cache.orderedIds = provider.actions
			.all()
			.map( ( style ) => style.id )
			.reverse();

		if ( changedIds.length > 0 ) {
			const changedStyles = changedIds
				.map( ( id ) => provider.actions.get( id ) )
				.filter( ( style ): style is StyleDefinition => !! style )
				.map( ( style ) => ( {
					...style,
					cssName: provider.actions.resolveCssName( style.id ),
				} ) );

			return renderStyles( { styles: breakToBreakpoints( changedStyles ), signal } ).then( ( rendered ) => {
				updateCacheItems( cache, rendered );

				return getOrderedItems( cache );
			} );
		}

		return getOrderedItems( cache );
	}

	async function createItems( cache: StyleItemsCache, signal: AbortSignal ) {
		const allStyles = provider.actions.all();

		const styles = [ ...allStyles ].reverse().map( ( style ) => {
			return {
				...style,
				cssName: provider.actions.resolveCssName( style.id ),
			};
		} );

		return renderStyles( { styles: breakToBreakpoints( styles ), signal } ).then( ( rendered ) => {
			rebuildCache( cache, allStyles, rendered );

			return getOrderedItems( cache );
		} );
	}

	function breakToBreakpoints( styles: RendererStyleDefinition[] ) {
		return Object.values(
			styles.reduce(
				( acc, style ) => {
					style.variants.forEach( ( variant ) => {
						const breakpoint = variant.meta.breakpoint || 'desktop';

						if ( ! acc[ style.id ] ) {
							acc[ style.id ] = {};
						}

						if ( ! acc[ style.id ][ breakpoint ] ) {
							acc[ style.id ][ breakpoint ] = {
								...style,
								variants: [],
							};
						}

						acc[ style.id ][ breakpoint ].variants.push( variant );
					} );
					return acc;
				},
				{} as Record< string, Record< string, RendererStyleDefinition > >
			)
		).flatMap( ( breakpointMap ) => Object.values( breakpointMap ) );
	}
}

function getChangedStyleIds( previous: StylesCollection, current: StylesCollection ): string[] {
	const changedIds: string[] = [];

	for ( const id of Object.keys( current ) ) {
		const currentStyle = current[ id ];
		const previousStyle = previous[ id ];

		if ( ! previousStyle || currentStyle !== previousStyle ) {
			changedIds.push( id );
		}
	}

	return changedIds;
}

function getOrderedItems( cache: StyleItemsCache ): StyleItem[] {
	return cache.orderedIds
		.map( ( id ) => cache.itemsById.get( id ) )
		.filter( ( items ): items is StyleItem[] => items !== undefined )
		.flat();
}

function updateCacheItems( cache: StyleItemsCache, changedItems: StyleItem[] ): void {
	for ( const item of changedItems ) {
		const existing = cache.itemsById.get( item.id );
		if ( existing ) {
			const idx = existing.findIndex( ( e ) => e.breakpoint === item.breakpoint && e.state === item.state );
			if ( idx >= 0 ) {
				existing[ idx ] = item;
			} else {
				existing.push( item );
			}
		} else {
			cache.itemsById.set( item.id, [ item ] );
		}
	}
}

function rebuildCache( cache: StyleItemsCache, allStyles: StyleDefinition[], items: StyleItem[] ): void {
	cache.orderedIds = allStyles.map( ( style ) => style.id ).reverse();
	cache.itemsById.clear();

	for ( const item of items ) {
		const existing = cache.itemsById.get( item.id ) || [];
		existing.push( item );
		cache.itemsById.set( item.id, existing );
	}
}
