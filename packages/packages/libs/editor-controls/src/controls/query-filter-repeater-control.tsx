import * as React from 'react';
import { useMemo, useRef } from 'react';
import {
	type CreateOptions,
	type PropKey,
	queryFilterArrayPropTypeUtil,
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
import { SelectControl } from './select-control';

export type QueryFilterTypeOption = {
	label: string;
	queryEndpoint?: {
		url: string;
		params?: Record< string, unknown >;
	} | null;
	chipsPlaceholder?: string;
};

type QueryFilterRepeaterControlProps = {
	allowedTypes: string[];
	typeOptions: Record< string, QueryFilterTypeOption >;
	repeaterLabel?: string;
	placeholder?: string;
	addLabel?: string;
};

export const QueryFilterRepeaterControl = createControl(
	( {
		allowedTypes,
		typeOptions,
		repeaterLabel = __( 'Filter', 'elementor' ),
		placeholder,
		addLabel,
	}: QueryFilterRepeaterControlProps ) => {
		const { propType, value, setValue } = useBoundProp( queryFilterArrayPropTypeUtil );

		const initialFallback = useMemo( () => createItemForType( allowedTypes[ 0 ] ?? '' ), [ allowedTypes ] );

		return (
			<PropProvider propType={ propType } value={ value } setValue={ setValue }>
				<ControlRepeater initial={ initialFallback } propTypeUtil={ queryFilterArrayPropTypeUtil }>
					<RepeaterHeader label={ repeaterLabel }>
						<AddFilterItemAction allowedTypes={ allowedTypes } ariaLabel={ addLabel || repeaterLabel } />
					</RepeaterHeader>
					<ItemsContainer isSortable={ false }>
						<Item
							Icon={ EmptyIcon }
							actions={ <RemoveItemAction /> }
							Label={ ( { value: itemValue }: { value: QueryFilterPropValue } ) => (
								<ItemLabel value={ itemValue } typeOptions={ typeOptions } />
							) }
						/>
					</ItemsContainer>
					<EditItemPopover>
						<ItemContent
							allowedTypes={ allowedTypes }
							typeOptions={ typeOptions }
							placeholder={ placeholder }
						/>
					</EditItemPopover>
				</ControlRepeater>
			</PropProvider>
		);
	}
);

const AddFilterItemAction = ( { allowedTypes, ariaLabel }: { allowedTypes: string[]; ariaLabel: string } ) => {
	const { items, addItem } = useRepeaterContext();

	const nextAvailableType = useMemo( () => {
		const used = getUsedTypes( items );

		return allowedTypes.find( ( type ) => ! used.has( type ) ) ?? null;
	}, [ items, allowedTypes ] );

	const disabled = nextAvailableType === null;

	const onClick = ( ev: React.MouseEvent ) => {
		if ( ! nextAvailableType ) {
			return;
		}

		addItem( ev, { item: createItemForType( nextAvailableType ), index: 0 } );
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
	typeOptions: Record< string, QueryFilterTypeOption >;
};

const ItemLabel = ( { value, typeOptions }: ItemLabelProps ) => {
	const typeKey = stringPropTypeUtil.extract( value?.value?.type );
	const label = ( typeKey && typeOptions[ typeKey ]?.label ) || __( 'Item', 'elementor' );
	const chipLabels = extractChipLabels( value?.value?.value );
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
	allowedTypes,
	typeOptions,
	placeholder,
}: {
	allowedTypes: string[];
	typeOptions: Record< string, QueryFilterTypeOption >;
	placeholder?: string;
} ) => {
	const { items, openItemIndex } = useRepeaterContext();
	const propContext = useBoundProp( queryFilterPropTypeUtil );

	const valueByTypeRef = useRef< Record< string, FilterItemValue[ 'value' ] | null > >( {} );

	const handleValueChange = ( nextValue: FilterItemValue, options?: CreateOptions, meta?: { bind?: PropKey } ) => {
		if ( meta?.bind !== 'type' ) {
			propContext.setValue( nextValue, options, meta );
			return;
		}

		const previousType = stringPropTypeUtil.extract( propContext.value?.type );
		const newType = stringPropTypeUtil.extract( nextValue?.type );

		if ( previousType ) {
			valueByTypeRef.current[ previousType ] = propContext.value?.value ?? null;
		}

		const restoredValue = newType ? valueByTypeRef.current[ newType ] ?? null : null;

		propContext.setValue( { ...nextValue, value: restoredValue }, options, meta );
	};

	const usedTypes = useMemo(
		() => getUsedTypes( items.filter( ( _, index ) => index !== openItemIndex ) ),
		[ items, openItemIndex ]
	);

	const typeSelectOptions = useMemo(
		() =>
			allowedTypes.map( ( typeKey ) => ( {
				value: typeKey,
				label: typeOptions[ typeKey ]?.label ?? typeKey,
				disabled: usedTypes.has( typeKey ),
			} ) ),
		[ allowedTypes, typeOptions, usedTypes ]
	);

	const currentType = stringPropTypeUtil.extract( propContext.value?.type );
	const currentTypeConfig = currentType ? typeOptions[ currentType ] : undefined;
	const hasValueField = !! currentTypeConfig?.queryEndpoint;

	return (
		<PopoverContent p={ 1.5 }>
			<PropProvider { ...propContext } setValue={ handleValueChange }>
				<PopoverGridContainer flexWrap="wrap">
					<Grid item xs={ 12 }>
						<ControlFormLabel>{ __( 'Type', 'elementor' ) }</ControlFormLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<PropKeyProvider bind="type">
							<SelectControl options={ typeSelectOptions } />
						</PropKeyProvider>
					</Grid>
				</PopoverGridContainer>
				{ hasValueField && currentTypeConfig?.queryEndpoint && (
					<PopoverGridContainer flexWrap="wrap">
						<Grid item xs={ 12 }>
							<ControlFormLabel>{ currentTypeConfig.label }</ControlFormLabel>
						</Grid>
						<Grid item xs={ 12 }>
							<PropKeyProvider bind="value">
								<QueryChipsControl
									queryOptions={ {
										url: currentTypeConfig.queryEndpoint.url,
										params: currentTypeConfig.queryEndpoint.params ?? {},
									} }
									placeholder={ currentTypeConfig.chipsPlaceholder ?? placeholder }
								/>
							</PropKeyProvider>
						</Grid>
					</PopoverGridContainer>
				) }
			</PropProvider>
		</PopoverContent>
	);
};

function createItemForType( type: string ): QueryFilterPropValue {
	return queryFilterPropTypeUtil.create( {
		type: stringPropTypeUtil.create( type ),
		value: null,
	} );
}

function getUsedTypes< T extends { item: unknown } >( items: T[] ): Set< string > {
	const types = items
		.map( ( { item } ) => stringPropTypeUtil.extract( queryFilterPropTypeUtil.extract( item )?.type ) )
		.filter( ( type ): type is string => !! type );

	return new Set( types );
}
