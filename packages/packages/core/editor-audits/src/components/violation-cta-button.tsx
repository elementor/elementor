import * as React from 'react';
import { WandIcon } from '@elementor/icons';
import { Button } from '@elementor/ui';

type Props = {
	ctaLabel: string;
	externalUrl: string;
	variant?: 'outlined' | 'text';
	withIcon?: boolean;
};

export default function ViolationCtaButton( { ctaLabel, externalUrl, variant = 'outlined', withIcon = false }: Props ) {
	const handleClick = ( event: React.MouseEvent< HTMLButtonElement > ) => {
		event.stopPropagation();
		event.preventDefault();

		window.open( externalUrl, '_blank', 'noopener' );
	};

	return (
		<Button
			variant={ variant }
			color="secondary"
			size="small"
			startIcon={ withIcon ? <WandIcon fontSize="tiny" aria-hidden={ true } /> : undefined }
			onClick={ handleClick }
		>
			{ ctaLabel }
		</Button>
	);
}
