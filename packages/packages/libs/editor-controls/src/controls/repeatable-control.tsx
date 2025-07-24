import * as React from 'react';
import { useMemo } from 'react';
import { createArrayPropUtils, type PropKey } from '@elementor/editor-props';
import { Box } from '@elementor/ui';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { PopoverContent } from '../components/popover-content';
import { PopoverGridContainer } from '../components/popover-grid-container';
import { Repeater } from '../components/repeater';
import { createControl } from '../create-control';
import {
	type ChildControlConfig,
	RepeatableControlContext,
	useRepeatableControlContext,
} from '../hooks/use-repeatable-control-context';

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
	}: RepeatableControlProps ) => {
		const { propTypeUtil: childPropTypeUtil } = childControlConfig;

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
					<Repeater
						openOnAdd
						values={ value ?? [] }
						setValues={ setValue }
						label={ repeaterLabel }
						isSortable={ false }
						itemSettings={ {
							Icon: ItemIcon,
							Label: ItemLabel,
							Content: ItemContent,
							initialValues: childPropTypeUtil.create( initialValues || null ),
						} }
						showDuplicate={ showDuplicate }
						showToggle={ showToggle }
					/>
				</RepeatableControlContext.Provider>
			</PropProvider>
		);
	}
);

const ItemContent = ( { bind }: { bind: PropKey } ) => {
	return (
		<PropKeyProvider bind={ bind }>
			<Content />
		</PropKeyProvider>
	);
};

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
			if ( value.name ) {
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
	return path.split( '.' ).reduce( ( current: Record< string, unknown >, key ) => {
		if ( current && typeof current === 'object' ) {
			return current[ key ] as Record< string, unknown >;
		}
		return {};
	}, obj );
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

const ItemLabel = ( { value }: { value: Record< string, unknown > } ) => {
	const { placeholder, patternLabel } = useRepeatableControlContext();

	const label = shouldShowPlaceholder( patternLabel, value ) ? placeholder : interpolate( patternLabel, value );

	return (
		<Box component="span" color="text.tertiary">
			{ label }
		</Box>
	);
};

const getAllProperties = ( pattern: string ) => {
	const properties = pattern.match( PLACEHOLDER_REGEX )?.map( ( match ) => match.slice( 2, -1 ) ) || [];

	return properties;
};
