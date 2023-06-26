import { Drawer } from '@elementor/ui';

const Panel = ( { sx = {}, ...props } ) => {
	return (
		<Drawer
			open={ true }
			anchor="left"
			variant="persistent"
			PaperProps={ {
				sx: {
					position: 'relative',
					width: 360,
					px: 8,
					pt: 8,
					bgcolor: 'background.default',
				},
			} }
			sx={ { height: '100%', ...sx } }
			{ ...props }
		>
			{ props.children }
		</Drawer>
	);
};

Panel.propTypes = {
	children: PropTypes.node,
	sx: PropTypes.object,
};

export default Panel;
