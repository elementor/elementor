import Text from 'elementor-app/ui/atoms/text';
import Icon from 'elementor-app/ui/atoms/icon';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import { eventTrackingDispatch } from 'elementor-app/event-track/events';

export default function SiteArea( { text, link } ) {
	const goToSitePartEventTracking = () => {
		eventTrackingDispatch(
			'kit-library/open-site-area',
			{
				site_area: text,
				event: 'open site area in a new tab',
				source: 'import complete',
			},
		);
	}
	return (
		<InlineLink url={ link } color="secondary" underline="none" onLinkClick={ () => goToSitePartEventTracking() }>
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
