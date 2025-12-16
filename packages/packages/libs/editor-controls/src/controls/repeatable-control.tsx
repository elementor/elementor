import * as React from 'react';
import { useMemo } from 'react';
import { createArrayPropUtils, type SizePropValue } from '@elementor/editor-props';
import { Box } from '@elementor/ui';

import { PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlRepeater, Item, TooltipAddItemAction } from '../components/control-repeater';
import { DisableItemAction } from '../components/control-repeater/actions/disable-item-action';
import { DuplicateItemAction } from '../components/control-repeater/actions/duplicate-item-action';
import { RemoveItemAction } from '../components/control-repeater/actions/remove-item-action';
import { type TooltipAddItemActionProps } from '../components/control-repeater/actions/tooltip-add-item-action';
import { EditItemPopover } from '../components/control-repeater/items/edit-item-popover';
import { ItemsContainer } from '../components/control-repeater/items/items-container';
import { type CollectionPropUtil, type RepeatablePropValue } from '../components/control-repeater/types';
import { PopoverContent } from '../components/popover-content';
import { PopoverGridContainer } from '../components/popover-grid-container';
import { RepeaterHeader } from '../components/repeater/repeater-header';
import { createControl } from '../create-control';
import {
	type ChildControlConfig,
	RepeatableControlContext,
	useRepeatableControlContext,
} from '../hooks/use-repeatable-control-context';
import { CUSTOM_SIZE_LABEL } from './size-control';

type RepeatableControlProps = {
	label: string;
	repeaterLabel: string;
	childControlConfig: ChildControlConfig;
	showDuplicate?: boolean;
	showToggle?: boolean;
	initialValues?: object;
	patternLabel?: string;
	placeholder?: string;
	propKey?: string;
	addItemTooltipProps?: TooltipAddItemActionProps;
};

const PLACEHOLDER_REGEX = /\$\{([^}]+)\}/g;

export const RepeatableControl = createControl(
	( {
		repeaterLabel,
		childControlConfig,
		showDuplicate,
		showToggle,
		initialValues,
		patternLabel,
		placeholder,
		propKey,
		addItemTooltipProps,
	}: RepeatableControlProps ) => {
		const { propTypeUtil: childPropTypeUtil, isItemDisabled } = childControlConfig;

		if ( ! childPropTypeUtil ) {
			return null;
		}

		const childArrayPropTypeUtil = useMemo(
			() => createArrayPropUtils( childPropTypeUtil.key, childPropTypeUtil.schema, propKey ),
			[ childPropTypeUtil.key, childPropTypeUtil.schema, propKey ]
		);

		const contextValue = useMemo(
			() => ( {
				...childControlConfig,
				placeholder: placeholder || '',
				patternLabel: patternLabel || '',
			} ),
			[ childControlConfig, placeholder, patternLabel ]
		);

		const { propType, value, setValue } = useBoundProp( childArrayPropTypeUtil );

		return (
			<PropProvider propType={ propType } value={ value } setValue={ setValue }>
				<RepeatableControlContext.Provider value={ contextValue }>
					<ControlRepeater
						initial={ childPropTypeUtil.create( initialValues || null ) }
						propTypeUtil={ childArrayPropTypeUtil as CollectionPropUtil< RepeatablePropValue > }
						isItemDisabled={ isItemDisabled }
					>
						<RepeaterHeader label={ repeaterLabel }>
							<TooltipAddItemAction
								{ ...addItemTooltipProps }
								newItemIndex={ 0 }
								ariaLabel={ repeaterLabel }
							/>
						</RepeaterHeader>
						<ItemsContainer isSortable={ false }>
							<Item
								Icon={ ItemIcon }
								Label={ ItemLabel }
								actions={
									<>
										{ showDuplicate && <DuplicateItemAction /> }
										{ showToggle && <DisableItemAction /> }
										<RemoveItemAction />
									</>
								}
							/>
						</ItemsContainer>
						<EditItemPopover>
							<Content />
						</EditItemPopover>
					</ControlRepeater>
				</RepeatableControlContext.Provider>
			</PropProvider>
		);
	}
);

