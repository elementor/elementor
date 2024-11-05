import { Box, Button, IconButton, Tooltip as TooltipBase, withDirection } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { default as CopySvgIcon } from '../../../icons/copy-icon';
import { default as EditSvgIcon } from '../../../icons/edit-icon';
import DownloadIcon from '../../../icons/download-icon';
import ZoomInIcon from '../../../icons/zoom-in-icon';

const StyledEditSvgIcon = withDirection( EditSvgIcon );
const StyledCopySvgIcon = withDirection( CopySvgIcon );
const StyledZoomInIcon = withDirection( ZoomInIcon );

const Tooltip = ( props ) => {
	return (
		<TooltipBase
			PopperProps={ {
				sx: {
					'&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom': {
						mt: 1,
					},
				},
			} }
			{ ...props }
		/>
	);
};

const ImageActions = ( { children, ...props } ) => {
	return (
		<Box display="flex" justifyContent="space-between" alignItems="center" width="100%" gap={ 1 } { ...props }>
			{ children }
		</Box>
	);
};

ImageActions.propTypes = {
	children: PropTypes.node,
};

const UseImage = ( { sx, ...props } ) => (
	<Button
		size="small"
		variant="contained"
		startIcon={ <DownloadIcon /> }
		sx={ sx }
		{ ...props }
	>
		{ __( 'Use Image', 'elementor' ) }
	</Button>
);

UseImage.propTypes = {
	sx: PropTypes.object,
};

const EditImage = ( props ) => (
	<Button
		size="small"
		color="secondary"
		startIcon={ <StyledEditSvgIcon /> }
		{ ...props }
	>
		{ __( 'Edit', 'elementor' ) }
	</Button>
);

const EditIcon = ( { sx = {}, ...props } ) => (
	<Tooltip title={ __( 'Edit', 'elementor' ) }>
		<IconButton
			sx={ { mr: -1.5, ml: 0.5, color: 'common.white', '&:hover': { color: 'common.white' }, ...sx } }
			{ ...props }
		>
			<StyledEditSvgIcon />
		</IconButton>
	</Tooltip>
);

EditIcon.propTypes = {
	sx: PropTypes.object,
};

const ZoomIcon = ( { sx = {}, ...props } ) => (
	<Tooltip title={ __( 'Zoom', 'elementor' ) }>
		<IconButton
			color="secondary"
			aria-label={ __( 'Zoom', 'elementor' ) }
			sx={ { color: 'common.white', '&:hover': { color: 'common.white' }, ...sx } }
			{ ...props }
		>
			<StyledZoomInIcon />
		</IconButton>
	</Tooltip>
);

ZoomIcon.propTypes = {
	sx: PropTypes.object,
};

const CopyIcon = ( { sx = {}, ...props } ) => (
	<Tooltip title={ __( 'Copy prompt', 'elementor' ) }>
		<IconButton
			sx={ { mr: -1.5, ml: 0.5, color: 'common.white', '&:hover': { color: 'common.white' }, ...sx } }
			{ ...props }
		>

			<StyledCopySvgIcon />
		</IconButton>
	</Tooltip>
);

CopyIcon.propTypes = {
	sx: PropTypes.object,
};

ImageActions.UseImage = UseImage;
ImageActions.EditImage = EditImage;
ImageActions.EditIcon = EditIcon;
ImageActions.ZoomIcon = ZoomIcon;
ImageActions.CopyIcon = CopyIcon;

export default ImageActions;
