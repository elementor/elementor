import {
	Box,
	Alert,
	Stack,
	Grid,
	Chip,
	ImageList,
	ImageListItem,
	Button,
	InputLabel,
	Typography,
	MenuItem,
	FormControl,
	Select,
} from '@elementor/ui';
import { AIIcon } from '@elementor/icons';

import { useState, useRef } from 'react';

import { createImage, uploadImage } from './api';
import Loader from './components/loader';
import PromptSearch from './components/prompt-search';

const examplePrompts = [
	'Generate an image of a forest at night, with a full moon shining through the trees',
	'Generate an image of a cute cartoon character holding a giant ice cream cone',
	'Generate an image of a majestic eagle soaring through the clouds',
];

const stylePromptsOptions = [
	{ label: 'None', value: '' },
	{ label: 'Realistic photo', value: 'Realistic photo' },
	{ label: 'Art', value: 'Art' },
	{ label: '3D', value: '3D' },
	{ label: 'Pattern', value: 'Pattern' },
	{ label: 'Cartoon', value: 'Cartoon' },
	{ label: 'Watercolor', value: 'Watercolor' },
	{ label: 'Oil painting', value: 'Oil painting' },
	{ label: 'Pencil sketch', value: 'Pencil sketch' },
	{ label: 'Ink drawing', value: 'Ink drawing' },
	{ label: 'Pop art', value: 'Pop art' },
	{ label: 'Vintage', value: 'Vintage' },
	{ label: 'Gothic', value: 'Gothic' },
	{ label: 'Fantasy', value: 'Fantasy' },
	{ label: 'Futuristic', value: 'Futuristic' },
];

const framingPromptsOptions = [
	{ label: 'None', value: '' },
	{ label: 'Close-up', value: 'Close-up' },
	{ label: 'Medium shot', value: 'Medium shot' },
	{ label: 'Long shot', value: 'Long shot' },
	{ label: 'Extreme long shot', value: 'Extreme long shot' },
	{ label: 'Over-the-shoulder shot', value: 'Over-the-shoulder shot' },
	{ label: 'Point-of-view shot', value: 'Point-of-view shot' },
	{ label: 'Top down', value: 'Top down' },
	{ label: 'Dutch angle', value: 'Dutch angle' },
	{ label: 'Bird’s-eye view', value: 'Bird’s-eye view' },
	{ label: 'Worm’s-eye view', value: 'Worm’s-eye view' },
	{ label: 'Two-shot', value: 'Two-shot' },
];

const lightingPromptsOptions = [
	{ label: 'None', value: '' },
	{ label: 'Cinematic lighting', value: 'Cinematic lighting' },
	{ label: 'Natural light', value: 'Natural light' },
	{ label: 'Soft lighting', value: 'Soft lighting' },
	{ label: 'Spotlight', value: 'Spotlight' },
	{ label: 'Backlighting', value: 'Backlighting' },
	{ label: 'Colored lighting', value: 'Colored lighting' },
	{ label: 'Underlighting', value: 'Underlighting' },
	{ label: 'Hard lighting', value: 'Hard lighting' },
];

const colorSchemePromptsOptions = [
	{ label: 'None', value: '' },
	{ label: 'Dark mode', value: 'Dark mode' },
	{ label: 'Pastel', value: 'Pastel' },
	{ label: 'Vibrant', value: 'Vibrant' },
	{ label: 'Monochromatic', value: 'Monochromatic' },
	{ label: 'Earthy', value: 'Earthy' },
	{ label: 'Neon', value: 'Neon' },
	{ label: 'Gradient', value: 'Gradient' },
	{ label: 'Metallic', value: 'Metallic' },
	{ label: 'Muted', value: 'Muted' },
	{ label: 'Bold', value: 'Bold' },
	{ label: 'Sunset', value: 'Sunset' },
	{ label: 'Oceanic', value: 'Oceanic' },
	{ label: 'Grayscale', value: 'Grayscale' },
	{ label: 'Autumn', value: 'Autumn' },
	{ label: 'Winter', value: 'Winter' },
	{ label: 'Spring', value: 'Spring' },
	{ label: 'Summer', value: 'Summer' },
];

