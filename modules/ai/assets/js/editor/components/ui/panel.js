import { Box, Divider } from '@elementor/ui';

const Panel = ( { sx = {}, ...props } ) => {
	return (
		<>
			<Box
				sx={ {
					p: 4,
					width: 360,
					flexShrink: 0,
					height: '100%',
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
