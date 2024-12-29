import { useState, useRef, forwardRef, useEffect } from 'react';
import { Box, Stack, IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import PromptAutocomplete from './prompt-autocomplete';
import EnhanceButton from '../../form-media/components/enhance-button';
import GenerateSubmit from '../../form-media/components/generate-submit';
import ArrowLeftIcon from '../../../icons/arrow-left-icon';
import EditIcon from '../../../icons/edit-icon';
import usePromptEnhancer from '../../../hooks/use-prompt-enhancer';
import Attachments from './attachments';
import { useConfig } from '../context/config';
import { AttachmentPropType } from '../../../types/attachment';

const PROMPT_SUGGESTIONS = Object.freeze( [
	// Translators: [Topic] is a placeholder for the user - please translate it as well
	{ text: __( 'Hero section on [topic] with heading, text, buttons on the right, and an image on the left', 'elementor.com' ) },
	// Translators: [Topic] is a placeholder for the user - please translate it as well
	{ text: __( 'About Us section on [topic] with heading, text, and big image below', 'elementor.com' ) },
	{ text: __( 'Team section with four image boxes showcasing team members', 'elementor.com' ) },
	// Translators: [Topic] is a placeholder for the user - please translate it as well
	{ text: __( 'FAQ section with a toggle widget showcasing FAQs about [topic]', 'elementor.com' ) },
	{ text: __( 'Gallery section with a carousel displaying three images at once', 'elementor.com' ) },
	// Translators: [Topic] is a placeholder for the user - please translate it as well
	{ text: __( 'Contact section with a form for [topic]', 'elementor.com' ) },
	{ text: __( 'Client section featuring companies\' logos', 'elementor.com' ) },
	// Translators: [Topic] is a placeholder for the user - please translate it as well
	{ text: __( 'Testimonial section with testimonials, each featuring a star rating and an image', 'elementor.com' ) },
	// Translators: [Topic] is a placeholder for the user - please translate it as well
	{ text: __( 'Service section about [topic], showcasing four services with buttons', 'elementor.com' ) },
	// Translators: [Topic] is a placeholder for the user - please translate it as well
	{ text: __( 'Stats section with counters displaying data about [topic]', 'elementor.com' ) },
	{ text: __( 'Quote section with colored background, featuring a centered quote', 'elementor.com' ) },
	// Translators: [Topic] is a placeholder for the user - please translate it as well
	{ text: __( 'Pricing section for [topic] with a pricing list', 'elementor.com' ) },
	// Translators: [Topic] is a placeholder for the user - please translate it as well
	{ text: __( 'Subscribe section featuring a simple email form, inviting users to stay informed on [topic]', 'elementor.com' ) },
] );

const IconButtonWithTooltip = ( { tooltip, ...props } ) => (
	<Tooltip title={ tooltip }>
		<Box component="span" sx={ { cursor: props.disabled ? 'default' : 'pointer' } }>
			<IconButton { ...props } />
		</Box>
	</Tooltip>
);

IconButtonWithTooltip.propTypes = {
	tooltip: PropTypes.string,
	disabled: PropTypes.bool,
};

const BackButton = ( props ) => (
	<IconButtonWithTooltip size="small" color="secondary" tooltip={ __( 'Back to results', 'elementor' ) } { ...props }>
		<ArrowLeftIcon />
	</IconButtonWithTooltip>
);

const EditButton = ( props ) => (
	<IconButtonWithTooltip
		size="small"
		color="primary"
		tooltip={ __( 'Edit prompt', 'elementor' ) }
		{ ...props }
	>
		<EditIcon />
	</IconButtonWithTooltip>
);

const GenerateButton = ( props ) => (
	<GenerateSubmit
		size="small"
		fullWidth={ false }
		{ ...props }
	>
		{ __( 'Generate', 'elementor' ) }
	</GenerateSubmit>
);

const PromptForm = forwardRef( ( {
	attachments,
	isActive,
	isLoading,
	showActions = false,
	onAttach,
	onDetach,
	onSubmit,
	onBack,
	onEdit,
	shouldResetPrompt = false,
}, ref ) => {
	const [ prompt, setPrompt ] = useState( '' );
	useEffect( () => {
		if ( shouldResetPrompt ) {
			setPrompt( '' );
		}
	}, [ shouldResetPrompt ] );
	const { isEnhancing, enhance } = usePromptEnhancer( prompt, 'layout' );
	const previousPrompt = useRef( '' );
	const { attachmentsTypes } = useConfig();

	const isInputDisabled = isLoading || isEnhancing || ! isActive;
	const isInputEmpty = '' === prompt && ! attachments.length;
	const isGenerateDisabled = isInputDisabled || isInputEmpty;

	const attachmentsType = attachments[ 0 ]?.type || '';
	const attachmentsConfig = attachmentsTypes[ attachmentsType ];
	const promptSuggestions = attachmentsConfig?.promptSuggestions || PROMPT_SUGGESTIONS;
	const promptPlaceholder = attachmentsConfig?.promptPlaceholder || __( "Press '/' for suggested prompts or describe the layout you want to create", 'elementor' );

	const handleBack = () => {
		setPrompt( previousPrompt.current );
		onBack();
	};

	const handleEdit = () => {
		previousPrompt.current = prompt;
		onEdit();
	};

	return (
		<Stack
			component="form"
			onSubmit={ ( e ) => onSubmit( e, prompt ) }
			direction="row"
			sx={ { p: 3 } }
			alignItems="start"
			gap={ 1 }
		>
			<Stack direction="row" alignItems="start" flexGrow={ 1 } spacing={ 2 }>
				{
					showActions && (
						isActive ? (
							<BackButton disabled={ isLoading || isEnhancing } onClick={ handleBack } />
						) : (
							<EditButton disabled={ isLoading } onClick={ handleEdit } />
						)
					)
				}

				<Attachments
					attachments={ attachments }
					onAttach={ onAttach }
					onDetach={ onDetach }
					disabled={ isInputDisabled }
				/>

				<PromptAutocomplete
					value={ prompt }
					disabled={ isInputDisabled }
					onSubmit={ ( e ) => onSubmit( e, prompt ) }
					options={ promptSuggestions }
					onChange={ ( _, selectedValue ) => setPrompt( selectedValue.text + ' ' ) }
					renderInput={ ( params ) => (
						<PromptAutocomplete.TextInput
							{ ...params }
							ref={ ref }
							onChange={ ( e ) => setPrompt( e.target.value ) }
							placeholder={ promptPlaceholder }
						/>
					) }
				/>
			</Stack>

			<EnhanceButton
				size="small"
				disabled={ isGenerateDisabled || '' === prompt }
				isLoading={ isEnhancing }
				onClick={ () => enhance().then( ( { result } ) => setPrompt( result ) ) }
			/>

			<GenerateButton disabled={ isGenerateDisabled } />
		</Stack>
	);
} );

PromptForm.propTypes = {
	isActive: PropTypes.bool,
	onAttach: PropTypes.func,
	onDetach: PropTypes.func,
	isLoading: PropTypes.bool,
	showActions: PropTypes.bool,
	onSubmit: PropTypes.func.isRequired,
	onBack: PropTypes.func.isRequired,
	onEdit: PropTypes.func.isRequired,
	attachments: PropTypes.arrayOf( AttachmentPropType ),
	shouldResetPrompt: PropTypes.bool,
};

export default PromptForm;
