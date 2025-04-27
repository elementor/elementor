import { Box, Paper, Stack, TextField } from '@elementor/ui';
import Typography from '@elementor/ui/Typography';
import Button from '@elementor/ui/Button';
import PropTypes from 'prop-types';
import { useState } from 'react';

const AiSiteCreator = ( { ...props } ) => {
	const { aiCreatorData } = props;
	const [ inputValue, setInputValue ] = useState( '' );

	if ( ! aiCreatorData ) {
		return null;
	}

	const {
		title,
		description,
		input_placeholder: inputPlaceholder,
		button_title: buttonTitle,
		button_cta_url: buttonCtaUrl,
		background_image: backgroundImage,
	} = aiCreatorData;

	const handleInputChange = ( event ) => {
		setInputValue( event.target.value );
	};

	const getButtonHref = () => {
		if ( ! inputValue ) {
			return buttonCtaUrl;
		}
		const url = new URL( buttonCtaUrl );
		url.searchParams.append( 'prompt', inputValue );
		return url.toString();
	};

	return (
		<Paper
			elevation={ 0 }
			sx={ {
				display: 'flex',
				flexDirection: 'column',
				py: 3,
				px: 4,
				gap: 2,
				border: '1px solid #E5E5E5',
				borderRadius: 1,
				boxShadow: 'none',
				backgroundImage: `url(${ backgroundImage })`,
				backgroundSize: 'auto',
				backgroundPosition: 'center',
			} }
		>
			<Stack gap={ 1 } justifyContent="center">
				<Typography variant="h6">{ title }</Typography>
				<Typography variant="body2" color="secondary">{ description }</Typography>
			</Stack>
			<Box sx={ { display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 1 } }>
				<TextField
					fullWidth
					placeholder={ inputPlaceholder }
					variant="outlined"
					size="medium"
					sx={ { flex: 1 } }
					value={ inputValue }
					onChange={ handleInputChange }
				/>
				<Button
					variant="outlined"
					size="small"
					color="secondary"
					startIcon={ <span className="eicon-ai"></span> }
					href={ getButtonHref() }
					target="_blank"
				>
					{ buttonTitle }
				</Button>
			</Box>
		</Paper>
	);
};

AiSiteCreator.propTypes = {
	aiCreatorData: PropTypes.object.isRequired,
};

export default AiSiteCreator;
