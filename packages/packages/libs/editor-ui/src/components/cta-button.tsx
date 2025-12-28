import * as React from 'react';
import { CrownFilledIcon } from '@elementor/icons';
import { Button, type ButtonProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type CtaButtonProps = {
	href: string;
} & Omit< ButtonProps, 'href' | 'target' | 'startIcon' | 'color' | 'variant' >;

export const CtaButton = ( { href, children, ...props }: CtaButtonProps ) => (
	<Button
		variant="contained"
		color="promotion"
		href={ href }
		target="_blank"
		startIcon={ <CrownFilledIcon /> }
		{ ...props }
	>
		{ children ?? __( 'Upgrade Now', 'elementor' ) }
	</Button>
);
