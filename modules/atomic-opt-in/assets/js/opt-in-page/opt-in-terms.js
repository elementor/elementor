import { __ } from '@wordpress/i18n';
import {
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	Stack,
} from '@elementor/ui';
import React, { useState } from 'react';
import { ContentList, ContentListItem, TextNode } from './opt-in-content';
import DialogHeaderGroup from '@elementor/ui/DialogHeaderGroup';
import DialogHeader from '@elementor/ui/DialogHeader';

const i18n = {
	header: __( 'Atomic Editor', 'elementor' ),
	checkboxText: __( 'I’ve read and understood.', 'elementor' ),

	optIn: {
		titleText: __( 'You are about to enable Atomic Editor features!', 'elementor' ),
		introText: __( 'By activating, you’ll get access to the next generation of Elementor’s Editor. This is your chance to explore new capabilities and help shape the future of Elementor! ', 'elementor' ),
		details: [
			__( 'When you activate, you’ll also be activating Containers and Nested Elements. You can turn them back off by going to: WP Admin > Elementor > Settings > Features.', 'elementor' ),
		],
		activateButton: __( 'Activate', 'elementor' ),
		cancelButton: __( 'Cancel', 'elementor' ),
	},

	optOut: {
		titleText: __( 'You\'re about to lose all content created with Atomic features', 'elementor' ),
		details: [
			__( 'By deactivating, you’ll lose all Atomic Elements, Classes and Variables. Any content you created with these features will no longer be available or appear on your site.', 'elementor' ),
			__( 'Containers and Nested Elements will stay in their current status.', 'elementor' ),
		],
		activateButton: __( 'Deactivate', 'elementor' ),
		cancelButton: __( 'Cancel', 'elementor' ),
	},
};

export const Terms = ( { onClose, onSubmit, isEnrolled, ...props } ) => {
	const [ checked, setChecked ] = useState( false );

	const handleCheckboxChange = () => {
		setChecked( ( prev ) => ! prev );
	};

	const handleSubmit = () => {
		if ( checked ) {
			onSubmit();
		}
	};

	const currentState = isEnrolled ? 'optOut' : 'optIn';

	return (
		<Dialog
			{ ...props }
			open
			onClose={ onClose }
			maxWidth="md"
		>
			<DialogHeader>
				<DialogHeaderGroup>
					<DialogTitle>{ i18n.header }</DialogTitle>
				</DialogHeaderGroup>
			</DialogHeader>

			<DialogContent dividers>
				<Stack gap={ 2.5 }>
					<Stack gap={ 1.5 } sx={ { mx: 2, maxWidth: '550px' } }>
						<TextNode align="center" variant="h6">{ i18n[ currentState ].titleText }</TextNode>
						{ i18n[ currentState ].introText && <TextNode align="center" variant="body3">{ i18n[ currentState ].introText }</TextNode> }
					</Stack>
					<Stack>
						<ContentList sx={ { mx: 3, maxWidth: '550px' } }>
							{ i18n[ currentState ].details.map( ( entry, index ) => (
								<ContentListItem key={ index } variant="body3">
									{ entry }
								</ContentListItem>
							) ) }
						</ContentList>
					</Stack>
					<FormControlLabel
						control={
							<Checkbox
								checked={ !! checked }
								onChange={ handleCheckboxChange }
								color="secondary"
								size="small"
							/>
						}
						label={ <TextNode variant="body2">{ i18n.checkboxText }</TextNode> }
					/>
				</Stack>
			</DialogContent>

			<DialogActions>
				<Button variant="text" color="secondary" onClick={ onClose }>
					{ i18n[ currentState ].cancelButton }
				</Button>
				<Button
					disabled={ ! checked }
					variant="contained"
					onClick={ handleSubmit }
				>
					{ i18n[ currentState ].activateButton }
				</Button>
			</DialogActions>
		</Dialog>
	);
};

Terms.propTypes = {
	onClose: PropTypes.func,
	onSubmit: PropTypes.func,
	isEnrolled: PropTypes.bool,
};
