import * as React from 'react';
import { InfoAlert } from '@elementor/editor-ui';
import { Grid, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider } from '../../bound-prop-context';
import { ControlFormLabel } from '../../components/control-form-label';
import { useFormFieldSuggestions } from '../../hooks/use-form-field-suggestions';
import { ChipsControl } from '../chips-control';
import { MentionTextAreaControl } from '../mention-text-area-control';
import { SelectControl } from '../select-control';
import { EmailChipsField } from './email-chips-field';
import { EmailField } from './email-field';
import { shouldShowMentionsInfo } from './utils';

export const SendToField = ( { placeholder }: { placeholder?: string } ) => (
	<EmailChipsField fieldLabel={ __( 'Send to', 'elementor' ) } placeholder={ placeholder } />
);

export const SubjectField = () => (
	<EmailField
		bind="subject"
		label={ __( 'Email subject', 'elementor' ) }
		placeholder={ __( 'New form submission', 'elementor' ) }
	/>
);

export const MessageField = () => {
	const suggestions = useFormFieldSuggestions();

	return (
		<PropKeyProvider bind="message">
			<Grid container direction="column" gap={ 0.5 }>
				<Grid item>
					<ControlFormLabel>{ __( 'Message', 'elementor' ) }</ControlFormLabel>
				</Grid>
				<Grid item>
					<MentionTextAreaControl suggestions={ suggestions } />
				</Grid>
				<Grid item>
					<InfoAlert>
						{ shouldShowMentionsInfo()
							? __(
									'[all-fields] shortcode sends all fields. Type @ to insert specific fields and customize your message.',
									'elementor'
							  )
							: __( '[all-fields] shortcode sends all fields.', 'elementor' ) }
					</InfoAlert>
				</Grid>
			</Grid>
		</PropKeyProvider>
	);
};

export const FromEmailField = () => (
	<EmailField
		bind="from"
		label={ __( 'From email', 'elementor' ) }
		placeholder={ __( 'What email should appear as the sender?', 'elementor' ) }
	/>
);

export const FromNameField = () => (
	<EmailField
		bind="from-name"
		label={ __( 'From name', 'elementor' ) }
		placeholder={ __( 'What name should appear as the sender?', 'elementor' ) }
	/>
);

export const ReplyToField = () => {
	const emailSuggestions = useFormFieldSuggestions( { inputType: 'email' } );

	return (
		<PropKeyProvider bind="reply-to">
			<Grid container direction="column" gap={ 0.5 }>
				<Grid item>
					<ControlFormLabel>{ __( 'Reply-to', 'elementor' ) }</ControlFormLabel>
				</Grid>
				<Grid item>
					<MentionTextAreaControl
						suggestions={ emailSuggestions }
						rows={ 1 }
						triggerPosition="start"
						placeholder={ __( 'You can type @ to insert an email field', 'elementor' ) }
					/>
				</Grid>
			</Grid>
		</PropKeyProvider>
	);
};

export const CcField = () => (
	<PropKeyProvider bind="cc">
		<EmailChipsField fieldLabel={ __( 'Cc', 'elementor' ) } />
	</PropKeyProvider>
);

export const BccField = () => (
	<PropKeyProvider bind="bcc">
		<EmailChipsField fieldLabel={ __( 'Bcc', 'elementor' ) } />
	</PropKeyProvider>
);

export const MetaDataField = () => (
	<PropKeyProvider bind="meta-data">
		<Stack gap={ 0.5 }>
			<ControlFormLabel>{ __( 'Metadata', 'elementor' ) }</ControlFormLabel>
			<ChipsControl
				options={ [
					{ label: __( 'Date', 'elementor' ), value: 'date' },
					{ label: __( 'Time', 'elementor' ), value: 'time' },
					{ label: __( 'Page URL', 'elementor' ), value: 'page-url' },
					{ label: __( 'User agent', 'elementor' ), value: 'user-agent' },
					{ label: __( 'Credit', 'elementor' ), value: 'credit' },
				] }
			/>
		</Stack>
	</PropKeyProvider>
);

export const SendAsField = () => (
	<PropKeyProvider bind="send-as">
		<Grid container direction="column" gap={ 0.5 }>
			<Grid item>
				<ControlFormLabel>{ __( 'Send as', 'elementor' ) }</ControlFormLabel>
			</Grid>
			<Grid item>
				<SelectControl
					options={ [
						{ label: __( 'HTML', 'elementor' ), value: 'html' },
						{ label: __( 'Plain Text', 'elementor' ), value: 'plain' },
					] }
				/>
			</Grid>
		</Grid>
	</PropKeyProvider>
);
