import * as React from 'react';
import { useState } from 'react';
import { Button } from '@elementor/ui';

import { installAndActivatePlugin } from '../utils/install-plugin';

type Props = {
	ctaLabel: string;
	externalUrl?: string;
	installPluginSlug?: string;
	installPluginFile?: string;
};

export default function ViolationCtaButton( { ctaLabel, externalUrl, installPluginSlug, installPluginFile }: Props ) {
	const [ isInstalling, setIsInstalling ] = useState( false );

	const handleClick = async ( event: React.MouseEvent< HTMLButtonElement > ) => {
		event.stopPropagation();
		event.preventDefault();

		if ( installPluginSlug && installPluginFile ) {
			setIsInstalling( true );
			await installAndActivatePlugin( installPluginSlug, installPluginFile );
			setIsInstalling( false );
			return;
		}

		if ( externalUrl ) {
			window.open( externalUrl, '_blank', 'noopener' );
		}
	};

	return (
		<Button variant="outlined" color="secondary" size="small" onClick={ handleClick } disabled={ isInstalling }>
			{ ctaLabel }
		</Button>
	);
}
