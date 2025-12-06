import { Box, IconButton, Typography } from '@elementor/ui';
import ChevronLeftIcon from '@elementor/icons/ChevronLeftIcon';
import SearchIcon from '@elementor/icons/SearchIcon';
import WebsiteIcon from '@elementor/icons/WebsiteIcon';
import PropTypes from 'prop-types';

const SidebarHeader = ( { siteTitle, onCollapse } ) => {
	return (
		<Box
			sx={ {
				position: 'relative',
				px: 2,
				height: 80,
				borderBottom: 1,
				borderColor: 'divider',
				display: 'flex',
				alignItems: 'center',
			} }
		>
			<Box
				sx={ {
					display: 'flex',
					alignItems: 'center',
					gap: 1.5,
					flex: 1,
				} }
			>
				<Box
					sx={ {
						width: 40,
						height: 40,
						borderRadius: 1,
						border: 1,
						borderColor: 'divider',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: 'background.paper',
					} }
				>
					<WebsiteIcon sx={ { fontSize: 24 } } />
				</Box>
				<Typography
					variant="subtitle1"
					sx={ {
						fontWeight: 500,
						flex: 1,
					} }
				>
					{ siteTitle }
				</Typography>
				<SearchIcon sx={ { fontSize: 20, color: 'text.secondary' } } />
			</Box>
			<IconButton
				size="small"
				onClick={ onCollapse }
				sx={ {
					position: 'absolute',
					right: -12,
					bottom: -12,
					width: 24,
					height: 24,
					backgroundColor: 'background.paper',
					border: 1,
					borderColor: 'divider',
					color: 'text.secondary',
					zIndex: 1,
					'&:hover': {
						backgroundColor: 'action.hover',
					},
				} }
			>
				<ChevronLeftIcon sx={ { fontSize: 16 } } />
			</IconButton>
		</Box>
	);
};

SidebarHeader.propTypes = {
	siteTitle: PropTypes.string.isRequired,
	onCollapse: PropTypes.func.isRequired,
};

export default SidebarHeader;

