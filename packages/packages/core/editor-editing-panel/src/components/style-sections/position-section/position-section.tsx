import * as React from 'react';
import { useEffect, useRef } from 'react';
import { type NumberPropValue, type SizePropValue, type StringPropValue } from '@elementor/editor-props';
import { useSessionStorage } from '@elementor/session';
import { styled } from '@elementor/ui';
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
	const { value: position } = useStylesField< StringPropValue >( 'position', withHistoryLabel( POSITION_LABEL ) );
	const positionPrevRef = useRef( position );
	const { values: dependentValues, setValues: setDependentValues } =
		useStylesFields< DependentValues >( DEPENDENT_PROP_NAMES );

	const [ savedDependentValues, saveToHistory, clearHistory ] = usePersistDimensions();

	useEffect( () => {
		if ( position && position?.value === POSITION_STATIC && hasDependentValues( dependentValues ) ) {
			saveToHistory( extractDimensions( dependentValues ) );
		}

		if ( positionPrevRef.current?.value === POSITION_STATIC ) {
			setDependentValues( { ...savedDependentValues }, withHistoryLabel( DIMENSIONS_LABEL ) );

			clearHistory();
		}

		positionPrevRef.current = position;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ position?.value ] );

	return (
		<StyledSectionContent>
			<PositionField />
			<DimensionsField />
			<ZIndexField />
			<PanelDivider />
			<OffsetField />
		</StyledSectionContent>
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

const StyledSectionContent = styled( SectionContent, {
	shouldForwardProp: ( prop ) => prop !== 'gap',
} )< { gap?: number } >( ( { gap = 2, theme } ) => ( {
	gap: 0,
	'& > *': {
		marginBottom: theme.spacing( gap ),
	},
	'& > *:last-child': {
		marginBottom: 0,
	},
	'& > .MuiStack-root': {
		marginBottom: 0,
	},
	'& > .MuiStack-root:has(> *)': {
		marginBottom: theme.spacing( gap ),
	},
	'& > .MuiDivider-root': {
		marginBottom: theme.spacing( gap ),
	},
} ) );
