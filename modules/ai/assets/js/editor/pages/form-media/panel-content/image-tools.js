import { Stack, Box, Button, Typography, Link } from '@elementor/ui';
import VariationsIcon from '../../../icons/variations-icon';
import ExpandIcon from '../../../icons/expand-icon';
import BrushIcon from '../../../icons/brush-icon';
import { PANELS } from '../consts/consts';
import ResizeIcon from '../../../icons/resize-icon';
import ChevronLeftIcon from '../../../icons/chevron-left-icon';

const ImageTools = ( {
	setTool,
	generateNewPrompt,
} ) => {
	const tools = [
		{
			label: __( 'Expand Image', 'elementor' ),
			Icon: ExpandIcon,
			onClick: () => setTool( PANELS.UPSCALE ),
		},
		{
			label: __( 'Evolve Image', 'elementor' ),
			Icon: VariationsIcon,
			onClick: () => setTool( PANELS.IMAGE_TO_IMAGE ),
		},
		{
			label: __( 'Generative Fill', 'elementor' ),
			Icon: ResizeIcon,
			onClick: () => setTool( PANELS.OUT_PAINTING ),
		},
		{
			label: __( 'Magic Brush', 'elementor' ),
			Icon: BrushIcon,
			onClick: () => setTool( PANELS.IN_PAINTING ),
		},
	];
	return (
		<Box component="div">
			<Box sx={ { mb: 3 } }>
				<Button
					variant="text"
					onClick={ ( e ) => {
						e.preventDefault();
						generateNewPrompt();
					} }
				>
					{ __( 'Generate', 'elementor' ) }
				</Button>
			</Box>
			<Typography variant="h3" sx={ { mb: 3 } }>
				{ __( 'Edit image with AI', 'elementor' ) }
			</Typography>
			<Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={ 7 } justifyContent={ 'center' }>
				{ tools.map( ( { label, Icon, onClick } ) => (
					<Button
						onClick={ onClick }
						key={ label }
						style={ {
							border: '1px solid #BABFC5',
							borderRadius: '4px',
							color: '#69727D',
							fontSize: '12px',
							padding: '30px',
						} }
					>
						<Box
							display="flex"
							justifyContent="center"
							alignItems="center"
							flexDirection="column"
						>
							<Icon />
							{ label }
						</Box>
					</Button>
				) ) }
			</Box>
		</Box>
	);
};

ImageTools.propTypes = {
	setTool: PropTypes.func.isRequired,
	generateNewPrompt: PropTypes.func.isRequired,
};

export default ImageTools;
