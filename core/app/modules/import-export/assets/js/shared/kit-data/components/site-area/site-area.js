import Text from 'elementor-app/ui/atoms/text';
import Icon from 'elementor-app/ui/atoms/icon';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

export default function SiteArea( { text, link } ) {
	const eventTracking = ( command ) => {
		appsEventTrackingDispatch(
			command,
			{
				site_area: text,
				event: 'open site area in a new tab',
				source: 'import complete',
			},
		);
	};
	return (
		<InlineLink url={ link } color="secondary" underline="none" onClick={ () => eventTracking( 'kit-library/open-site-area' ) }>
			<Text className="e-app-import-export-kit-data__site-area">
				{ text } { link && <Icon className="eicon-editor-external-link" /> }
			</Text>
		</InlineLink>
	);
}

SiteArea.propTypes = {
	text: PropTypes.string,
	link: PropTypes.string,
};
