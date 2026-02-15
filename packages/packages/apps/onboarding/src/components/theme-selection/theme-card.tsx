import * as React from 'react';
import { CheckedCircleIcon } from '@elementor/icons';
import { Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import type { ThemeSlug } from '../../types';
import { InstalledChip, RecommendedChip, ThemeCardRoot, ThemePreview } from './styled-components';

export interface ThemeCardProps {
	slug: ThemeSlug;
	label: string;
	description: string;
	previewBgColor: string;
	previewImage?: string;
	selected: boolean;
	recommended: boolean;
	installed: boolean;
	disabled: boolean;
	onClick: ( slug: ThemeSlug ) => void;
}

export function ThemeCard( {
	slug,
	label,
	description,
	previewBgColor,
	previewImage,
	selected,
	recommended,
	installed,
	disabled,
	onClick,
}: ThemeCardProps ) {
	return (
		<ThemeCardRoot
			selected={ selected }
			disabled={ disabled }
			onClick={ () => ! disabled && onClick( slug ) }
			role="radio"
			aria-checked={ selected }
			aria-label={ label }
			tabIndex={ 0 }
			onKeyDown={ ( e: React.KeyboardEvent ) => {
				if ( ( e.key === 'Enter' || e.key === ' ' ) && ! disabled ) {
					e.preventDefault();
					onClick( slug );
				}
			} }
		>
			<ThemePreview bgColor={ previewBgColor } previewImage={ previewImage }>
				{ installed && (
					<InstalledChip
						label={ __( 'Installed', 'elementor' ) }
						size="small"
						color="success"
						icon={ <CheckedCircleIcon /> }
					/>
				) }
				{ recommended && ! installed && (
					<RecommendedChip label={ __( 'Recommended', 'elementor' ) } size="small" color="secondary" />
				) }
			</ThemePreview>

			<Stack spacing={ 1 } alignItems="center" sx={ { textAlign: 'center', px: 2.25 } }>
				<Typography variant="subtitle1" color="text.primary">
					{ label }
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{ description }
				</Typography>
			</Stack>
		</ThemeCardRoot>
	);
}