const FormMedia = ( { onClose, setControlValue } ) => {
	const [ isLoading, setIsLoading ] = useState( false );

	const [ prompt, setPrompt ] = useState( '' );
	const [ promptStyle, setPromptStyle ] = useState( '' );
	const [ promptFraming, setPromptFraming ] = useState( '' );
	const [ promptLighting, setPromptLighting ] = useState( '' );
	const [ promptColorScheme, setPromptColorScheme ] = useState( '' );

	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ resultPrompt, setResultPrompt ] = useState( '' );

	const showSuggestions = ! prompt;

	const inputField = useRef( null );

	const handleSubmit = async ( event ) => {
		event.preventDefault();

		setIsLoading( true );
		setErrorMessage( '' );

		try {
			let promptString = prompt;

			const additionalPrompts = [];

			if ( promptStyle ) {
				additionalPrompts.push( `styles: ${ promptStyle }` );
			}

			if ( promptFraming ) {
				additionalPrompts.push( `framing: ${ promptFraming }` );
			}

			if ( promptLighting ) {
				additionalPrompts.push( `lighting: ${ promptLighting }` );
			}

			if ( promptColorScheme ) {
				additionalPrompts.push( `color scheme: ${ promptColorScheme }` );
			}

			if ( additionalPrompts.length ) {
				promptString += ` (${ additionalPrompts.join( ', ' ) })`;
			}

			const { result } = await createImage( promptString );

			setResultPrompt( result.data );
		} catch ( error ) {
			setErrorMessage( error?.responseText || error );
		}

		setIsLoading( false );
	};

	const applyPrompt = async ( imageUrl ) => {
		setIsLoading( true );
		setErrorMessage( '' );

		try {
			const imageData = await uploadImage( imageUrl, prompt );

			setControlValue( imageData.image );

			onClose();
		} catch ( error ) {
			setErrorMessage( error?.responseText || error );

			setIsLoading( false );
		}
	};

	if ( isLoading ) {
		return (
			<Loader />
		);
	}

	return (
		<>
			{ errorMessage && (
				<Box>
					<Alert
						severity="error"
						onClose={ () => setErrorMessage( '' ) }
					>
						{ errorMessage }
					</Alert>
				</Box>
			) }
			{ ! resultPrompt && (
				<>
					<Box component="form" onSubmit={ handleSubmit }>
						<Box sx={ { mt: 5, mb: 6 } }>
							<PromptSearch
								ref={ inputField }
								placeholder={ __( 'Describe the image and style you want to create...', 'elementor' ) }
								name="prompt"
								value={ prompt }
								onChange={ ( event ) => setPrompt( event.target.value ) }
							/>
						</Box>

						{ showSuggestions && (
							<Box>
								<Typography	variant="overline">
									{ __( 'Magic suggestions', 'elementor' ) }:
								</Typography>

								<Stack direction="column" alignItems="flex-start" gap={ 3 } sx={ { my: 3 } }>
									{ examplePrompts.map( ( examplePrompt, index ) => (
										<Chip
											key={ index }
											variant="outlined"
											size="large"
											color="secondary"
											label={ examplePrompt }
											onClick={ () => {
												setPrompt( examplePrompt );
												inputField.current.focus();
											} }
										/>
									) ) }
								</Stack>
							</Box>
						) }

						<Grid
							container
							spacing={ 3 }
							sx={ { mt: 6 } }
						>
							<Grid item>
								<FormControl sx={ { width: 138 } }>
									<InputLabel id="image-style">{ __( 'Style', 'elementor' ) }</InputLabel>
									<Select
										labelId="image-style"
										id="image-style"
										color="secondary"
										value=""
										onChange={ ( event ) => setPromptStyle( event.target.value ) }
										size="small"
										label={ __( 'Style', 'elementor' ) }
										MenuProps={ {
											PaperProps: {
												sx: {
													width: 138,
												},
											},
										} }
									>
										{ stylePromptsOptions.map( ( option, index ) => (
											<MenuItem
												key={ index }
												value={ option.value }
												dense
											>
												{ option.label }
											</MenuItem>
										) ) }
									</Select>
								</FormControl>
							</Grid>

							<Grid item>
								<FormControl sx={ { width: 138 } }>
									<InputLabel id="image-framing">{ __( 'Framing', 'elementor' ) }</InputLabel>
									<Select
										labelId="image-framing"
										id="image-framing"
										color="secondary"
										value=""
										onChange={ ( event ) => setPromptFraming( event.target.value ) }
										size="small"
										label={ __( 'Framing', 'elementor' ) }
										MenuProps={ {
											PaperProps: {
												sx: {
													width: 138,
												},
											},
										} }
									>
										{ framingPromptsOptions.map( ( option, index ) => (
											<MenuItem
												key={ index }
												value={ option.value }
												dense
											>
												{ option.label }
											</MenuItem>
										) ) }
									</Select>
								</FormControl>
							</Grid>

							<Grid item>
								<FormControl sx={ { width: 138 } }>
									<InputLabel id="image-lighting">{ __( 'Lighting', 'elementor' ) }</InputLabel>
									<Select
										labelId="image-lighting"
										id="image-lighting"
										color="secondary"
										value=""
										onChange={ ( event ) => setPromptLighting( event.target.value ) }
										size="small"
										label={ __( 'Lighting', 'elementor' ) }
										MenuProps={ {
											PaperProps: {
												sx: {
													width: 138,
												},
											},
										} }
									>
										{ lightingPromptsOptions.map( ( option, index ) => (
											<MenuItem
												key={ index }
												value={ option.value }
												dense
											>
												{ option.label }
											</MenuItem>
										) ) }
									</Select>
								</FormControl>
							</Grid>

							<Grid item>
								<FormControl sx={ { width: 138 } }>
									<InputLabel id="image-color-scheme">{ __( 'Color Scheme', 'elementor' ) }</InputLabel>
									<Select
										labelId="image-color-scheme"
										id="image-color-scheme"
										color="secondary"
										value=""
										onChange={ ( event ) => setPromptColorScheme( event.target.value ) }
										size="small"
										label={ __( 'Color Scheme', 'elementor' ) }
										MenuProps={ {
											PaperProps: {
												sx: {
													width: 138,
												},
											},
										} }
									>
										{ colorSchemePromptsOptions.map( ( option, index ) => (
											<MenuItem
												key={ index }
												value={ option.value }
												dense
											>
												{ option.label }
											</MenuItem>
										) ) }
									</Select>
								</FormControl>
							</Grid>
						</Grid>

						<Stack direction="row" justifyContent="flex-end" gap={ 3 } sx={ { my: 8 } }>
							<Button size="small" endIcon={ <AIIcon /> } variant="contained" color="primary" type="submit">
								{ __( 'Generate Image', 'elementor' ) }
							</Button>
						</Stack>
					</Box>
				</>
			) }
			{ resultPrompt && (
				<Box sx={ { mt: '10px' } }>
					<ImageList cols={ 3 } rowHeight={ 250 }>
						{ resultPrompt.map( ( item, index ) => (
							<ImageListItem
								key={ index }
								sx={ { border: 1, borderColor: 'divider', borderRadius: '.2em', p: '2px', '&:hover': {
										borderColor: 'primary.main',
									},
								} }
							>
								<img
									src={ item.url }
									alt={ `Image ${ index }` }
									loading="lazy"
								/>
								<Button
									variant="contained"
									onClick={ () => applyPrompt( item.url ) }
								>
									{ __( 'Insert', 'elementor' ) }
								</Button>
							</ImageListItem>
						) ) }
					</ImageList>

					<Stack direction="row" justifyContent="flex-end" gap={ 3 } sx={ { my: 8 } }>
						<Button
							label={ __( 'Try again', 'elementor' ) }
							color="primary"
							variant="text"
							size="small"
							onClick={ () => setResultPrompt( '' ) }
						/>
					</Stack>
				</Box>
			) }
		</>
	);
};

export default FormMedia;
