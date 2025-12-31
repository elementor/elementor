import * as React from 'react';
import { CrownFilledIcon } from '@elementor/icons';
import { Button, type ButtonProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type CtaButtonProps = {
	href: string;
	showIcon?: boolean;
} & Omit< ButtonProps, 'href' | 'target' | 'startIcon' | 'color' | 'variant' >;

export const CtaButton = ( { href, showIcon = true, children, ...props }: CtaButtonProps ) => (
	<Button
		variant="contained"
		color="promotion"
		href={ href }
		target="_blank"
		startIcon={ showIcon ? <CrownFilledIcon /> : undefined }
		{ ...props }
	>
		{ children ?? __( 'Upgrade Now', 'elementor' ) }
	</Button>
);
