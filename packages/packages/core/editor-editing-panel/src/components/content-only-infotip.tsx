import * as React from 'react';
import { type PropsWithChildren, useState } from 'react';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Alert, AlertTitle, Box, Infotip, Link } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const LEARN_MORE_URL = 'https://go.elementor.com/content-only-access-infotip';

const INFOTIP_WIDTH = 300;

export const ContentOnlyInfotip = ( { children }: PropsWithChildren ) => {
	const [ isOpen, setIsOpen ] = useState( false );

	return (
		<Infotip
			open={ isOpen }
			placement="bottom"
			color="secondary"
			content={
				<Alert color="secondary" icon={ <InfoCircleFilledIcon /> } size="small">
					<AlertTitle>{ __( 'Content-only access', 'elementor' ) }</AlertTitle>
					<Box component="span">
						{ __( 'Your Site Admin has limited this role to content editing.', 'elementor' ) }{ ' ' }
						<Link href={ LEARN_MORE_URL } target="_blank" color="info.main">
							{ __( 'Learn More', 'elementor' ) }
						</Link>
					</Box>
				</Alert>
			}
			slotProps={ { popper: { sx: { width: INFOTIP_WIDTH } } } }
		>
			{ /* A disabled MUI tab sets pointer-events: none, so the trigger has to opt back in to receive hover. */ }
			<Box
				component="span"
				sx={ { pointerEvents: 'auto' } }
				onMouseEnter={ () => setIsOpen( true ) }
				onMouseLeave={ () => setIsOpen( false ) }
			>
				{ children }
			</Box>
		</Infotip>
	);
};
