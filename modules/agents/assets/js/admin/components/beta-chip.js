import Chip from '@elementor/ui/Chip';
import { __ } from '@wordpress/i18n';

export const BetaChip = () => (
	<Chip size="tiny" shape="rounded" variant="outlined" label={ __( 'Beta', 'elementor' ) } />
);
