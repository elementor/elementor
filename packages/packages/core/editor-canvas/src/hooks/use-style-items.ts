import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { type BreakpointId, getBreakpoints } from '@elementor/editor-responsive';
import { type StylesProvider, stylesRepository } from '@elementor/editor-styles-repository';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { type RendererStyleDefinition, type StyleItem, type StyleRenderer } from '../renderers/create-styles-renderer';
import { abortPreviousRuns } from '../utils/abort-previous-runs';
import { signalizedProcess } from '../utils/signalized-process';
import { useOnMount } from './use-on-mount';
import { useStylePropResolver } from './use-style-prop-resolver';
import { useStyleRenderer } from './use-style-renderer';

type ProviderAndStyleItems = { provider: StylesProvider; items: StyleItem[] };

type ProviderAndSubscriber = { provider: StylesProvider; subscriber: () => Promise< void > };

type ProviderAndStyleItemsMap = Record< string, ProviderAndStyleItems >;

export function useStyleItems() {
	const resolve = useStylePropResolver();
	const renderStyles = useStyleRenderer( resolve );

	const [ styleItems, setStyleItems ] = useState< ProviderAndStyleItemsMap >( {} );

	const providerAndSubscribers = useMemo( () => {
		return stylesRepository.getProviders().map( ( provider ): ProviderAndSubscriber => {
			return {
				provider,
				subscriber: createProviderSubscriber( {
					provider,
					renderStyles,
					setStyleItems,
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

	const breakpointsOrder = getBreakpoints().map( ( breakpoint ) => breakpoint.id );

	return useMemo(
		() =>
			Object.values( styleItems )
				.sort( ( { provider: providerA }, { provider: providerB } ) => providerA.priority - providerB.priority )
				.flatMap( ( { items } ) => items )
				.sort( ( { breakpoint: breakpointA }, { breakpoint: breakpointB } ) => {
					return (
						breakpointsOrder.indexOf( breakpointA as BreakpointId ) -
						breakpointsOrder.indexOf( breakpointB as BreakpointId )
					);
				} ),
		// eslint-disable-next-line
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ styleItems, breakpointsOrder.join( '-' ) ]
	);
}

type CreateProviderSubscriberArgs = {
	provider: StylesProvider;
	renderStyles: StyleRenderer;
	setStyleItems: Dispatch< SetStateAction< ProviderAndStyleItemsMap > >;
};

function createProviderSubscriber( { provider, renderStyles, setStyleItems }: CreateProviderSubscriberArgs ) {
	return abortPreviousRuns( ( abortController ) =>
		signalizedProcess( abortController.signal )
			.then( ( _, signal ) => {
				const styles = provider.actions.all().map( ( __, index, items ) => {
					const lastPosition = items.length - 1;

					const style = items[ lastPosition - index ];

					return {
						...style,
						cssName: provider.actions.resolveCssName( style.id ),
					};
				} );

				return renderStyles( { styles: breakToBreakpoints( styles ), signal } );
			} )
			.then( ( items ) => {
				setStyleItems( ( prev ) => ( {
					...prev,
					[ provider.getKey() ]: { provider, items },
				} ) );
			} )
			.execute()
	);

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
