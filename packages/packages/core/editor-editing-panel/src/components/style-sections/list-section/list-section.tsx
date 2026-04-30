import * as React from 'react';
import { ImageMediaControl, SelectControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { SectionContent } from '../../section-content';
import { StylesFieldLayout } from '../../styles-field-layout';

const LIST_STYLE_TYPE_LABEL = __( 'Marker type', 'elementor' );
const LIST_STYLE_POSITION_LABEL = __( 'Marker position', 'elementor' );
const LIST_STYLE_IMAGE_LABEL = __( 'Marker image', 'elementor' );

const listStyleTypeOptions = [
	{ label: __( 'Disc', 'elementor' ), value: 'disc' },
	{ label: __( 'Circle', 'elementor' ), value: 'circle' },
	{ label: __( 'Square', 'elementor' ), value: 'square' },
	{ label: __( 'Decimal', 'elementor' ), value: 'decimal' },
	{ label: __( 'Lower alpha', 'elementor' ), value: 'lower-alpha' },
	{ label: __( 'Upper alpha', 'elementor' ), value: 'upper-alpha' },
	{ label: __( 'Lower roman', 'elementor' ), value: 'lower-roman' },
	{ label: __( 'Upper roman', 'elementor' ), value: 'upper-roman' },
];

const listStylePositionOptions = [
	{ label: __( 'Outside', 'elementor' ), value: 'outside' },
	{ label: __( 'Inside', 'elementor' ), value: 'inside' },
];

export const ListSection = () => {
	return (
		<SectionContent>
			<StylesField bind="list-style-type" propDisplayName={ LIST_STYLE_TYPE_LABEL }>
				<StylesFieldLayout label={ LIST_STYLE_TYPE_LABEL }>
					<SelectControl options={ listStyleTypeOptions } />
				</StylesFieldLayout>
			</StylesField>
			<StylesField bind="list-style-position" propDisplayName={ LIST_STYLE_POSITION_LABEL }>
				<StylesFieldLayout label={ LIST_STYLE_POSITION_LABEL }>
					<SelectControl options={ listStylePositionOptions } />
				</StylesFieldLayout>
			</StylesField>
			<StylesField bind="list-style-image" propDisplayName={ LIST_STYLE_IMAGE_LABEL }>
				<StylesFieldLayout label={ LIST_STYLE_IMAGE_LABEL }>
					<ImageMediaControl />
				</StylesFieldLayout>
			</StylesField>
		</SectionContent>
	);
};
