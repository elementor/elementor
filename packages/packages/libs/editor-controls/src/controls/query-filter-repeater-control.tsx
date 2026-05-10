import * as React from 'react';
import { useMemo, useRef } from 'react';
import {
	type CreateOptions,
	type PropKey,
	queryFilterArrayPropTypeUtil,
	type QueryFilterKeyConfig,
	queryFilterPropTypeUtil,
	type QueryFilterPropValue,
	type QueryPropValue,
	stringPropTypeUtil,
} from '@elementor/editor-props';
import { PlusIcon } from '@elementor/icons';
import { Box, Grid, IconButton } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { ControlRepeater, Item, ItemsContainer } from '../components/control-repeater';
import { RemoveItemAction } from '../components/control-repeater/actions/remove-item-action';
import { useRepeaterContext } from '../components/control-repeater/context/repeater-context';
import { EditItemPopover } from '../components/control-repeater/items/edit-item-popover';
import { PopoverContent } from '../components/popover-content';
import { PopoverGridContainer } from '../components/popover-grid-container';
import { RepeaterHeader } from '../components/repeater/repeater-header';
import { createControl } from '../create-control';
import { QueryChipsControl } from './query-chips-control';
import { SelectControl, type SelectOption } from './select-control';

type QueryFilterRepeaterControlProps = {
	allowedKeys: string[];
	keyConfig: Record< string, QueryFilterKeyConfig >;
	label?: string;
	chipsPlaceholder?: string;
};

export const QueryFilterRepeaterControl = createControl(
	( {
		allowedKeys,
		keyConfig,
		label = __( 'Filter', 'elementor' ),
		chipsPlaceholder,
	}: QueryFilterRepeaterControlProps ) => {
		const { propType, value, setValue } = useBoundProp( queryFilterArrayPropTypeUtil );

		const usedKeys = useMemo( () => getUsedKeys( value ?? [] ), [ value ] );
		const nextAvailableKey = useMemo(
			() => allowedKeys.find( ( key ) => ! usedKeys.has( key ) ) ?? null,
			[ allowedKeys, usedKeys ]
		);

		const getKeySelectOptions = useMemo(
			() => ( currentKey: string | null ) =>
				allowedKeys.map( ( itemKey ) => ( {
					value: itemKey,
					label: keyConfig[ itemKey ]?.label ?? itemKey,
					disabled: itemKey !== currentKey && usedKeys.has( itemKey ),
				} ) ),
			[ allowedKeys, keyConfig, usedKeys ]
		);

		const initialFallback = useMemo( () => createItemForKey( allowedKeys[ 0 ] ?? '' ), [ allowedKeys ] );

		return (
			<PropProvider propType={ propType } value={ value } setValue={ setValue }>
				<ControlRepeater initial={ initialFallback } propTypeUtil={ queryFilterArrayPropTypeUtil }>
					<RepeaterHeader label={ label }>
						<AddFilterItemAction nextAvailableKey={ nextAvailableKey } ariaLabel={ label } />
					</RepeaterHeader>
					<ItemsContainer isSortable={ false }>
						<Item
							Icon={ EmptyIcon }
							actions={ <RemoveItemAction /> }
							Label={ ( { value: itemValue }: { value: QueryFilterPropValue } ) => (
								<ItemLabel value={ itemValue } keyConfig={ keyConfig } />
							) }
						/>
					</ItemsContainer>
					<EditItemPopover>
						<ItemContent
							keyConfig={ keyConfig }
							getKeySelectOptions={ getKeySelectOptions }
							chipsPlaceholder={ chipsPlaceholder }
						/>
					</EditItemPopover>
				</ControlRepeater>
			</PropProvider>
		);
	}
);

const AddFilterItemAction = ( {
	nextAvailableKey,
	ariaLabel,
}: {
	nextAvailableKey: string | null;
	ariaLabel: string;
} ) => {
	const { addItem } = useRepeaterContext();
	const disabled = nextAvailableKey === null;

	const onClick = ( ev: React.MouseEvent ) => {
		if ( ! nextAvailableKey ) {
			return;
		}

		addItem( ev, { item: createItemForKey( nextAvailableKey ), index: 0 } );
	};

	return (
		<Box component="span" sx={ { cursor: disabled ? 'not-allowed' : 'pointer' } }>
			<IconButton
				size="tiny"
				disabled={ disabled }
				onClick={ onClick }
				/* Translators: %s: Aria label. */
				aria-label={ sprintf( __( 'Add %s item', 'elementor' ), ariaLabel.toLowerCase() ) }
			>
				<PlusIcon fontSize="tiny" />
			</IconButton>
		</Box>
	);
};

