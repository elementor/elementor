import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { type StringPropValue } from '@elementor/editor-props';
import { useSessionStorage } from '@elementor/session';
import { __ } from '@wordpress/i18n';

import { useStyle } from '../../../contexts/style-context';
import { useStylesField } from '../../../hooks/use-styles-field';
import { useStylesFields } from '../../../hooks/use-styles-fields';
import { PanelDivider } from '../../panel-divider';
import { SectionContent } from '../../section-content';
import { DimensionsField } from './dimensions-field';
import { OffsetField } from './offset-field';
import { PositionField } from './position-field';
import { ZIndexField } from './z-index-field';

type DimensionValue =
	| {
			$$type: 'size';
			value: number;
	  }
	| undefined
	| null;

type DimensionsValues = {
	'inset-block-start': DimensionValue;
	'inset-block-end': DimensionValue;
	'inset-inline-start': DimensionValue;
	'inset-inline-end': DimensionValue;
};

type PositionDependentValues = DimensionsValues & {
	'z-index': number | undefined | null;
};

const POSITION_STATIC = 'static' as const;

const POSITION_LABEL = __( 'Position', 'elementor' );
const DIMENSIONS_LABEL = __( 'Dimensions', 'elementor' );

const POSITION_DEPENDENT_PROP_NAMES = [
	'inset-block-start',
	'inset-block-end',
	'inset-inline-start',
	'inset-inline-end',
	'z-index',
] as const;

const CLEARED_POSITION_DEPENDENT_VALUES: Record< ( typeof POSITION_DEPENDENT_PROP_NAMES )[ number ], undefined > = {
	'inset-block-start': undefined,
	'inset-block-end': undefined,
	'inset-inline-start': undefined,
	'inset-inline-end': undefined,
	'z-index': undefined,
};

export const PositionSection = () => {
	const { value: positionValue } = useStylesField< StringPropValue >( 'position', {
		history: { propDisplayName: POSITION_LABEL },
	} );
	const { values: positionDependentValues, setValues: setPositionDependentValues } =
		useStylesFields< PositionDependentValues >( [ ...POSITION_DEPENDENT_PROP_NAMES ] );

	const [ dimensionsValuesFromHistory, updateDimensionsHistory, clearDimensionsHistory ] = usePersistDimensions();

	const clearPositionDependentProps = useCallback( () => {
		const dimensions: DimensionsValues = {
			'inset-block-start': positionDependentValues?.[ 'inset-block-start' ],
			'inset-block-end': positionDependentValues?.[ 'inset-block-end' ],
			'inset-inline-start': positionDependentValues?.[ 'inset-inline-start' ],
			'inset-inline-end': positionDependentValues?.[ 'inset-inline-end' ],
		};
		const meta = { history: { propDisplayName: DIMENSIONS_LABEL } };
		const hasValuesToClear =
			Object.values( dimensions ).some( ( v ) => v !== null ) || positionDependentValues?.[ 'z-index' ] !== null;

		if ( hasValuesToClear ) {
			updateDimensionsHistory( dimensions );
			setPositionDependentValues( CLEARED_POSITION_DEPENDENT_VALUES, meta );
		}
	}, [ positionDependentValues, updateDimensionsHistory, setPositionDependentValues ] );

	const clearPositionDependentPropsRef = useRef( clearPositionDependentProps );
	clearPositionDependentPropsRef.current = clearPositionDependentProps;

	useEffect( () => {
		if ( positionValue?.value === POSITION_STATIC || positionValue === null ) {
			clearPositionDependentPropsRef.current();
		}
	}, [ positionValue ] );

	const onPositionChange = ( newPosition: string | null, previousPosition: string | null | undefined ) => {
		const meta = { history: { propDisplayName: DIMENSIONS_LABEL } };

		if ( newPosition === POSITION_STATIC ) {
			clearPositionDependentProps();
		} else if ( previousPosition === POSITION_STATIC ) {
			if ( dimensionsValuesFromHistory ) {
				setPositionDependentValues(
					{ ...dimensionsValuesFromHistory, 'z-index': undefined } as PositionDependentValues,
					meta
				);
				clearDimensionsHistory();
			}
		}
	};

	const isNotStatic = positionValue && positionValue?.value !== POSITION_STATIC;

	return (
		<SectionContent>
			<PositionField onChange={ onPositionChange } />
			{ isNotStatic ? (
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

	return useSessionStorage< DimensionsValues >( dimensionsPath );
};
