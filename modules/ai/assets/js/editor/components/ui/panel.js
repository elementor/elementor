import { Box, Divider } from '@elementor/ui';

const Panel = ( { sx = {}, ...props } ) => {
	return (
		<>
			<Box
				sx={ {
					height: '100%',
					width: 360,
					p: 4,
					...sx,
				} }
				{ ...props }
			>
				{ props.children }
			</Box>

			<Divider orientation="vertical" />
		</>
	);
};

Panel.propTypes = {
	children: PropTypes.node,
	sx: PropTypes.object,
};

export default Panel;