// TODO: Configurable icon probably can be somehow part of the injected control and bubbled up to the repeater
const ItemIcon = () => <></>;

const Content = () => {
	const { component: ChildControl, props = {} } = useRepeatableControlContext();
	return (
		<PopoverContent p={ 1.5 }>
			<PopoverGridContainer>
				<ChildControl { ...props } />
			</PopoverGridContainer>
		</PopoverContent>
	);
};

const interpolate = ( template: string, data: Record< string, unknown > ) => {
	if ( ! data ) {
		return template;
	}

	return template.replace( PLACEHOLDER_REGEX, ( _, path ): string => {
		const value = getNestedValue( data, path );

		if ( typeof value === 'object' && value !== null && ! Array.isArray( value ) ) {
			if ( 'name' in value && value.name ) {
				return value.name as string;
			}

			return JSON.stringify( value );
		}

		if ( Array.isArray( value ) ) {
			return value.join( ', ' );
		}

		return String( value ?? '' );
	} );
};

const getNestedValue = ( obj: Record< string, unknown >, path: string ) => {
	let parentObj: Record< string, unknown > = {};
	const pathKeys = path.split( '.' );
	const key = pathKeys.slice( -1 )[ 0 ];

	let value: unknown = pathKeys.reduce( ( current: Record< string, unknown >, currentKey, currentIndex ) => {
		if ( currentIndex === pathKeys.length - 2 ) {
			parentObj = current;
		}

		if ( current && typeof current === 'object' ) {
			return current[ currentKey ] as Record< string, unknown >;
		}

		return {};
	}, obj );

	value = !! value ? value : '';
	const propType = parentObj?.$$type;
	const propValue = parentObj?.value as SizePropValue[ 'value' ];
	const doesValueRepresentCustomSize = key === 'unit' && propType === 'size' && propValue?.unit === 'custom';

	if ( ! doesValueRepresentCustomSize ) {
		return value;
	}

	return propValue?.size ? '' : CUSTOM_SIZE_LABEL;
};

const isEmptyValue = ( val: unknown ) => {
	if ( typeof val === 'string' ) {
		return val.trim() === '';
	}

	if ( Number.isNaN( val ) ) {
		return true;
	}

	if ( Array.isArray( val ) ) {
		return val.length === 0;
	}

	if ( typeof val === 'object' && val !== null ) {
		return Object.keys( val ).length === 0;
	}

	return false;
};

const shouldShowPlaceholder = ( pattern: string, data: Record< string, unknown > ): boolean => {
	const propertyPaths = getAllProperties( pattern );

	const values = propertyPaths.map( ( path ) => getNestedValue( data, path ) );

	if ( values.length === 0 ) {
		return false;
	}

	if ( values.some( ( value ) => value === null || value === undefined ) ) {
		return true;
	}

	if ( values.every( isEmptyValue ) ) {
		return true;
	}

	return false;
};

const getTextColor = ( isReadOnly: boolean, showPlaceholder: boolean ): string => {
	if ( isReadOnly ) {
		return 'text.disabled';
	}
	return showPlaceholder ? 'text.tertiary' : 'text.primary';
};

const ItemLabel = ( { value }: { value: Record< string, unknown > } ) => {
	const { placeholder, patternLabel, props: childProps } = useRepeatableControlContext();
	const showPlaceholder = shouldShowPlaceholder( patternLabel, value );
	const label = showPlaceholder ? placeholder : interpolate( patternLabel, value );
	const isReadOnly = !! childProps?.readOnly;
	const color = getTextColor( isReadOnly, showPlaceholder );

	return (
		<Box component="span" color={ color }>
			{ label }
		</Box>
	);
};

const getAllProperties = ( pattern: string ) => {
	const properties = pattern.match( PLACEHOLDER_REGEX )?.map( ( match ) => match.slice( 2, -1 ) ) || [];

	return properties;
};
