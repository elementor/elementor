import Text from 'elementor-app/ui/atoms/text';
import Icon from 'elementor-app/ui/atoms/icon';
import InlineLink from 'elementor-app/ui/molecules/inline-link';

import DataTable from 'elementor-app/molecules/data-table';

import useKitData from './hooks/use-kit-data';

import './kit-data.scss';

export default function KitData( { data } ) {
	const { templates, siteSettings, content, plugins } = useKitData( data ),
		{ editElementorHomePageUrl, recentlyEditedElementorPageUrl } = data?.configData || {},
		siteSettingsUrl = editElementorHomePageUrl || recentlyEditedElementorPageUrl,
		headers = [
			__( 'Site Area', 'elementor' ),
			__( 'Included', 'elementor' ),
		],
		getRowsData = () => {
			const rowsData = [
				{
					siteArea: __( 'Elementor Templates', 'elementor' ),
					link: '/site-editor',
					included: templates,
				},
				{
					siteArea: __( 'Site Settings', 'elementor' ),
					link: siteSettingsUrl ? siteSettingsUrl + '#e:run:panel/global/open' : '',
					included: siteSettings,
				},
				{
					siteArea: __( 'Content', 'elementor' ),
					link: elementorAppConfig.admin_url + 'edit.php?post_type=page',
					included: content,
				},
				{
					siteArea: __( 'Plugins', 'elementor' ),
					link: elementorAppConfig.admin_url + 'plugins.php',
					included: plugins,
				},
			];

			return rowsData
				.map( ( { siteArea, included, link } ) => {
					if ( ! included.length ) {
						return;
					}

					const SiteArea = () => (
							<InlineLink url={ link } color="secondary" underline="none">
								<Text className="e-app-import-export-kit-data__site-area">
									{ siteArea } { link && <Icon className="eicon-editor-external-link" /> }
								</Text>
							</InlineLink>
						),
						Included = () => (
							<Text className="e-app-import-export-kit-data__included">
								{ included.filter( ( value ) => value ).join( ' | ' ) }
							</Text>
						);

					return [ <SiteArea key={ siteArea } />, <Included key={ included } /> ];
				} )
				.filter( ( row ) => row );
		};

	return (
		<DataTable
			className="e-app-import-export-kit-data"
			headers={ headers }
			rows={ getRowsData() }
			layout={ [ 1, 3 ] }
		/>
	);
}

KitData.propTypes = {
	data: PropTypes.object,
};
