import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { type InteractionItemPropValue, interactionsRepository } from '@elementor/editor-interactions';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { useOnMount } from './use-on-mount';

type ProviderAndInteractionItems = {
	provider: ReturnType< typeof interactionsRepository.getProviders >[ 0 ];
	items: InteractionItemPropValue[];
};

type ProviderAndSubscriber = {
	provider: ReturnType< typeof interactionsRepository.getProviders >[ 0 ];
	subscriber: () => void;
};

type ProviderAndInteractionItemsMap = Record< string, ProviderAndInteractionItems >;

export function useInteractionsItems() {
	const [ interactionItems, setInteractionItems ] = useState< ProviderAndInteractionItemsMap >( {} );

	const providerAndSubscribers = useMemo( () => {
		try {
			const providers = interactionsRepository.getProviders();
			const mapped = providers.map( ( provider ): ProviderAndSubscriber => {
				return {
					provider,
					subscriber: createProviderSubscriber( {
						provider,
						setInteractionItems,
					} ),
				};
			} );
			return mapped;
		} catch {
			return [];
		}
	}, [] );

	useEffect( () => {
		if ( providerAndSubscribers.length === 0 ) {
			return;
		}

		const unsubscribes = providerAndSubscribers.map( ( { provider, subscriber } ) => {
			const safeSubscriber = () => {
				try {
					subscriber();
				} catch {}
			};

			const unsubscribe = provider.subscribe( safeSubscriber );
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
				} catch {}
			} );
		} );
	} );

	return useMemo( () => {
		const result = Object.values( interactionItems )
			.sort( sortByProviderPriority )
			.flatMap( ( { items } ) => items );

		return result;
	}, [ interactionItems ] );
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

function createProviderSubscriber( { provider, setInteractionItems }: CreateProviderSubscriberArgs ) {
	return () => {
		try {
			const items = provider.actions.all();
			const providerKey = provider.getKey();

			setInteractionItems( ( prev ) => ( {
				...prev,
				[ providerKey ]: { provider, items: items as unknown as InteractionItemPropValue[] },
			} ) );
		} catch {}
	};
}
