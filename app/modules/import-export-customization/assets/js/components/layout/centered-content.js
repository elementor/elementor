import { Box } from '@elementor/ui';

const DEFAULT_OFFSET_WITHOUT_FOOTER = 120;
const DEFAULT_OFFSET_WITH_FOOTER = 180;

export default function CenteredContent( {
	children,
	hasFooter = false,
	offsetHeight,
	maxWidth = '600px',
} ) {
	const calculatedOffset = offsetHeight || ( hasFooter ? DEFAULT_OFFSET_WITH_FOOTER : DEFAULT_OFFSET_WITHOUT_FOOTER );

	return (
		<Box sx={ {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			minHeight: `calc(100vh - ${ calculatedOffset }px)`,
			p: 3,
		} }>
			<Box sx={ {
				maxWidth,
				textAlign: 'center',
				width: '100%',
			} }>
				{ children }
			</Box>
		</Box>
	);
}
