import * as React from 'react';
import { Link, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type Props = {
	searchValue: string;
	onClear?: () => void;
	icon?: React.ReactNode;
};

export const NoSearchResults = ( { searchValue, onClear, icon }: Props ) => {
	return (
		<Stack
			gap={ 1 }
			alignItems="center"
			justifyContent="center"
			height="100%"
			p={ 2.5 }
			color="text.secondary"
			sx={ { pb: 3.5 } }
		>
			{ icon }
			<Typography align="center" variant="subtitle2">
				{ __( 'Sorry, nothing matched', 'elementor' ) }
				<br />
				&ldquo;{ searchValue }&rdquo;.
			</Typography>
			<Typography align="center" variant="caption" sx={ { display: 'flex', flexDirection: 'column' } }>
				{ __( 'Try something else.', 'elementor' ) }
				<Link color="text.secondary" variant="caption" component="button" onClick={ onClear }>
					{ __( 'Clear & try again', 'elementor' ) }
				</Link>
			</Typography>
		</Stack>
	);
};
