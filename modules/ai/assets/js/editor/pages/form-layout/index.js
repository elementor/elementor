import { useState, useRef, useEffect } from 'react';
import { Box, Stack, CircularProgress, Typography } from '@elementor/ui';
import PromptSearch from '../../components/prompt-search';
import GenerateSubmit from '../form-media/components/generate-submit';
import EnhanceButton from '../form-media/components/enhance-button';
import PromptErrorMessage from '../../components/prompt-error-message';
import useLayoutPrompt from './hooks/use-layout-prompt';
import usePromptEnhancer from '../form-media/hooks/use-image-prompt-enhancer';

const FormLayout = ( { onClose, onInsert, onGenerated } ) => {
	const { data, isLoading: isGenerating, error, send, sendUsageData } = useLayoutPrompt();

	const [ generatedData, setGeneratedData ] = useState( [] );

	const [ prompt, setPrompt ] = useState( '' );

	const { isEnhancing, enhance } = usePromptEnhancer();

	const [ isCreatingScreenshots, setIsCreatingScreenshots ] = useState( false );

	const lastRun = useRef( () => {} );

	const isLoading = isGenerating || isEnhancing || isCreatingScreenshots;

	const handleSubmit = ( event ) => {
		event.preventDefault();

		lastRun.current = () => send( prompt );

		lastRun.current();
	};

	const handleEnhance = () => {
		enhance( prompt ).then( ( { result } ) => setPrompt( result ) );
	};

	const applyPrompt = () => {
		sendUsageData();

		console.log( 'Inserting the generated layout to the editor..' );

		onClose();
	};

	useEffect( () => {
		if ( data?.result ) {
			setIsCreatingScreenshots( true );

			const templates = data.result.map( JSON.parse );

			onGenerated( templates ).then( ( newData ) => {
				setGeneratedData( newData );
				setIsCreatingScreenshots( false );
			} );
		}
	}, [ data ] );

	return (
		<>
			{ error && <PromptErrorMessage error={ error } onRetry={ lastRun.current } sx={ { mb: 6 } } /> }

			<Box component="form" onSubmit={ handleSubmit }>
				<Stack direction="row" alignItems="flex-start" gap={ 3 }>
					<PromptSearch
						name="prompt"
						value={ prompt }
						disabled={ isLoading }
						InputProps={ { autoComplete: 'off' } }
						onChange={ ( event ) => setPrompt( event.target.value ) }
						sx={ {
							'& .MuiOutlinedInput-notchedOutline': { borderRadius: '4px' },
							'& .MuiInputBase-root.MuiOutlinedInput-root, & .MuiInputBase-root.MuiOutlinedInput-root:focus': {
								px: 4,
								py: 0,
							},
						} }
						placeholder={ __( 'Describe the desired layout you want to generate...', 'elementor' ) }
						multiline
						maxRows={ 3 }
					/>

					<EnhanceButton
						size="medium"
						disabled={ isLoading || '' === prompt }
						isLoading={ isEnhancing }
						onClick={ enhance }
					/>

					<GenerateSubmit
						fullWidth={ false }
						disabled={ isLoading || '' === prompt }
						sx={ {
							minWidth: '100px',
							borderRadius: '4px',
						} }
					>
						{
							isLoading && ! isEnhancing
								? <CircularProgress color="secondary" size={ 16 } />
								: __( 'Generate', 'elementor' ) }
					</GenerateSubmit>
				</Stack>
			</Box>

			{
				generatedData.length > 0 && (
					<Box sx={ { mt: 6 } }>
						<Typography variant="h6" sx={ { mb: 1 } }>{ __( 'Suggested Images:', 'elementor' ) }</Typography>

						<Stack direction="row" alignItems="center" gap={ 3 }>
							{ generatedData.map( ( { screenshot, template } ) => (
								<Box
									key={ screenshot }
									onClick={ () => {
										onInsert( template );
										onClose();
									} }
									sx={ {
										boxSizing: 'border-box',
										'&:hover': { border: '1px solid black', cursor: 'pointer' },
									} }
								>
									<img
										src={ screenshot }
										alt=""
										width={ 280 }
										height={ 100 }
									/>
								</Box>
							) ) }
						</Stack>
					</Box>
				)
			}
		</>
	);
};

FormLayout.propTypes = {
	onClose: PropTypes.func.isRequired,
	onInsert: PropTypes.func.isRequired,
	onGenerated: PropTypes.func.isRequired,
};

export default FormLayout;
