import Text from 'elementor-app/ui/atoms/text';
import Icon from 'elementor-app/ui/atoms/icon';
import InlineLink from 'elementor-app/ui/molecules/inline-link';

import DataTable from 'elementor-app/molecules/data-table';

import './kit-data.scss';

export default function KitData( props ) {
	const kitData = props.data,
		getSummaryTitle = ( type, key, amount ) => {
			const data = elementorAppConfig[ 'import-export' ].summaryTitles[ type ][ key ];

			if ( data?.single ) {
				if ( ! amount ) {
					return '';
				}

				const title = amount > 1 ? data.plural : data.single;

				return amount + ' ' + title;
			}

			return data;
		},
		getTemplates = () => {
			const templates = {};

			for ( const key in kitData?.templates ) {
				const type = kitData.templates[ key ].doc_type;

				if ( ! templates[ type ] ) {
					templates[ type ] = 0;
				}

				templates[ type ]++;
			}

			return Object
					.entries( templates )
					.map( ( item ) => getSummaryTitle( 'templates', item[ 0 ], item[ 1 ] ) );
		},
		getSiteSettings = () => {
			const siteSettings = kitData?.[ 'site-settings' ] || {};

			return Object
				.entries( siteSettings )
				.map( ( item ) => getSummaryTitle( 'site-settings', item[ 1 ] ) );
		},
		getContent = () => {
			const content = kitData?.content || {},
				wpContent = kitData?.[ 'wp-content' ] || {};

			let mergedContent = { ...content };

			for ( const key in mergedContent ) {
				mergedContent[ key ] = Object.keys( mergedContent[ key ] ).concat( wpContent[ key ] || [] );
			}

			// In case that wpContent has properties that doesn't exist in the content object.
			mergedContent = { ...wpContent, ...mergedContent };

			return Object
				.entries( mergedContent )
				.map( ( item ) => getSummaryTitle( 'content', item[ 0 ], item[ 1 ].length ) );
		},
		getActivatedPlugins = () => {
			return kitData?.plugins ? kitData.plugins.map( ( { name } ) => name ) : [];
		},
		headers = [
			__( 'Site Area', 'elementor' ),
			__( 'Included', 'elementor' ),
		],
		getRowsData = () => {
			const rowsData = [
				{
					siteArea: __( 'Elementor Templates', 'elementor' ),
					link: '/site-editor',
					included: getTemplates(),
				},
				{
					siteArea: __( 'Site Settings', 'elementor' ),
					link: '',
					included: getSiteSettings(),
				},
				{
					siteArea: __( 'Content', 'elementor' ),
					link: elementorAppConfig.admin_url + 'edit.php?post_type=page',
					included: getContent(),
				},
				{
					siteArea: __( 'Plugins', 'elementor' ),
					link: elementorAppConfig.admin_url + 'plugins.php',
					included: getActivatedPlugins(),
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
									{ siteArea } <Icon className="eicon-editor-external-link" />
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
