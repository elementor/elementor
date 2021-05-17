import { useContext } from 'react';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import WizardStep from '../../../ui/wizard-step/wizard-step';
import KitData from '../../../shared/kit-data/kit-data';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import DashboardButton from 'elementor-app/molecules/dashboard-button';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

export default function ImportComplete() {
	const context = useContext( Context ),
		getFooter = () => (
			<WizardFooter separator justify="end">
				<DashboardButton />
			</WizardFooter>
		),
		getTemplates = ( templates, succeed ) => {
			const kitTemplates = {};

			for ( const key in succeed ) {
				kitTemplates[ key ] = templates[ key ];
			}

			return kitTemplates;
		},
		getContent = ( content, data ) => {
			const kitContent = {};

			for ( const contentType in data ) {
				for ( const key in data[ contentType ].succeed ) {
					if ( ! kitContent[ contentType ] ) {
						kitContent[ contentType ] = {};
					}

					kitContent[ contentType ][ key ] = content[ contentType ][ key ];
				}
			}

			return kitContent;
		},
		getWPContent = ( content, data ) => {
			const kitWPContent = {};

			for ( const contentType in data ) {
				for ( const key in data[ contentType ].succeed ) {
					if ( ! kitWPContent[ contentType ] ) {
						kitWPContent[ contentType ] = [];
					}

					kitWPContent[ contentType ].push( key );
				}
			}

			return kitWPContent;
		},
		getKitData = () => {
			if ( ! context.data.fileResponse ) {
				return {};
			}

			const manifest = context.data.fileResponse.stage1.manifest,
				importData = context.data.fileResponse.stage2;

			return {
				templates: getTemplates( manifest.templates, importData.templates.succeed ),
				content: getContent( manifest.content, importData.content ),
				'wp-content': getWPContent( manifest[ 'wp-content' ], importData[ 'wp-content' ] ),
				'site-settings': context.data.includes.includes( 'settings' ) && manifest[ 'site-settings' ],
			};
		};

	return (
		<Layout type="import" footer={ getFooter() }>
			<WizardStep
				image={ elementorAppConfig.assets_url + 'images/go-pro.svg' }
				heading={ __( 'Your file is ready!', 'elementor' ) }
				description={ __( 'You can find the components of this file in the Library.', 'elementor' ) }
				notice={ (
					<>
						<InlineLink url="https://go.elementor.com/app-what-are-kits" italic>
							{ __( 'Click Here', 'elementor' ) }
						</InlineLink> { __( 'to learn more about building your site with Elementor Kits', 'elementor' ) }
					</>
				) }
			>
				<KitData data={ getKitData() } />
			</WizardStep>
		</Layout>
	);
}
