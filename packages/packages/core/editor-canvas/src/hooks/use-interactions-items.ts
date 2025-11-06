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
	const [ interactionItems, setInteractionItems ] = useState< ProviderAndInteractionItemsMap >( {} );

	const providerAndSubscribers = useMemo( () => {
		return interactionsRepository.getProviders().map( ( provider ): ProviderAndSubscriber => {
			return {
				provider,
				subscriber: createProviderSubscriber( {
					provider,
					setInteractionItems,
				} ),
			};
		} );
	}, [] );

	useEffect( () => {
		const unsubscribes = providerAndSubscribers.map( ( { provider, subscriber } ) => {
			// Wrap subscriber to catch any errors during subscription setup
			const safeSubscriber = () => {
				try {
					subscriber();
				} catch ( error ) {
					// Silently handle errors during subscription
				}
			};
			return provider.subscribe( safeSubscriber );
		} );

		return () => {
			unsubscribes.forEach( ( unsubscribe ) => unsubscribe() );
		};
	}, [ providerAndSubscribers ] );

	useOnMount( () => {
		registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
			providerAndSubscribers.forEach( ( { subscriber } ) => subscriber() );
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
		try {
			const items = provider.actions.all();
			const providerKey = provider.getKey();

			setInteractionItems( ( prev ) => ( {
				...prev,
				[ providerKey ]: { provider, items },
			} ) );
		} catch ( error ) {
			// Provider might not be ready yet (e.g., no document loaded)
			// Silently skip update until document is available
		}
	};
}

