import PromptActionSelection from '../../../components/prompt-action-selection';
import { __ } from '@wordpress/i18n';
import { IMAGE_PROMPT_CATEGORIES } from '../constants';
import { Stack, styled, Chip as ChipBase } from '@elementor/ui';
import useIntroduction from '../../../hooks/use-introduction';
import PropTypes from 'prop-types';

const StyledNewChip = styled( ChipBase )( () => ( {
	'& .MuiChip-label': {
		fontSize: '0.75rem',
		fontWeight: 'normal',
	},
} ) );

const showLabel = ( label, key, isViewed, markAsViewed ) => {
	if ( isViewed ) {
		return { label, value: key };
	}

	return {
		label: (
			<Stack direction="row" width="100%" justifyContent="space-between" alignItems="center">
				{ label }
				<StyledNewChip
					label="New"
					color="info"
					variant="standard"
					size="tiny"
				/>
			</Stack>
		),
		value: key,
		onClick: () => markAsViewed(),
	};
};

const changeImageType = ( e, props, markVectorAsViewed ) => {
	if ( 'vector' === e.target.value ) {
		markVectorAsViewed();
	}
	if ( props.onChange ) {
		props.onChange( e );
	}
};

const ImageTypeSelect = ( props ) => {
	const { isViewed: isVectorViewed, markAsViewed: markVectorAsViewed } = useIntroduction( 'e-ai-image-vector-option' );

	const imageTypesWithNewChip = Object.entries( IMAGE_PROMPT_CATEGORIES ).map( ( [ key, { label } ] ) => {
		if ( 'vector' === key ) {
			return showLabel( label, key, isVectorViewed, markVectorAsViewed );
		}
		return { label, value: key };
	} );

	return (
		<PromptActionSelection
			options={ imageTypesWithNewChip }
			wrapperStyle={ { width: '100%' } }
			label={ __( 'Image type', 'elementor' ) }
			{ ...props }
			onChange={ ( e ) => {
				changeImageType( e, props, markVectorAsViewed );
			} }
		/>
	);
};

ImageTypeSelect.propTypes = {
	onChange: PropTypes.func,
	value: PropTypes.string,
	disabled: PropTypes.bool,
};

export default ImageTypeSelect;
