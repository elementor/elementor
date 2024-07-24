import { Alert, Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import useIntroduction from '../../../../hooks/use-introduction';

export const PromptPowerNotice = () => {
	const { isViewed, markAsViewed } = useIntroduction( 'e-ai-builder-attachments-power' );
	if ( isViewed ) {
		return null;
	}

	return (
		<Box sx={ { pt: 2, px: 2, pb: 0 } }>
			<Alert
				severity="info"
				onClose={ () => markAsViewed() }
			>
				<Typography
					variant="body2"
					display="inline-block"
					sx={ {
						paddingInlineEnd: 1,
					} }>
					{ __( 'You’ve got the power.', 'elementor' ) }
				</Typography>
				<Typography
					variant="body2"
					display="inline-block"
				>
					{ __( 'Craft your prompt to affect content, images and/or colors - whichever you decide.', 'elementor' ) }
				</Typography>
			</Alert>
		</Box>
	);
};
