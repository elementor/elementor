import { __useSelector as useSelector } from '@elementor/store';

import { type ComponentId, type OverridableProps, type PublishedComponent } from '../../types';

const SLICE_NAME = 'components' as const;

type ComponentsSliceState = {
	[ SLICE_NAME ]: {
		data: PublishedComponent[];
	};
};

const DEFAULT_OVERRIDABLE_PROPS: OverridableProps = {
	props: {},
	groups: {
		items: {},
		order: [],
	},
};

export function useOverridableProps( componentId: ComponentId | null ): OverridableProps | undefined {
	return useSelector( ( state: ComponentsSliceState ) => {
		if ( ! componentId ) {
			return undefined;
		}

		const sliceState = state[ SLICE_NAME ];
		const component = sliceState?.data?.find( ( c ) => c.id === componentId );

		if ( ! component ) {
			return undefined;
		}

		return component.overridableProps ?? DEFAULT_OVERRIDABLE_PROPS;
	} );
}
