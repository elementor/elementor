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
					width: 300,
					px: 8,
					pt: 10,
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
