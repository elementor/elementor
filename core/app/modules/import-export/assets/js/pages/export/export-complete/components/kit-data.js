import { useContext } from 'react';

import { Context } from '../../../../context/export/export-context';

import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import List from 'elementor-app/ui/molecules/list';

import './kit-data.scss';

export default function KitData() {
	const exportContext = useContext( Context ),
		kitData = exportContext.data.fileResponse?.manifest,
		getSummaryTitle = ( type, key, amount, showAmount ) => {
			if ( ! amount ) {
				return '';
			}

			const data = elementorAppConfig[ 'import-export' ].summaryTitles[ type ][ key ];

			let title = amount > 1 ? data.plural : data.single;

			if ( showAmount ) {
				title = amount + ' ' + title;
			}

			return title;
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
					.map( ( item ) => getSummaryTitle( 'templates', item[ 0 ], item[ 1 ], true ) );
		},
		getSiteSettings = () => {
			const siteSettings = ( kitData && kitData[ 'site-settings' ] ) || {};

			return Object
				.entries( siteSettings )
				.map( ( item ) => item[ 1 ] );
		},
		getContent = () => {
			const content = kitData?.content || {};

			return Object
					.entries( content )
					.map( ( item ) => getSummaryTitle( 'content', item[ 0 ], Object.entries( item[ 1 ] ).length ) );
		},
		kitContent = [
			{
				title: __( 'Templates:', 'elementor' ),
				data: getTemplates(),
			},
			{
				title: __( 'Site Settings:', 'elementor' ),
				data: getSiteSettings(),
			},
			{
				title: __( 'Content:', 'elementor' ),
				data: getContent(),
			},
		];

	return (
		<>
			<Heading variant="h6" tag="h3" className="e-app-export-complete__kit-content-title">
				{ __( 'This Template Kit includes:', 'elementor' ) }
			</Heading>

			<List className="e-app-export-complete-kit-data-list">
				{
					kitContent.map( ( item, index ) => (
						<List.Item key={ index } className="e-app-export-complete-kit-data-list__item">
							<Text tag="strong" variant="sm"><strong>{ item.title }</strong></Text> <Text tag="span" variant="sm">{ item.data.filter( ( value ) => value ).join( ' | ' ) }</Text>
						</List.Item>
					) )
				}
			</List>
		</>
	);
}
