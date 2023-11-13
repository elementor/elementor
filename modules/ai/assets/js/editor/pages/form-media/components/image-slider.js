import { Stack, IconButton, Box, withDirection } from '@elementor/ui';
import PropTypes from 'prop-types';
import ChevronLeftIcon from '../../../icons/chevron-left-icon';
import ChevronRightIcon from '../../../icons/chevron-right-icon';

const StyledChevronLeftIcon = withDirection( ChevronLeftIcon );
const StyledChevronRightIcon = withDirection( ChevronRightIcon );

const ImageSlider = ( { onPrev, onNext, children, ...props } ) => {
	return (
		<Stack alignItems="flex-start" spacing={ 0.5 } { ...props }>
			<Stack direction="row" spacing={ 2.5 } alignSelf="center" alignItems="center">
				<IconButton onClick={ onPrev } size="large" color="secondary">
					<StyledChevronLeftIcon />
				</IconButton>

				<Stack spacing={ 0.5 } justifyContent="space-around" alignItems="center">
					{ children }
				</Stack>

				<IconButton onClick={ onNext } size="large" color="secondary">
					<StyledChevronRightIcon />
				</IconButton>
			</Stack>
		</Stack>
	);
};

ImageSlider.propTypes = {
	onPrev: PropTypes.func.isRequired,
	onNext: PropTypes.func.isRequired,
	children: PropTypes.node.isRequired,
};

const Actions = ( { children, startAction, sx = {}, ...props } ) => (
	<Box display="flex" justifyContent="flex-end" alignItems="center" width="100%" { ...props } sx={ { mb: 1.5, ...sx } }>
		{ startAction }

		<Stack direction="row" spacing={ 2 } justifyContent="flex-end" flexGrow={ 1 } width="100%">
			{ children }
		</Stack>
	</Box>
);

Actions.propTypes = {
	sx: PropTypes.object,
	startAction: PropTypes.node,
	children: PropTypes.node.isRequired,
};

const Image = ( { src, alt = '', ...props } ) => (
	<Box
		display="flex"
		justifyContent="center"
		alignItems="center"
	>
		<img src={ src } alt={ alt } { ...props } />
	</Box>
);

Image.propTypes = {
	alt: PropTypes.string,
	src: PropTypes.string.isRequired,
};

ImageSlider.Actions = Actions;
ImageSlider.Image = Image;

export default ImageSlider;
