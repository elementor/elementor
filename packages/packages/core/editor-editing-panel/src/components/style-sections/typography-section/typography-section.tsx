import * as React from 'react';
import type { NumberPropValue } from '@elementor/editor-props';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { useStylesField } from '../../../hooks/use-styles-field';
import { PanelDivider } from '../../panel-divider';
import { SectionContent } from '../../section-content';
import { StyleTabCollapsibleContent } from '../../style-tab-collapsible-content';
import { ColumnCountField } from './column-count-field';
import { ColumnGapField } from './column-gap-field';
import { FontFamilyField } from './font-family-field';
import { FontSizeField } from './font-size-field';
import { FontStyleField } from './font-style-field';
import { FontWeightField } from './font-weight-field';
import { LetterSpacingField } from './letter-spacing-field';
import { LineHeightField } from './line-height-field';
import { TextAlignmentField } from './text-alignment-field';
import { TextColorField } from './text-color-field';
import { TextDecorationField } from './text-decoration-field';
import { TextDirectionField } from './text-direction-field';
import { TextStrokeField } from './text-stroke-field';
import { TransformField } from './transform-field';
import { WordSpacingField } from './word-spacing-field';

const COLUMN_COUNT_LABEL = __( 'Column count', 'elementor' );

export const TypographySection = () => {
	const { value: columnCount } = useStylesField< NumberPropValue >( 'column-count', {
		history: { propDisplayName: COLUMN_COUNT_LABEL },
	} );
	const hasMultiColumns = !! ( columnCount?.value && columnCount?.value > 1 );

	const isVersion330Active = isExperimentActive( 'e_v_3_30' );

	return (
		<SectionContent>
			<FontFamilyField />
			<FontWeightField />
			<FontSizeField />
			<PanelDivider />
			<TextAlignmentField />
			<TextColorField />
			<StyleTabCollapsibleContent
				fields={ [
					'line-height',
					'letter-spacing',
					'word-spacing',
					'column-count',
					'text-decoration',
					'text-transform',
					'direction',
					'font-style',
					'stroke',
				] }
			>
				<SectionContent sx={ { pt: 2 } }>
					<LineHeightField />
					<LetterSpacingField />
					<WordSpacingField />
					{ isVersion330Active && (
						<>
							<ColumnCountField />
							{ hasMultiColumns && <ColumnGapField /> }
						</>
					) }
					<PanelDivider />
					<TextDecorationField />
					<TransformField />
					<TextDirectionField />
					<FontStyleField />
					<TextStrokeField />
				</SectionContent>
			</StyleTabCollapsibleContent>
		</SectionContent>
	);
};
