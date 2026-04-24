import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
	type NumberPropValue,
	type PropValue,
	type SizePropValue,
	type StringPropValue,
} from '@elementor/editor-props';
import { useSessionStorage } from '@elementor/session';
import { __ } from '@wordpress/i18n';

import { useStyle } from '../../../contexts/style-context';
import { StylesField } from '../../../controls-registry/styles-field';
import { useStylesField } from '../../../hooks/use-styles-field';
import { useStylesFields } from '../../../hooks/use-styles-fields';
import { PanelDivider } from '../../panel-divider';
import { SectionContent } from '../../section-content';
import { DimensionsField } from './dimensions-field';
import { OffsetField } from './offset-field';
import { PositionField } from './position-field';
import { ZIndexField } from './z-index-field';

type DependentValues = {
	'inset-block-start'?: SizePropValue | null;
	'inset-block-end'?: SizePropValue | null;
	'inset-inline-start'?: SizePropValue | null;
	'inset-inline-end'?: SizePropValue | null;
	'z-index'?: NumberPropValue | null;
};

const POSITION_STATIC = 'static' as const;

const POSITION_LABEL = __( 'Position', 'elementor' );
const DIMENSIONS_LABEL = __( 'Dimensions', 'elementor' );

const DEPENDENT_PROP_NAMES: Array< keyof DependentValues > = [
	'inset-block-start',
	'inset-block-end',
	'inset-inline-start',
	'inset-inline-end',
	'z-index',
];

export const PositionSection = () => {
	const { value: position, setValue: setPosition } = useStylesField< StringPropValue >(
		'position',
		withHistoryLabel( POSITION_LABEL )
	);
	const { values: dependentValues, setValues: setDependentValues } =
		useStylesFields< DependentValues >( DEPENDENT_PROP_NAMES );
	const validDependentValues = toNonNullValues( dependentValues );

	const [ savedDependentValues, saveToHistory, clearHistory ] = usePersistDimensions();
	const [ positionPlaceholder, setPositionPlaceholder ] = useState< PropValue >();

	const clearPositionDependentProps = useCallback( () => {
		if ( ! hasDependentValues( dependentValues ) ) {
			return;
		}

		saveToHistory( extractDimensions( dependentValues ) );
		setDependentValues( extractDimensions( null ), withHistoryLabel( DIMENSIONS_LABEL ) );
	}, [ dependentValues, saveToHistory, setDependentValues ] );

	useEffect( () => {
		if ( position === null ) {
			clearPositionDependentProps();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ position?.value ] );

	useEffect( () => {
		if ( ! position && positionPlaceholder && validDependentValues ) {
			setPosition( positionPlaceholder as StringPropValue );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ JSON.stringify( dependentValues ) ] );

	const onPositionChange = ( newPosition: string | null, previousPosition: string | null | undefined ) => {
		if ( newPosition === POSITION_STATIC ) {
			clearPositionDependentProps();

			return;
		}

		if ( previousPosition === POSITION_STATIC && savedDependentValues ) {
			setDependentValues( { ...savedDependentValues }, withHistoryLabel( DIMENSIONS_LABEL ) );

			clearHistory();
		}
	};

	const isPositioned = isNonStaticPosition( position ) || isNonStaticPosition( positionPlaceholder );

	return (
		<SectionContent>
			<StylesField bind="position" propDisplayName={ POSITION_LABEL }>
				<PositionField onChange={ onPositionChange } onPlaceholderChange={ setPositionPlaceholder } />
			</StylesField>

			{ isPositioned ? (
				<>
					<DimensionsField />
					<ZIndexField />
				</>
			) : null }

			<PanelDivider />
			<OffsetField />
		</SectionContent>
	);
};

const usePersistDimensions = () => {
	const { id: styleDefID, meta } = useStyle();
	const styleVariantPath = `styles/${ styleDefID }/${ meta.breakpoint || 'desktop' }/${ meta.state || 'null' }`;
	const dimensionsPath = `${ styleVariantPath }/dimensions`;

	return useSessionStorage< DependentValues >( dimensionsPath );
};

const withHistoryLabel = ( name: string ) => {
	return {
		history: { propDisplayName: name },
	};
};

const toNonNullValues = ( values: DependentValues | null ): Partial< DependentValues > | null => {
	if ( ! values ) {
		return null;
	}

	const nonNullEntries = Object.entries( values ).filter( ( [ , v ] ) => v !== null );

	if ( nonNullEntries.length === 0 ) {
		return null;
	}

	return Object.fromEntries( nonNullEntries );
};

const hasDependentValues = ( values?: DependentValues | null ) => {
	if ( ! values ) {
		return false;
	}

	const dimensions = extractDimensions( values );

	return Object.values( dimensions ).some( ( v ) => v !== null );
};

const extractDimensions = ( values: DependentValues | null ): DependentValues => {
	return DEPENDENT_PROP_NAMES.reduce( ( acc, key ) => {
		return {
			...acc,
			[ key ]: values?.[ key ] ?? null,
		};
	}, {} );
};

const isNonStaticPosition = ( value: PropValue ) => {
	if ( ! value ) {
		return false;
	}

	return value && typeof value === 'object' && 'value' in value && value?.value !== POSITION_STATIC;
};
