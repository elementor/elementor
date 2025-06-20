import * as React from 'react';
import { type StringPropValue } from '@elementor/editor-props';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { useSessionStorage } from '@elementor/session';

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

export const PositionSection = () => {
	const { value: positionValue } = useStylesField< StringPropValue >( 'position' );
	const { values: dimensions, setValues: setDimensions } = useStylesFields< DimensionsValues >( [
		'inset-block-start',
		'inset-block-end',
		'inset-inline-start',
		'inset-inline-end',
	] );

	const [ dimensionsValuesFromHistory, updateDimensionsHistory, clearDimensionsHistory ] = usePersistDimensions();
	const isCssIdFeatureActive = isExperimentActive( 'e_v_3_30' );

	const onPositionChange = ( newPosition: string | null, previousPosition: string | null | undefined ) => {
		if ( newPosition === 'static' ) {
			if ( dimensions ) {
				updateDimensionsHistory( dimensions );
				setDimensions( {
					'inset-block-start': undefined,
					'inset-block-end': undefined,
					'inset-inline-start': undefined,
					'inset-inline-end': undefined,
				} );
			}
		} else if ( previousPosition === 'static' ) {
			if ( dimensionsValuesFromHistory ) {
				setDimensions( dimensionsValuesFromHistory );
				clearDimensionsHistory();
			}
		}
	};

	const isNotStatic = positionValue && positionValue?.value !== 'static';

	return (
		<SectionContent>
			<PositionField onChange={ onPositionChange } />
			{ isNotStatic ? (
				<>
					<DimensionsField />
					<ZIndexField />
				</>
			) : null }

			{ isCssIdFeatureActive && (
				<>
					<PanelDivider />
					<OffsetField />
				</>
			) }
		</SectionContent>
	);
};

const usePersistDimensions = () => {
	const { id: styleDefID, meta } = useStyle();
	const styleVariantPath = `styles/${ styleDefID }/${ meta.breakpoint || 'desktop' }/${ meta.state || 'null' }`;
	const dimensionsPath = `${ styleVariantPath }/dimensions`;

	return useSessionStorage< DimensionsValues >( dimensionsPath );
};
