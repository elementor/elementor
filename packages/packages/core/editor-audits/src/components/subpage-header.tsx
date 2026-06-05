import * as React from 'react';
import { ArrowLeftIcon } from '@elementor/icons';
import { Box, IconButton, Rotate, Typography, useTheme } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type Props = {
	title: string;
	onBack: () => void;
	backLabel?: string;
	icon?: React.ReactNode;
};

export default function SubpageHeader( { title, onBack, backLabel, icon }: Props ) {
	const isRtl = 'rtl' === useTheme().direction;

	return (
		<Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5, p: 1 } }>
			<IconButton size="small" onClick={ onBack } aria-label={ backLabel ?? __( 'Back', 'elementor' ) }>
				<Rotate in={ isRtl }>
					<ArrowLeftIcon fontSize="small" />
				</Rotate>
			</IconButton>
			{ icon }
			<Typography variant="subtitle2" fontWeight="bold">
				{ title }
			</Typography>
		</Box>
	);
}
