import Content from 'elementor-app/layout/content';
import ElementorLoading from 'elementor-app/molecules/elementor-loading';
import ItemHeader from '../../components/item-header';
import Layout from '../../components/layout';
import OverviewContentGroup from './overview-content-group';
import OverviewSidebar from './overview-sidebar';
import useKit from '../../hooks/use-kit';
import useKitDocumentByType from '../../hooks/use-kit-document-by-type';
import usePageTitle from 'elementor-app/hooks/use-page-title';
import { useMemo } from 'react';
import { useNavigate } from '@reach/router';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

import './overview.scss';

function useHeaderButtons( id, kitName ) {
	const navigate = useNavigate();

	return useMemo( () => [
		{
			id: 'view-demo',
			text: __( 'View Demo', 'elementor' ),
			hideText: false,
			variant: 'outlined',
			color: 'secondary',
			size: 'sm',
			onClick: () => {
				appsEventTrackingDispatch(
					'kit-library/view-demo-page',
					{
						kit_name: kitName,
						page_source: 'overview',
						element_position: 'app_header',
						view_type_clicked: 'demo',
					},
				);
				navigate( `/kit-library/preview/${ id }` );
			},
			includeHeaderBtnClass: false,
		},
	], [ id ] );
}

export default function Overview( props ) {
	const { data: kit, isError, isLoading } = useKit( props.id );
	const { data: documentsByType } = useKitDocumentByType( kit );
	const headerButtons = useHeaderButtons( props.id, kit && kit.title );

	usePageTitle( {
		title: kit
			? `${ __( 'Kit Library', 'elementor' ) } | ${ kit.title }`
			// eslint-disable-next-line @wordpress/i18n-ellipsis
			: __( 'Loading...', 'elementor' ),
	} );

	if ( isError ) {
		// Will be caught by the App error boundary.
		throw new Error();
	}

	if ( isLoading ) {
		return <ElementorLoading />;
	}

	return (
		<Layout
			header={ <ItemHeader model={ kit } buttons={ headerButtons } pageId="overview" /> }
			sidebar={ <OverviewSidebar model={ kit } groupedKitContent={ documentsByType } /> }
		>
			{
				documentsByType.length > 0 &&
				<Content>
					{
						documentsByType.map( ( contentType ) => (
							<OverviewContentGroup
								key={ contentType.id }
								contentType={ contentType }
								kitId={ props.id }
								kitTitle={ kit.title }
							/>
						) )
					}
				</Content>
			}
		</Layout>
	);
}

Overview.propTypes = {
	id: PropTypes.string,
};
