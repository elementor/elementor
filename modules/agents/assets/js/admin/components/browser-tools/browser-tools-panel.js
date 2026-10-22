import Alert from '@elementor/ui/Alert';
import Divider from '@elementor/ui/Divider';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { BrowserToolItem } from './browser-tool-item';

const TOOLS_PER_COLUMN = 3;
const INTRO_MAX_WIDTH = 470;

const splitIntoColumns = ( tools ) => {
	const columns = [];

	for ( let start = 0; start < tools.length; start += TOOLS_PER_COLUMN ) {
		columns.push( tools.slice( start, start + TOOLS_PER_COLUMN ) );
	}

	return columns;
};

export const BrowserToolsPanel = ( { settings, isMarkdownEnabled } ) => {
	const { businessDetails, isAvailable, maxBusinessDetailsLength, saveBusinessDetails, tools } = settings;

	return (
		<Stack spacing={ 5 } pl={ 7 } pr={ 6 } py={ 4 } minWidth={ 0 }>
			{ ! isAvailable && (
				<Alert severity="info">
					{ __( 'Agent browser tools need WordPress 6.9 or later.', 'elementor' ) }
				</Alert>
			) }
			<Stack spacing={ 1 } maxWidth={ INTRO_MAX_WIDTH }>
				<Typography variant="subtitle1">
					{ __( 'Help agents find answers on your site when browsing', 'elementor' ) }
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{ __( 'Let AI agents search your public content, understand your site’s structure, and retrieve page and business information. Powered by WebMCP tools.', 'elementor' ) }
				</Typography>
			</Stack>
			<Stack spacing={ 2 }>
				<Typography variant="subtitle1">{ __( 'Read-only tools', 'elementor' ) }</Typography>
				<Stack direction="row" spacing={ 4 }>
					{ splitIntoColumns( tools ).map( ( column, index ) => (
						<Stack
							key={ index }
							spacing={ 2 }
							flexGrow={ 1 }
							flexShrink={ 1 }
							flexBasis={ 0 }
							minWidth={ 0 }
							divider={ <Divider /> }
						>
							{ column.map( ( tool ) => (
								<BrowserToolItem
									key={ tool.name }
									tool={ tool }
									businessDetails={ businessDetails }
									maxBusinessDetailsLength={ maxBusinessDetailsLength }
									onSaveBusinessDetails={ saveBusinessDetails }
									isMarkdownEnabled={ isMarkdownEnabled }
								/>
							) ) }
						</Stack>
					) ) }
				</Stack>
			</Stack>
		</Stack>
	);
};

BrowserToolsPanel.propTypes = {
	settings: PropTypes.shape( {
		businessDetails: PropTypes.string,
		isAvailable: PropTypes.bool.isRequired,
		maxBusinessDetailsLength: PropTypes.number,
		saveBusinessDetails: PropTypes.func,
		tools: PropTypes.arrayOf( PropTypes.object ).isRequired,
	} ).isRequired,
	isMarkdownEnabled: PropTypes.bool.isRequired,
};
