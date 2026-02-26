import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { type BreakpointId, useBreakpoints } from '@elementor/editor-responsive';
import { isClassState, type StyleDefinition, type StyleDefinitionClassState } from '@elementor/editor-styles';
import { type StylesProvider, stylesRepository } from '@elementor/editor-styles-repository';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { type RendererStyleDefinition, type StyleItem, type StyleRenderer } from '../renderers/create-styles-renderer';
import { abortPreviousRuns } from '../utils/abort-previous-runs';
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
		return stylesRepository.getProviders().map( ( provider ): ProviderAndSubscriber => {
			const providerKey = provider.getKey();

			if ( ! styleItemsCacheRef.current.has( providerKey ) ) {
				styleItemsCacheRef.current.set( providerKey, { orderedIds: [], itemsById: new Map() } );
			}

			const cache = styleItemsCacheRef.current.get( providerKey ) as StyleItemsCache;

			return {
				provider,
				subscriber: createProviderSubscriber( {
					provider,
					renderStyles,
					setStyleItems,
					cache,
				} ),
			};
		} );
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
			const promises = providerAndSubscribers.map( async ( { subscriber } ) => subscriber() );

			await Promise.all( promises );
		} );
	} );

	return useMemo(
		() =>
			Object.values( styleItems )
				.sort( sortByProviderPriority )
				.flatMap( ( { items } ) => items )
				.sort( sortByStateType )
				.sort( sortByBreakpoint( breakpoints.map( ( breakpoint ) => breakpoint.id ) ) ),
		[ styleItems, breakpoints ]
	);
}

function sortByProviderPriority(
	{ provider: providerA }: ProviderAndStyleItems,
	{ provider: providerB }: ProviderAndStyleItems
) {
	return providerA.priority - providerB.priority;
}

function sortByBreakpoint( breakpointsOrder: BreakpointId[] ) {
	return ( { breakpoint: breakpointA }: StyleItem, { breakpoint: breakpointB }: StyleItem ) =>
		breakpointsOrder.indexOf( breakpointA as BreakpointId ) -
		breakpointsOrder.indexOf( breakpointB as BreakpointId );
}

function sortByStateType( { state: stateA }: StyleItem, { state: stateB }: StyleItem ) {
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

type CreateProviderSubscriberArgs = {
	provider: StylesProvider;
	renderStyles: StyleRenderer;
	setStyleItems: Dispatch< SetStateAction< ProviderAndStyleItemsMap > >;
	cache: StyleItemsCache;
};

function createProviderSubscriber( { provider, renderStyles, setStyleItems, cache }: CreateProviderSubscriberArgs ) {
	return abortPreviousRuns( ( abortController, previous?: StylesCollection, current?: StylesCollection ) =>
		signalizedProcess( abortController.signal )
			.then( ( _, signal ) => {
				const hasDiffInfo = current !== undefined && previous !== undefined;
				const hasCache = cache.orderedIds.length > 0;

				if ( hasDiffInfo && hasCache ) {
					return updateItems( previous, current, signal );
				}

				return createItems( signal );
			} )
			.then( ( items ) => {
				setStyleItems( ( prev ) => ( {
					...prev,
					[ provider.getKey() ]: { provider, items },
				} ) );
			} )
			.execute()
	);

	async function updateItems( previous: StylesCollection, current: StylesCollection, signal: AbortSignal ) {
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

	async function createItems( signal: AbortSignal ) {
		const allStyles = provider.actions.all();

		const styles = allStyles.map( ( __, index, items ) => {
			const lastPosition = items.length - 1;
			const style = items[ lastPosition - index ];

			return {
				...style,
				cssName: provider.actions.resolveCssName( style.id ),
			};
		} );

		return renderStyles( { styles: breakToBreakpoints( styles ), signal } ).then( ( rendered ) => {
			rebuildCache( cache, allStyles, rendered );

			return rendered;
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

function updateCacheItems( cache: StyleItemsCache, rendered: StyleItem[] ): void {
	for ( const item of rendered ) {
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

function rebuildCache( cache: StyleItemsCache, allStyles: StyleDefinition[], rendered: StyleItem[] ): void {
	cache.orderedIds = allStyles.map( ( style ) => style.id ).reverse();
	cache.itemsById.clear();

	for ( const item of rendered ) {
		const existing = cache.itemsById.get( item.id ) || [];
		existing.push( item );
		cache.itemsById.set( item.id, existing );
	}
}
