import * as React from 'react';
import { Box, CardMedia, CircularProgress } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { findFontAwesome7Icon } from './icon-library/font-awesome-7-catalog';
import { FontAwesomeGlyph } from './icon-library/font-awesome-glyph';
import { useFontAwesome7Catalog } from './icon-library/use-font-awesome-7-catalog';

const ICON_PREVIEW_SIZE = 50;
const ICON_PREVIEW_COLOR = '#000000';

type SvgMediaPreviewProps = {
	isFetching: boolean;
	src: string | null;
	iconClassName: string | null;
	iconLibrary: string | null;
};

export function SvgMediaPreview( { isFetching, src, iconClassName, iconLibrary }: SvgMediaPreviewProps ) {
	const shouldLoadIconCatalog = Boolean( iconClassName && iconLibrary );
	const { data: icons = [], isLoading } = useFontAwesome7Catalog( shouldLoadIconCatalog );
	const selectedIcon = findFontAwesome7Icon( icons, iconClassName, iconLibrary );

	if ( isFetching || ( shouldLoadIconCatalog && isLoading ) ) {
		return <CircularProgress role="progressbar" />;
	}

	if ( selectedIcon ) {
		return (
			<Box sx={ { color: ICON_PREVIEW_COLOR } }>
				<FontAwesomeGlyph
					icon={ selectedIcon }
					size={ ICON_PREVIEW_SIZE }
					color={ ICON_PREVIEW_COLOR }
					label={ __( 'Preview icon', 'elementor' ) }
				/>
			</Box>
		);
	}

	return (
		<CardMedia
			component="img"
			image={ src }
			alt={ __( 'Preview SVG', 'elementor' ) }
			sx={ { maxHeight: '140px', width: `${ ICON_PREVIEW_SIZE }px`, color: ICON_PREVIEW_COLOR } }
		/>
	);
}
