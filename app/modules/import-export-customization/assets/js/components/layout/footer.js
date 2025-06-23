import Paper from '@elementor/ui/Paper';
import Box from '@elementor/ui/Box';
import Stack from '@elementor/ui/Stack';
import PropTypes from 'prop-types';

export default function Footer( props ) {
	const {
		children,
		startContent,
		centerContent,
		endContent,
		sx = {},
		elevation = 1,
		...rest
	} = props;

	// If custom children are provided, use them directly
	if ( children ) {
		return (
			<Paper
				component="footer"
				elevation={ elevation }
				sx={ {
					mt: 'auto',
					py: 2,
					px: 3,
					borderTop: 1,
					borderColor: 'divider',
					...sx,
				} }
				{ ...rest }
			>
				{ children }
			</Paper>
		);
	}

	// Use the three-section layout
	return (
		<Paper
			component="footer"
			elevation={ elevation }
			sx={ {
				mt: 'auto',
				py: 2,
				px: 3,
				borderTop: 1,
				borderColor: 'divider',
				...sx,
			} }
			{ ...rest }
		>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				spacing={ 2 }
			>
				{/* Start Content */}
				<Box sx={ { flex: '0 0 auto' } }>
					{ startContent }
				</Box>

				{/* Center Content */}
				<Box sx={ { flex: '1 1 auto', textAlign: 'center' } }>
					{ centerContent }
				</Box>

				{/* End Content */}
				<Box sx={ { flex: '0 0 auto' } }>
					{ endContent }
				</Box>
			</Stack>
		</Paper>
	);
}

Footer.propTypes = {
	children: PropTypes.node,
	startContent: PropTypes.node,
	centerContent: PropTypes.node,
	endContent: PropTypes.node,
	sx: PropTypes.object,
	elevation: PropTypes.number,
};
