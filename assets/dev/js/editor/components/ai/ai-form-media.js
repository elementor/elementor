import {
	TextField,
	Typography,
	Button,
	ImageList,
	ImageListItem,
} from '@elementor/ui';
import { useState, useRef } from 'react';

const AiFormMedia = ( { controlView, onClose } ) => {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ resultPrompt, setResultPrompt ] = useState( '' );
	const [ vibe, setVibe ] = useState( 'happy' );

	const handleVibeChange = ( event ) => setVibe( event.target.value );

	const inputRef = useRef( null );

	const getPromptText = async ( prompt ) => {
		const requestOptions = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + String( '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' ),
			},
			body: JSON.stringify( {
				prompt,
				n: 5,
				size: '256x256',
			} ),
		};

		const response = await fetch( 'https://api.openai.com/v1/images/generations', requestOptions );
		const data = await response.json();

		return data.data;
	};

	const fetchPrompt = async () => {
		setIsLoading( true );

		const resultPrompt = await getPromptText( inputRef.current.value, vibe );

		setResultPrompt( resultPrompt );
		setIsLoading( false );
	};

	const applyPrompt = () => {
		controlView.setSettingsModel( resultPrompt );
		controlView.applySavedValue();

		onClose();
	};

	return (
		<>
			<Typography>
				{ __( 'AI Form Media', 'elementor' ) }
			</Typography>
			<TextField
				multiline
				fullWidth
				minRows={ 5 }
				ref={ inputRef }
				disabled={ isLoading }
			/>
			<Button variant="contained" onClick={ fetchPrompt } disabled={ isLoading }>
				{ __( 'Submit', 'elementor' ) }
			</Button>

			{ resultPrompt && (
				<ImageList sx={ { width: 500, height: 450 } } cols={ 3 } rowHeight={ 164 }>
					{ resultPrompt.map( ( item, index ) => (
						<ImageListItem
							key={ index }
							onClick={ () => {
								console.log( item.url );
							} }
						>
							<img
								src={ item.url }
								alt={ `${ index } Image` }
								loading="lazy"
							/>
						</ImageListItem>
					) ) }
				</ImageList>
			) }
		</>
	);
};

export default AiFormMedia;
