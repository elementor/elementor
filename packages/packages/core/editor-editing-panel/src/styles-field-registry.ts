import { type ComponentType } from 'react';
import { type PropKey } from '@elementor/editor-props';

import { BorderColorField } from './components/style-sections/border-section/border-color-field';
import { BorderRadiusField } from './components/style-sections/border-section/border-radius-field';
import { BorderStyleField } from './components/style-sections/border-section/border-style-field';
import { BorderWidthField } from './components/style-sections/border-section/border-width-field';
import { BlendModeField } from './components/style-sections/effects-section/blend-mode-field';
import { OpacityControlField } from './components/style-sections/effects-section/opacity-control-field';
import { AlignContentField } from './components/style-sections/layout-section/align-content-field';
import { AlignItemsField } from './components/style-sections/layout-section/align-items-field';
import { DisplayField } from './components/style-sections/layout-section/display-field';
import { FlexDirectionField } from './components/style-sections/layout-section/flex-direction-field';
import { GapControlField } from './components/style-sections/layout-section/gap-control-field';
import { GridJustifyItemsField } from './components/style-sections/layout-section/grid-justify-items-field';
import { JustifyContentField } from './components/style-sections/layout-section/justify-content-field';
import { WrapField } from './components/style-sections/layout-section/wrap-field';
import { OffsetField } from './components/style-sections/position-section/offset-field';
import { PositionField } from './components/style-sections/position-section/position-field';
import { ZIndexField } from './components/style-sections/position-section/z-index-field';
import { ObjectFitField } from './components/style-sections/size-section/object-fit-field';
import { OverflowField } from './components/style-sections/size-section/overflow-field';
import { ColumnCountField } from './components/style-sections/typography-section/column-count-field';
import { ColumnGapField } from './components/style-sections/typography-section/column-gap-field';
import { FontFamilyField } from './components/style-sections/typography-section/font-family-field';
import { FontSizeField } from './components/style-sections/typography-section/font-size-field';
import { FontStyleField } from './components/style-sections/typography-section/font-style-field';
import { FontWeightField } from './components/style-sections/typography-section/font-weight-field';
import { LetterSpacingField } from './components/style-sections/typography-section/letter-spacing-field';
import { LineHeightField } from './components/style-sections/typography-section/line-height-field';
import { TextAlignmentField } from './components/style-sections/typography-section/text-alignment-field';
import { TextColorField } from './components/style-sections/typography-section/text-color-field';
import { TextDecorationField } from './components/style-sections/typography-section/text-decoration-field';
import { TextDirectionField } from './components/style-sections/typography-section/text-direction-field';
import { TransformField } from './components/style-sections/typography-section/transform-field';
import { WordSpacingField } from './components/style-sections/typography-section/word-spacing-field';
import { type StylesFieldLabelProps } from './controls-registry/styles-field';

export type StylesFieldComponent = ComponentType< StylesFieldLabelProps >;

const stylesFields: Record< PropKey, StylesFieldComponent > = {
	display: DisplayField,
	'flex-direction': FlexDirectionField,
	'justify-content': JustifyContentField,
	'align-items': AlignItemsField,
	'align-content': AlignContentField,
	'flex-wrap': WrapField,
	gap: GapControlField,
	'justify-items': GridJustifyItemsField,
	overflow: OverflowField,
	'object-fit': ObjectFitField,
	position: PositionField,
	'z-index': ZIndexField,
	'scroll-margin-top': OffsetField,
	'font-family': FontFamilyField,
	'font-weight': FontWeightField,
	'font-size': FontSizeField,
	'text-align': TextAlignmentField,
	color: TextColorField,
	'line-height': LineHeightField,
	'letter-spacing': LetterSpacingField,
	'word-spacing': WordSpacingField,
	'column-count': ColumnCountField,
	'column-gap': ColumnGapField,
	'text-decoration': TextDecorationField,
	'text-transform': TransformField,
	direction: TextDirectionField,
	'font-style': FontStyleField,
	'border-radius': BorderRadiusField,
	'border-width': BorderWidthField,
	'border-color': BorderColorField,
	'border-style': BorderStyleField,
	'mix-blend-mode': BlendModeField,
	opacity: OpacityControlField,
};

export function getStylesFieldComponent( propKey: PropKey ): StylesFieldComponent | null {
	return stylesFields[ propKey ] ?? null;
}
