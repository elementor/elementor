import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import {
	interactionsRepository,
	type InteractionItem,
} from '@elementor/editor-interactions-repository';

import { useOnMount } from './use-on-mount';

type ProviderAndInteractionItems = {
	provider: ReturnType< typeof interactionsRepository.getProviders >[ 0 ];
	items: InteractionItem[];
};

type ProviderAndSubscriber = {
	provider: ReturnType< typeof interactionsRepository.getProviders >[ 0 ];
	subscriber: () => void;
};

type ProviderAndInteractionItemsMap = Record< string, ProviderAndInteractionItems >;

export function useInteractionsItems() {
	console.log( '[useInteractionsItems] Hook called' );
	const [ interactionItems, setInteractionItems ] = useState< ProviderAndInteractionItemsMap >( {} );

	const providerAndSubscribers = useMemo( () => {
		console.log( '[useInteractionsItems] useMemo: Getting providers' );
		try {
			const providers = interactionsRepository.getProviders();
			console.log( '[useInteractionsItems] useMemo: Got providers:', providers.length );
			const mapped = providers.map( ( provider ): ProviderAndSubscriber => {
				console.log( '[useInteractionsItems] useMemo: Mapping provider' );
				return {
					provider,
					subscriber: createProviderSubscriber( {
						provider,
						setInteractionItems,
					} ),
				};
			} );
			console.log( '[useInteractionsItems] useMemo: Mapped providers:', mapped.length );
			return mapped;
		} catch ( error ) {
			console.error( '[useInteractionsItems] useMemo: Error getting providers:', error );
			// Repository might not be ready yet
			return [];
		}
	}, [] );

	useEffect( () => {
		console.log( '[useInteractionsItems] useEffect: Setting up subscriptions, providers:', providerAndSubscribers.length );
		if ( providerAndSubscribers.length === 0 ) {
			console.log( '[useInteractionsItems] useEffect: No providers, skipping subscription' );
			return;
		}

		const unsubscribes = providerAndSubscribers.map( ( { provider, subscriber } ) => {
			console.log( '[useInteractionsItems] useEffect: Subscribing to provider' );
			// Wrap subscriber to catch any errors during subscription setup
			const safeSubscriber = () => {
				console.log( '[useInteractionsItems] safeSubscriber: Called' );
				try {
					subscriber();
				} catch ( error ) {
					console.error( '[useInteractionsItems] safeSubscriber: Error:', error );
					// Silently handle errors during subscription
				}
			};
			const unsubscribe = provider.subscribe( safeSubscriber );
			console.log( '[useInteractionsItems] useEffect: Subscribed, got unsubscribe function' );
			return unsubscribe;
		} );

		return () => {
			unsubscribes.forEach( ( unsubscribe ) => unsubscribe() );
		};
	}, [ providerAndSubscribers ] );

	useOnMount( () => {
		if ( providerAndSubscribers.length === 0 ) {
			return;
		}

		registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
			providerAndSubscribers.forEach( ( { subscriber } ) => {
				try {
					subscriber();
				} catch ( error ) {
					// Silently handle errors
				}
			} );
		} );
	} );

	return useMemo(
		() =>
			Object.values( interactionItems )
				.sort( sortByProviderPriority )
				.flatMap( ( { items } ) => items ),
		[ interactionItems ]
	);
}

function sortByProviderPriority(
	{ provider: providerA }: ProviderAndInteractionItems,
	{ provider: providerB }: ProviderAndInteractionItems
) {
	return providerA.priority - providerB.priority;
}

type CreateProviderSubscriberArgs = {
	provider: ReturnType< typeof interactionsRepository.getProviders >[ 0 ];
	setInteractionItems: Dispatch< SetStateAction< ProviderAndInteractionItemsMap > >;
};

function createProviderSubscriber( {
	provider,
	setInteractionItems,
}: CreateProviderSubscriberArgs ) {
	return () => {
		console.log( '[createProviderSubscriber] Subscriber callback called' );
		try {
			console.log( '[createProviderSubscriber] Calling provider.actions.all()' );
			const items = provider.actions.all();
			console.log( '[createProviderSubscriber] Got items:', items.length );
			
			console.log( '[createProviderSubscriber] Calling provider.getKey()' );
			const providerKey = provider.getKey();
			console.log( '[createProviderSubscriber] Got provider key:', providerKey );

			console.log( '[createProviderSubscriber] Setting interaction items' );
			setInteractionItems( ( prev ) => ( {
				...prev,
				[ providerKey ]: { provider, items },
			} ) );
			console.log( '[createProviderSubscriber] Successfully set interaction items' );
		} catch ( error ) {
			console.error( '[createProviderSubscriber] Error in subscriber:', error );
			// Provider might not be ready yet (e.g., no document loaded)
			// Silently skip update until document is available
		}
	};
}

