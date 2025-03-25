import { __ } from '@wordpress/i18n';
import {
	Button,
	Checkbox, Chip, Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Stack,
} from '@elementor/ui';
import React, { useState } from 'react';
import { ContentList, ContentListItem, TextNode } from './opt-in-content';
import DialogHeaderGroup from '@elementor/ui/DialogHeaderGroup';
import DialogHeader from '@elementor/ui/DialogHeader';

const i18n = {
	header: __( 'Editor V4', 'elementor' ),
	chip: __( 'Alpha', 'elementor' ),

	titleText: {
		optIn: __( 'You are about to enable Editor V4 features!', 'elementor' ),
		optOut: __( 'You’re deactivating Editor V4', 'elementor' ),
	},
	introText: {
		optIn: __( 'By activating, you’ll get early access to the next generation of Elementor’s Editor. This is your chance to explore new capabilities and help shape the future of Elementor! ', 'elementor' ),
		optOut: __( 'We hope you enjoyed testing and building with these new features. ', 'elementor' ),
	},
	notesHeader:
		{
			optIn: __( ' Important notes:', 'elementor' ),
			optOut: __( ' Keep in mind:', 'elementor' ),
		},
	notes: {
		alphaText: __( 'Editor V4 is currently in alpha, ', 'elementor' ),
		optIn: [
			__( 'and development is still in progress. Do not use it on live sites - use a staging or development environment instead.', 'elementor' ),
			__( 'When you activate Editor V4, you’ll also be activating Containers, the Top Bar, and Nested Elements. You can turn them back off by going to WP Admin > Elementor > Settings > Features.', 'elementor' ),
		],
		optOut: [
			__( 'By deactivating, you’ll lose all Editor V4 features, and any content you created with V4-specific features will no longer be available or appear on your site.', 'elementor' ),
			__( 'Containers, the Top Bar, and Nested Elements will stay in their current status.', 'elementor' ),
		],
	},
	checkboxText: __( 'I’ve read and understood.', 'elementor' ),
	activateButton: {
		optIn: __( 'Activate', 'elementor' ),
		optOut: __( 'Deactivate V4', 'elementor' ),
	},
	cancelButton: __( 'Cancel', 'elementor' ),
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
		>
			<DialogHeader>
				<DialogHeaderGroup>
					<DialogTitle>{ i18n.header }</DialogTitle>

					<Chip label={ i18n.chip } color="secondary" variant="filled" size="small" />
				</DialogHeaderGroup>
			</DialogHeader>

			<DialogContent dividers>
				<Stack gap={ 2.5 } >
					<Stack gap={ 1 }>
						<TextNode align="center" variant="h6" >{ i18n.titleText[ currentState ] }</TextNode>
						<TextNode align="center" variant="body2">{ i18n.introText[ currentState ] }</TextNode>
					</Stack>
					<Stack gap={ 1 } >
						<TextNode variant="body2" >{ i18n.notesHeader[ currentState ] }</TextNode>
						<ContentList>
							<ContentListItem variant="body2">
								<>
									{ ! isEnrolled && (
										<TextNode variant="subtitle2" component="span">
											{ i18n.notes.alphaText }
										</TextNode>
									) }
									{ i18n.notes[ currentState ][ 0 ] }
								</>
							</ContentListItem>
							{ i18n.notes[ currentState ].slice( 1 ).map( ( entry, index ) => (
								<ContentListItem key={ index } variant="body2">
									{ entry }
								</ContentListItem>
							) ) }
						</ContentList>
					</Stack>
					<Stack direction="row" alignItems="center" >
						<Checkbox
							checked={ !! checked }
							onClick={ handleCheckboxChange }
							color="secondary"
							size="small">
						</Checkbox>
						<TextNode variant="body2">{ i18n.checkboxText }</TextNode>
					</Stack>
				</Stack>

			</DialogContent>

			<DialogActions>
				<Button variant="text" color="secondary" onClick={ onClose }>
					{ i18n.cancelButton }
				</Button>
				<Button disabled={ ! checked } variant="contained" onClick={ handleSubmit }>
					{ i18n.activateButton[ currentState ] }
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
