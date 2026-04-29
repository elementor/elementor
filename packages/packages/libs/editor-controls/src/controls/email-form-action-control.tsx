import * as React from 'react';
import { type KeyboardEvent, type SyntheticEvent, useState } from 'react';
import { emailsPropTypeUtil, stringArrayPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { CollapsibleContent, InfoAlert } from '@elementor/editor-ui';
import { Autocomplete, Box, Chip, Divider, Grid, Stack, TextField } from '@elementor/ui';
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

type EmailChip = { label: string; value: string };

const CHIP_TRIGGER_KEYS = new Set( [ ' ', ',' ] );

const MIN_PRO_VERSION_FOR_MENTIONS = '4.1.0';

export const EmailFormActionControl = createControl(
	( { toPlaceholder, label }: { toPlaceholder?: string; label?: string } ) => {
		const { value, setValue, ...propContext } = useBoundProp( emailsPropTypeUtil );

		return (
			<PropProvider { ...propContext } value={ value } setValue={ setValue }>
				<Stack gap={ 2 }>
					<ControlLabel>
						{ label ? label + ' ' + __( 'settings', 'elementor' ) : __( 'Email settings', 'elementor' ) }
					</ControlLabel>
					<PropKeyProvider bind="to">
						<SendToField placeholder={ toPlaceholder } />
					</PropKeyProvider>
					<SubjectField />
					<MessageField />
					<FromEmailField />
					<AdvancedSettings />
				</Stack>
			</PropProvider>
		);
	}
);

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

const EmailChipsField = ( { fieldLabel, placeholder }: { fieldLabel: string; placeholder?: string } ) => {
	const { value, setValue, disabled } = useBoundProp( stringArrayPropTypeUtil );
	const [ inputValue, setInputValue ] = useState( '' );

	const items = value || [];

	const selectedValues: string[] = items
		.map( ( item ) => stringPropTypeUtil.extract( item ) )
		.filter( ( val ): val is string => val !== null );

	const selectedChips: EmailChip[] = selectedValues.map( ( addr ) => ( { label: addr, value: addr } ) );

	const tryAddChip = ( raw: string ) => {
		const address = raw.trim();

		if ( ! address || selectedValues.includes( address ) || ! isBrowserEmailValid( address ) ) {
			return;
		}

		setValue( [ ...items, stringPropTypeUtil.create( address ) ] );
		setInputValue( '' );
	};

	const handleChange = ( _: SyntheticEvent, newValue: ( EmailChip | string )[] ) => {
		const unique = new Set< string >();
		const updated = [];

		for ( const entry of newValue ) {
			const address = ( typeof entry === 'string' ? entry : entry.value ).trim();

			if ( ! address || unique.has( address ) ) {
				continue;
			}

			const isExisting = selectedValues.includes( address );

			if ( ! isExisting && ! isBrowserEmailValid( address ) ) {
				continue;
			}

			unique.add( address );
			updated.push( stringPropTypeUtil.create( address ) );
		}

		setValue( updated );
		setInputValue( '' );
	};

	const handleBlur = ( event: SyntheticEvent ) => {
		const target = event.target as HTMLInputElement;
		const newValue = target.value;

		tryAddChip( newValue );
		setInputValue( '' );
	};

	const handleKeyDown = ( event: KeyboardEvent< HTMLDivElement > ) => {
		if ( CHIP_TRIGGER_KEYS.has( event.key ) && inputValue.trim() ) {
			event.preventDefault();
			tryAddChip( inputValue );
		}
	};

	return (
		<Grid container direction="column" gap={ 0.5 }>
			<Grid item>
				<ControlFormLabel>{ fieldLabel }</ControlFormLabel>
			</Grid>
			<Grid item>
				<Autocomplete
					fullWidth
					multiple
					freeSolo
					size="tiny"
					disabled={ disabled }
					inputValue={ inputValue }
					onInputChange={ ( _, val, reason ) => {
						if ( reason !== 'reset' ) {
							setInputValue( val );
						}
					} }
					value={ selectedChips }
					onChange={ handleChange }
					options={ [] as EmailChip[] }
					onBlur={ handleBlur }
					getOptionLabel={ ( option ) => ( typeof option === 'string' ? option : option.label ) }
					isOptionEqualToValue={ ( option, val ) => option.value === val.value }
					renderInput={ ( params ) => (
						<TextField { ...params } placeholder={ placeholder } onKeyDown={ handleKeyDown } />
					) }
					renderTags={ ( values, getTagProps ) =>
						values.map( ( option, index ) => {
							const { key, ...chipProps } = getTagProps( { index } );
							const chipLabel = typeof option === 'string' ? option : option.label;
							return <Chip key={ key } size="tiny" label={ chipLabel } { ...chipProps } />;
						} )
					}
				/>
			</Grid>
		</Grid>
	);
};

const SendToField = ( { placeholder }: { placeholder?: string } ) => (
	<EmailChipsField fieldLabel={ __( 'Send to', 'elementor' ) } placeholder={ placeholder } />
);

const SubjectField = () => (
	<EmailField
		bind="subject"
		label={ __( 'Email subject', 'elementor' ) }
		placeholder={ __( 'New form submission', 'elementor' ) }
	/>
);

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

const CcField = () => (
	<PropKeyProvider bind="cc">
		<EmailChipsField fieldLabel={ __( 'Cc', 'elementor' ) } />
	</PropKeyProvider>
);

const BccField = () => (
	<PropKeyProvider bind="bcc">
		<EmailChipsField fieldLabel={ __( 'Bcc', 'elementor' ) } />
	</PropKeyProvider>
);

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

function isBrowserEmailValid( email: string ): boolean {
	const input = document.createElement( 'input' );
	input.type = 'email';
	input.value = email;

	return input.validity.valid;
}

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
