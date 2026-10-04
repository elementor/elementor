import { __ } from '@wordpress/i18n';

const UPGRADE_URL = 'https://go.elementor.com/go-pro-mcp-connector-page-upgrade/';

const containerStyle = {
	marginTop: 32,
	padding: '20px 24px',
	border: '1px solid #d5d8dc',
	borderRadius: 4,
	backgroundColor: '#fff',
};

const rowStyle = {
	display: 'flex',
	flexWrap: 'wrap',
	gap: 16,
	alignItems: 'center',
	justifyContent: 'space-between',
};

const titleStyle = {
	margin: 0,
	fontSize: 16,
	fontWeight: 600,
	lineHeight: '24px',
};

const bodyStyle = {
	margin: '4px 0 0',
	fontSize: 14,
	lineHeight: '20px',
	color: '#69727d',
};

const buttonStyle = {
	display: 'inline-block',
	padding: '8px 16px',
	border: '1px solid #93003f',
	borderRadius: 4,
	color: '#93003f',
	textDecoration: 'none',
	fontSize: 14,
	fontWeight: 500,
	whiteSpace: 'nowrap',
};

export default function McpUpgradePromotion() {
	return (
		<div style={ containerStyle }>
			<div style={ rowStyle }>
				<div style={ { minWidth: 0, flex: '1 1 240px' } }>
					<p style={ titleStyle }>{ __( 'Build more with your AI agent', 'elementor' ) }</p>
					<p style={ bodyStyle }>
						{ __(
							'With Pro, your agent can build with Theme Builder, forms, popups, and more advanced Elementor capabilities.',
							'elementor'
						) }
					</p>
				</div>
				<a
					href={ UPGRADE_URL }
					target="_blank"
					rel="noopener noreferrer"
					style={ buttonStyle }
				>
					{ __( 'Upgrade', 'elementor' ) }
				</a>
			</div>
		</div>
	);
}
