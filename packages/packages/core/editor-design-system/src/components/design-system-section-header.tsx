import * as React from 'react';
import { ArrowLeftIcon, ColorFilterIcon, ColorSwatchIcon, TextIcon } from '@elementor/icons';
import { IconButton, Rotate, Stack, Typography, useTheme } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type DesignSystemTab } from '../initial-tab';

const SECTION_ICONS: Record< DesignSystemTab, typeof TextIcon > = {
	defaults: TextIcon,
	variables: ColorFilterIcon,
	classes: ColorSwatchIcon,
};

const SECTION_TITLES: Record< DesignSystemTab, string > = {
	defaults: __( 'Default styles', 'elementor' ),
	variables: __( 'Variables', 'elementor' ),
	classes: __( 'Classes', 'elementor' ),
};

export type DesignSystemSectionHeaderProps = {
	section: DesignSystemTab;
	onBack: () => void;
};

export function DesignSystemSectionHeader( { section, onBack }: DesignSystemSectionHeaderProps ) {
	const isRtl = 'rtl' === useTheme().direction;
	const Icon = SECTION_ICONS[ section ];

	return (
		<Stack direction="row" alignItems="center" spacing={ 0.5 } sx={ { minWidth: 0, flex: 1 } }>
			<IconButton
				size="small"
				aria-label={ __( 'Back', 'elementor' ) }
				onClick={ onBack }
				sx={ { flexShrink: 0 } }
			>
				<Rotate in={ isRtl }>
					<ArrowLeftIcon fontSize="small" />
				</Rotate>
			</IconButton>
			<Icon fontSize="small" color="action" />
			<Typography variant="subtitle2" fontWeight="bold" noWrap sx={ { flex: 1, minWidth: 0 } }>
				{ SECTION_TITLES[ section ] }
			</Typography>
		</Stack>
	);
}
