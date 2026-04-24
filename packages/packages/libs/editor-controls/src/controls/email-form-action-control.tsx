import * as React from 'react';
import { emailPropTypeUtil } from '@elementor/editor-props';
import { CollapsibleContent, InfoAlert } from '@elementor/editor-ui';
import { Box, Divider, Grid, Stack } from '@elementor/ui';
import { hasProInstalled, isVersionGreaterOrEqual } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { ControlLabel } from '../components/control-label';
import { createControl } from '../create-control';
import { useFormFieldSuggestions } from '../hooks/use-form-field-suggestions';
import { ChipsControl } from './chips-control';
import { MentionTextAreaControl } from './mention-text-area-control';
import { SelectControl } from './select-control';
import { TextControl } from './text-control';

const EmailField = ( { bind, label, placeholder }: { bind: string; label: string; placeholder?: string } ) => (
	<PropKeyProvider bind={ bind }>
		<Grid container direction="column" gap={ 0.5 }>
			<Grid item>
				<ControlFormLabel>{ label }</ControlFormLabel>
			</Grid>
			<Grid item>
				<TextControl placeholder={ placeholder } />
			</Grid>
		</Grid>
	</PropKeyProvider>
);

const SendToField = ( { placeholder }: { placeholder?: string } ) => (
	<EmailField bind="to" label={ __( 'Send to', 'elementor' ) } placeholder={ placeholder } />
);

const SubjectField = () => (
	<EmailField
		bind="subject"
		label={ __( 'Email subject', 'elementor' ) }
		placeholder={ __( 'New form submission', 'elementor' ) }
	/>
);

const MIN_PRO_VERSION_FOR_MENTIONS = '4.1.0';

const shouldShowMentionsInfo = (): boolean => {
	if ( ! hasProInstalled() ) {
		return true;
	}

	const proVersion = window.elementorPro?.config?.version;

	if ( ! proVersion ) {
		return false;
	}

	return isVersionGreaterOrEqual( proVersion, MIN_PRO_VERSION_FOR_MENTIONS );
};

const MessageField = () => {
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

const FromEmailField = () => (
	<EmailField
		bind="from"
		label={ __( 'From email', 'elementor' ) }
		placeholder={ __( 'What email should appear as the sender?', 'elementor' ) }
	/>
);

const FromNameField = () => (
	<EmailField
		bind="from-name"
		label={ __( 'From name', 'elementor' ) }
		placeholder={ __( 'What name should appear as the sender?', 'elementor' ) }
	/>
);

const ReplyToField = () => {
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

const CcField = () => <EmailField bind="cc" label={ __( 'Cc', 'elementor' ) } />;

const BccField = () => <EmailField bind="bcc" label={ __( 'Bcc', 'elementor' ) } />;

const MetaDataField = () => (
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

const SendAsField = () => (
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

const AdvancedSettings = () => (
	<CollapsibleContent defaultOpen={ false }>
		<Box sx={ { pt: 2 } }>
			<Stack gap={ 2 }>
				<FromNameField />
				<ReplyToField />
				<CcField />
				<BccField />
				<Divider />
				<MetaDataField />
				<SendAsField />
			</Stack>
		</Box>
	</CollapsibleContent>
);

export const EmailFormActionControl = createControl( ( { toPlaceholder }: { toPlaceholder?: string } ) => {
	const { value, setValue, ...propContext } = useBoundProp( emailPropTypeUtil );

	return (
		<PropProvider { ...propContext } value={ value } setValue={ setValue }>
			<Stack gap={ 2 }>
				<ControlLabel>{ __( 'Email settings', 'elementor' ) }</ControlLabel>
				<SendToField placeholder={ toPlaceholder } />
				<SubjectField />
				<MessageField />
				<FromEmailField />
				<AdvancedSettings />
			</Stack>
		</PropProvider>
	);
} );
