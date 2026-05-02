import * as React from 'react';
import {
	backdropFilterPropTypeUtil,
	type FilterItemPropValue,
	filterPropTypeUtil,
	type PropTypeUtil,
} from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

import { PropProvider, useBoundProp } from '../../bound-prop-context';
import { ControlRepeater, Item, ItemsContainer, TooltipAddItemAction } from '../../components/control-repeater';
import { DisableItemAction } from '../../components/control-repeater/actions/disable-item-action';
import { DuplicateItemAction } from '../../components/control-repeater/actions/duplicate-item-action';
import { RemoveItemAction } from '../../components/control-repeater/actions/remove-item-action';
import { EditItemPopover } from '../../components/control-repeater/items/edit-item-popover';
import type { RepeatablePropValue } from '../../components/control-repeater/types';
import { RepeaterHeader } from '../../components/repeater/repeater-header';
import { createControl } from '../../create-control';
import { FilterConfigProvider, useFilterConfig } from './context/filter-config-context';
import { FilterContent } from './filter-content';
import { FilterIcon } from './filter-icon';
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
		label: __( 'Backdrop filters', 'elementor' ),
	},
} as const;

export const FilterRepeaterControl = createControl( ( { filterPropName = 'filter' }: FilterPropName ) => {
	const { propTypeUtil, label } = ensureFilterConfig( filterPropName );
	const { propType, value: filterValues, setValue } = useBoundProp( propTypeUtil );

	return (
		<FilterConfigProvider>
			<PropProvider propType={ propType } value={ filterValues } setValue={ setValue }>
				<Repeater
					propTypeUtil={ propTypeUtil as PropTypeUtil< string, RepeatablePropValue[] > }
					label={ label }
					filterPropName={ filterPropName }
				/>
			</PropProvider>
		</FilterConfigProvider>
	);
} );

type RepeaterProps = {
	propTypeUtil: PropTypeUtil< string, RepeatablePropValue[] >;
	label: string;
	filterPropName: string;
};

const Repeater = ( { propTypeUtil, label, filterPropName }: RepeaterProps ) => {
	const { getInitialValue } = useFilterConfig();

	return (
		<ControlRepeater initial={ getInitialValue() as RepeatablePropValue } propTypeUtil={ propTypeUtil }>
			<RepeaterHeader label={ label }>
				<TooltipAddItemAction
					newItemIndex={ 0 }
					ariaLabel={ filterPropName === 'backdrop-filter' ? 'backdrop filter' : 'filter' }
				/>
			</RepeaterHeader>
			<ItemsContainer>
				<Item
					Label={ FilterLabel }
					Icon={ FilterIcon }
					actions={
						<>
							<DuplicateItemAction />
							<DisableItemAction />
							<RemoveItemAction />
						</>
					}
				/>
			</ItemsContainer>
			<EditItemPopover>
				<FilterContent />
			</EditItemPopover>
		</ControlRepeater>
	);
};

function ensureFilterConfig( name: string ): Config {
	if ( name && name in FILTER_CONFIG ) {
		return FILTER_CONFIG[ name ];
	}

	return FILTER_CONFIG.filter;
}
