import { Typography, Link } from '@elementor/ui';
import PropTypes from 'prop-types';

export default function ExportCompleteDownloadLink( { onDownloadClick } ) {
	return (
		<Typography variant="body2" color="text.secondary">
			{ __( 'Is the automatic download not starting?', 'elementor' ) }{ ' ' }
			<Link href="#" onClick={ onDownloadClick } sx={ { cursor: 'pointer', textDecoration: 'underline' } }>
				{ __( 'Download manually', 'elementor' ) }
			</Link>
			{ '. ' }
		</Typography>
	);
}

ExportCompleteDownloadLink.propTypes = {
	onDownloadClick: PropTypes.func.isRequired,
};
