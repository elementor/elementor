import * as React from 'react';
import {
	backdropFilterPropTypeUtil,
	type FilterItemPropValue,
	filterPropTypeUtil,
	type PropTypeUtil,
} from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

import { PropProvider, useBoundProp } from '../../bound-prop-context';
import {
	Header,
	Item,
	ItemsContainer,
	TooltipAddItemAction,
	UnstableRepeater,
} from '../../components/unstable-repeater';
import { DisableItemAction } from '../../components/unstable-repeater/actions/disable-item-action';
import { DuplicateItemAction } from '../../components/unstable-repeater/actions/duplicate-item-action';
import { RemoveItemAction } from '../../components/unstable-repeater/actions/remove-item-action';
import { EditItemPopover } from '../../components/unstable-repeater/items/edit-item-popover';
import type { RepeatablePropValue } from '../../components/unstable-repeater/types';
import { createControl } from '../../create-control';
import { FilterConfigProvider, useFilterConfig } from './context/filter-config-context';
import { FilterContent } from './filter-content';
import { FilterLabel } from './filter-label';

type FilterPropName = {
	filterPropName?: 'filter' | 'backdrop-filter';
};

type Config = {
	propTypeUtil: PropTypeUtil< string, FilterItemPropValue[] >;
	label: string;
};

const FILTER_CONFIG: Record< string, Config > = {
	filter: {
		propTypeUtil: filterPropTypeUtil,
		label: __( 'Filters', 'elementor' ),
	},
	'backdrop-filter': {
		propTypeUtil: backdropFilterPropTypeUtil,
		label: __( 'Backdrop Filters', 'elementor' ),
	},
} as const;

export const FilterRepeaterControl = ( { filterPropName }: FilterPropName ) => {
	return (
		<FilterConfigProvider>
			<Repeater filterPropName={ filterPropName } />
		</FilterConfigProvider>
	);
};

const Repeater = ( { filterPropName = 'filter' }: FilterPropName ) => {
	const { propTypeUtil, label } = ensureFilterConfig( filterPropName );
	const { propType, value: filterValues, setValue } = useBoundProp( propTypeUtil );
	const { getInitialValue } = useFilterConfig();

	return (
		<PropProvider propType={ propType } value={ filterValues } setValue={ setValue }>
			<UnstableRepeater
				initial={ getInitialValue() as RepeatablePropValue }
				propTypeUtil={ propTypeUtil as PropTypeUtil< string, RepeatablePropValue[] > }
			>
				<Header label={ label }>
					<TooltipAddItemAction newItemIndex={ 0 } />
				</Header>
				<ItemsContainer itemTemplate={ <Item Label={ FilterLabel } Icon={ () => null } /> }>
					<DuplicateItemAction />
					<DisableItemAction />
					<RemoveItemAction />
				</ItemsContainer>
				<EditItemPopover>
					<FilterContent />
				</EditItemPopover>
			</UnstableRepeater>
		</PropProvider>
	);
};

function ensureFilterConfig( name: string ): Config {
	if ( name && name in FILTER_CONFIG ) {
		return FILTER_CONFIG[ name ];
	}

	return FILTER_CONFIG.filter;
}
