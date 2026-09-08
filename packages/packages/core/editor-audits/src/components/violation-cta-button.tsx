import * as React from 'react';
import { Button } from '@elementor/ui';

type Props = {
	ctaLabel: string;
	externalUrl: string;
};

export default function ViolationCtaButton( { ctaLabel, externalUrl }: Props ) {
	const handleClick = ( event: React.MouseEvent< HTMLButtonElement > ) => {
		event.stopPropagation();
		event.preventDefault();

		window.open( externalUrl, '_blank', 'noopener' );
	};

	return (
		<Button variant="outlined" color="secondary" size="small" onClick={ handleClick }>
			{ ctaLabel }
		</Button>
	);
}
