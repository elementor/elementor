import * as React from 'react';
import { emailPropTypeUtil } from '@elementor/editor-props';
import { CollapsibleContent } from '@elementor/editor-ui';
import { Box, Divider, Grid, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { ControlLabel } from '../components/control-label';
import { createControl } from '../create-control';
import { ChipsControl } from './chips-control';
import { SelectControl } from './select-control';
import { TextAreaControl } from './text-area-control';
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

const SendToField = () => (
	<EmailField
		bind="to"
		label={ __( 'Send To', 'elementor' ) }
		placeholder={ __( 'Where should we send new submissions?', 'elementor' ) }
	/>
);

const SubjectField = () => (
	<EmailField
		bind="subject"
		label={ __( 'Email Subject', 'elementor' ) }
		placeholder={ __( 'New form submission', 'elementor' ) }
	/>
);

const MessageField = () => (
	<PropKeyProvider bind="message">
		<Grid container direction="column" gap={ 0.5 }>
			<Grid item>
				<ControlFormLabel>{ __( 'Message', 'elementor' ) }</ControlFormLabel>
			</Grid>
			<Grid item>
				<TextAreaControl
					placeholder={ __(
						'By default, all form fields are sent via [all-fields] shortcode.',
						'elementor'
					) }
				/>
			</Grid>
		</Grid>
	</PropKeyProvider>
);

const FromEmailField = () => (
	<EmailField
		bind="from"
		label={ __( 'From email', 'elementor' ) }
		placeholder={ __( 'What email address should appear as the sender?', 'elementor' ) }
	/>
);

const FromNameField = () => (
	<EmailField
		bind="from-name"
		label={ __( 'From name', 'elementor' ) }
		placeholder={ __( 'What name should appear as the sender?', 'elementor' ) }
	/>
);

const ReplyToField = () => <EmailField bind="reply-to" label={ __( 'Reply-to', 'elementor' ) } />;

const CcField = () => <EmailField bind="cc" label={ __( 'Cc', 'elementor' ) } />;

const BccField = () => <EmailField bind="bcc" label={ __( 'Bcc', 'elementor' ) } />;

const MetaDataField = () => (
	<PropKeyProvider bind="meta-data">
		<Stack gap={ 0.5 }>
			<ControlLabel>{ __( 'Meta data', 'elementor' ) }</ControlLabel>
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

export const EmailFormActionControl = createControl( () => {
	const { value, setValue, ...propContext } = useBoundProp( emailPropTypeUtil );

	return (
		<PropProvider { ...propContext } value={ value } setValue={ setValue }>
			<Stack gap={ 2 }>
				<ControlFormLabel>{ __( 'Email settings', 'elementor' ) }</ControlFormLabel>
				<SendToField />
				<SubjectField />
				<MessageField />
				<FromEmailField />
				<AdvancedSettings />
			</Stack>
		</PropProvider>
	);
} );
