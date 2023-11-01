import { Dialog, DialogContent } from '@elementor/ui';
import PropTypes from 'prop-types';

export const UrlDialog = ( props ) => {
	return (
		<Dialog
			open={ true }
			fullScreen={ true }
			hideBackdrop={ true }
			maxWidth="md"
			sx={ {
				'& .MuiPaper-root': {
					backgroundColor: 'transparent',
				},
			} }
		>
			<DialogContent
				sx={ {
					padding: 0,
				} }
			>
				<iframe
					title={ props.title }
					src={ props.iframeSource }
					style={ {
						border: 'none',
						overflow: 'scroll',
						width: '100%',
						height: '100%',
						backgroundColor: 'rgba(255,255,255,0.6)',
					} }
				/>
			</DialogContent>
		</Dialog>
	);
};

UrlDialog.propTypes = {
	title: PropTypes.string.isRequired,
	iframeSource: PropTypes.string.isRequired,
};
