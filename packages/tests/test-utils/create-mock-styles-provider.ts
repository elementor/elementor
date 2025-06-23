import type { StyleDefinition } from '@elementor/editor-styles';
import {
	createStylesProvider,
	type CreateStylesProviderOptions,
	type UpdateActionPayload,
} from '@elementor/editor-styles-repository';

type CreateMockProviderArgs = Omit< Partial< CreateStylesProviderOptions >, 'subscribe' | 'actions' > & {
	actions?: Partial< CreateStylesProviderOptions[ 'actions' ] >;
};

export function createMockStylesProvider(
	{ key = 'test-provider', priority = 0, labels, limit, actions }: CreateMockProviderArgs,
	styleDefinitions: StyleDefinition[] = []
) {
	let styles = structuredClone( styleDefinitions );

	const subscribers = new Set< () => void >();

	const subscribe = ( callback: () => void ) => {
		subscribers.add( callback );

		return () => {
			subscribers.delete( callback );
		};
	};

	const notify = () => {
		for ( const subscriber of subscribers ) {
			subscriber();
		}
	};

	const deleteStyleDefinition = ( id: string ) => {
		styles = styles.filter( ( styleDef ) => styleDef.id !== id );
	};

	const updateStyleDefinition = ( payload: UpdateActionPayload ) => {
		const styleDef = styles.find( ( style ) => style.id === payload.id );

		if ( styleDef ) {
			const mergedData = {
				...styleDef,
				...payload,
			};
			const styleDefIndex = styles.findIndex( ( style ) => style.id === payload.id );
			styles[ styleDefIndex ] = mergedData;
		}
	};

	const provider = createStylesProvider( {
		key,
		priority,
		limit,
		labels,
		subscribe,
		actions: {
			all: jest.fn( () => Object.values( styles ) ),
			get: jest.fn( ( id ) => {
				return provider.actions.all().find( ( style ) => style.id === id ) || null;
			} ),
			update: jest.fn( ( payload ) => {
				updateStyleDefinition( payload );
				notify();
			} ),
			updateProps: jest.fn( ( { id, meta, props } ) => {
				const style = provider.actions.get( id );
				const variant = style?.variants.find( ( v ) => v.meta.state === meta.state );

				if ( ! variant ) {
					throw new Error( `Variant with state '${ meta.state }' not found` );
				}

				variant.props = {
					...variant.props,
					...props,
				};

				notify();
			} ),
			delete: jest.fn( ( id ) => deleteStyleDefinition( id ) ),
			...actions,
		},
	} );

	return provider;
}
