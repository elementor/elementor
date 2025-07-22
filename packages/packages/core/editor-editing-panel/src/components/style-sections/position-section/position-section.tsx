import * as React from 'react';
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

const POSITION_LABEL = __( 'Position', 'elementor' );
const DIMENSIONS_LABEL = __( 'Dimensions', 'elementor' );

export const PositionSection = () => {
	const { value: positionValue } = useStylesField< StringPropValue >( 'position', {
		history: { propDisplayName: POSITION_LABEL },
	} );
	const { values: dimensions, setValues: setDimensions } = useStylesFields< DimensionsValues >( [
		'inset-block-start',
		'inset-block-end',
		'inset-inline-start',
		'inset-inline-end',
	] );

	const [ dimensionsValuesFromHistory, updateDimensionsHistory, clearDimensionsHistory ] = usePersistDimensions();

	const onPositionChange = ( newPosition: string | null, previousPosition: string | null | undefined ) => {
		const meta = { history: { propDisplayName: DIMENSIONS_LABEL } };

		if ( newPosition === 'static' ) {
			if ( dimensions ) {
				updateDimensionsHistory( dimensions );
				setDimensions(
					{
						'inset-block-start': undefined,
						'inset-block-end': undefined,
						'inset-inline-start': undefined,
						'inset-inline-end': undefined,
					},
					meta
				);
			}
		} else if ( previousPosition === 'static' ) {
			if ( dimensionsValuesFromHistory ) {
				setDimensions( dimensionsValuesFromHistory, meta );
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