const EmptyIcon = () => null;

type ItemLabelProps = {
	value: QueryFilterPropValue;
	keyConfig: Record< string, QueryFilterKeyConfig >;
};

const ItemLabel = ( { value, keyConfig }: ItemLabelProps ) => {
	const itemKey = stringPropTypeUtil.extract( value?.value?.key );
	const label = ( itemKey && keyConfig[ itemKey ]?.label ) || __( 'Item', 'elementor' );
	const chipLabels = extractChipLabels( value?.value?.values );
	const suffix = chipLabels.length > 0 ? `: ${ chipLabels.join( ', ' ) }` : '';

	return (
		<Box component="span">
			{ label }
			{ suffix }
		</Box>
	);
};

type QueryArrayPropValue = { value?: QueryPropValue[] | null };

function extractChipLabels< T extends QueryArrayPropValue | undefined >( chipsProp: T ): string[] {
	const chips = chipsProp?.value ?? [];

	return chips
		.map( ( chip ) => stringPropTypeUtil.extract( chip?.value?.label ) )
		.filter( ( label ): label is string => !! label );
}

type FilterItemValue = NonNullable< QueryFilterPropValue[ 'value' ] >;

const ItemContent = ( {
	keyConfig,
	getKeySelectOptions,
	chipsPlaceholder,
}: {
	keyConfig: Record< string, QueryFilterKeyConfig >;
	getKeySelectOptions: ( currentKey: string | null ) => SelectOption[];
	chipsPlaceholder?: string;
} ) => {
	const propContext = useBoundProp( queryFilterPropTypeUtil );

	const valuesByKeyRef = useRef< Record< string, FilterItemValue[ 'values' ] | null > >( {} );

	const handleValueChange = ( nextValue: FilterItemValue, options?: CreateOptions, meta?: { bind?: PropKey } ) => {
		if ( meta?.bind !== 'key' ) {
			propContext.setValue( nextValue, options, meta );
			return;
		}

		const previousKey = stringPropTypeUtil.extract( propContext.value?.key );
		const newKey = stringPropTypeUtil.extract( nextValue?.key );

		if ( previousKey ) {
			valuesByKeyRef.current[ previousKey ] = propContext.value?.values ?? null;
		}

		const restoredValues = newKey ? valuesByKeyRef.current[ newKey ] ?? null : null;

		propContext.setValue( { ...nextValue, values: restoredValues }, options, meta );
	};

	const currentKey = stringPropTypeUtil.extract( propContext.value?.key );
	const currentKeyConfig = currentKey ? keyConfig[ currentKey ] : undefined;
	const hasValuesField = !! currentKeyConfig?.queryEndpoint;
	const keySelectOptions = useMemo( () => getKeySelectOptions( currentKey ), [ getKeySelectOptions, currentKey ] );

	return (
		<PopoverContent p={ 1.5 }>
			<PropProvider { ...propContext } setValue={ handleValueChange }>
				<PopoverGridContainer flexWrap="wrap">
					<Grid item xs={ 12 }>
						<ControlFormLabel>{ __( 'Type', 'elementor' ) }</ControlFormLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<PropKeyProvider bind="key">
							<SelectControl options={ keySelectOptions } />
						</PropKeyProvider>
					</Grid>
				</PopoverGridContainer>
				{ hasValuesField && currentKeyConfig?.queryEndpoint && (
					<PopoverGridContainer flexWrap="wrap">
						<Grid item xs={ 12 }>
							<ControlFormLabel>{ currentKeyConfig.label }</ControlFormLabel>
						</Grid>
						<Grid item xs={ 12 }>
							<PropKeyProvider bind="values">
								<QueryChipsControl
									queryOptions={ {
										url: currentKeyConfig.queryEndpoint.url,
										params: currentKeyConfig.queryEndpoint.params ?? {},
									} }
									placeholder={ currentKeyConfig.chipsPlaceholder ?? chipsPlaceholder }
								/>
							</PropKeyProvider>
						</Grid>
					</PopoverGridContainer>
				) }
			</PropProvider>
		</PopoverContent>
	);
};

function createItemForKey( key: string ): QueryFilterPropValue {
	return queryFilterPropTypeUtil.create( {
		key: stringPropTypeUtil.create( key ),
		values: null,
	} );
}

function getUsedKeys( items: QueryFilterPropValue[] ): Set< string > {
	const keys = items
		.map( ( item ) => stringPropTypeUtil.extract( item?.value?.key ) )
		.filter( ( key ): key is string => !! key );

	return new Set( keys );
}
