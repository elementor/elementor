import * as React from 'react';
import { useState } from 'react';
import { useSuppressedMessage } from '@elementor/editor-current-user';
import { IntroductionModal } from '@elementor/editor-ui';
import { Box, Image, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const MESSAGE_KEY = 'global-class-manager';

export const ClassManagerIntroduction = () => {
	const [ isMessageSuppressed, suppressMessage ] = useSuppressedMessage( MESSAGE_KEY );
	const [ shouldShowIntroduction, setShouldShowIntroduction ] = useState( ! isMessageSuppressed );

	return (
		<IntroductionModal
			open={ shouldShowIntroduction }
			title={ __( 'Class Manager', 'elementor' ) }
			handleClose={ ( shouldShowAgain ) => {
				if ( ! shouldShowAgain ) {
					suppressMessage();
				}

				setShouldShowIntroduction( false );
			} }
		>
			<Image
				sx={ { width: '100%', aspectRatio: '16 / 9' } }
				src={ 'https://assets.elementor.com/packages/v1/images/class-manager-intro.svg' }
				alt={ '' }
			/>
			<IntroductionContent />
		</IntroductionModal>
	);
};

const IntroductionContent = () => {
	return (
		<Box p={ 3 }>
			<Typography variant={ 'body2' }>
				{ __(
					"The Class Manager lets you see all the classes you've created, plus adjust their priority, rename them, and delete unused classes to keep your CSS structured.",
					'elementor'
				) }
			</Typography>
			<br />
			<Typography variant={ 'body2' }>
				{ __(
					'Remember, when editing an item within a specific class, any changes you make will apply across all elements in that class.',
					'elementor'
				) }
			</Typography>
		</Box>
	);
};
