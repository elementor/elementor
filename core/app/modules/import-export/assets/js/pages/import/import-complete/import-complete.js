import { useContext, useEffect } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import WizardStep from '../../../ui/wizard-step/wizard-step';
import KitData from '../../../shared/kit-data/kit-data';
import Button from 'elementor-app/ui/molecules/button';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import Notice from 'elementor-app/ui/molecules/notice';
import DashboardButton from 'elementor-app/molecules/dashboard-button';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

export default function ImportComplete() {
	const context = useContext( Context );

	const navigate = useNavigate(),
		getFooter = () => (
			<WizardFooter separator justify="end">
				<DashboardButton />
			</WizardFooter>
		),
		getTemplates = ( templates, importedData ) => {
			const kitTemplates = {};

			for ( const key in importedData?.templates?.succeed ) {
				kitTemplates[ key ] = templates[ key ];
			}

			return kitTemplates;
		},
		getContent = ( content, importedData ) => {
			const kitContent = {};

			for ( const contentType in importedData?.content ) {
				kitContent[ contentType ] = {};

				for ( const key in importedData.content[ contentType ]?.succeed ) {
					kitContent[ contentType ][ key ] = content[ contentType ][ key ];
				}
			}

			return kitContent;
		},
		getWPContent = ( content, importedData ) => {
			const kitWPContent = {};

			for ( const contentType in importedData?.[ 'wp-content' ] ) {
				const succeededItems = importedData[ 'wp-content' ][ contentType ]?.succeed;

				kitWPContent[ contentType ] = succeededItems ? Object.keys( succeededItems ) : [];
			}

			return kitWPContent;
		},
		getImportedPlugins = () => {
			const importedPlugins = {
				activePlugins: [],
				failedPlugins: [],
			};

			context.data.importedPlugins.forEach( ( plugin ) => {
				const group = 'active' === plugin.status ? 'activePlugins' : 'failedPlugins';

				importedPlugins[ group ].push( plugin );
			} );

			return importedPlugins;
		},
		{ activePlugins, failedPlugins } = getImportedPlugins(),
		getKitData = () => {
			if ( ! context.data.uploadedData || ! context.data.importedData ) {
				return {};
			}

			const manifest = context.data.uploadedData.manifest,
				importedData = context.data.importedData;

			return {
				templates: getTemplates( manifest.templates, importedData ),
				content: getContent( manifest.content, importedData ),
				'wp-content': getWPContent( manifest[ 'wp-content' ], importedData ),
				'site-settings': context.data.includes.includes( 'settings' ) ? manifest[ 'site-settings' ] : {},
				plugins: activePlugins,
			};
		},
		FailedPluginsNoticeButton = () => (
			<Button
				text={ __( 'Learn more', 'elementor' ) }
				variant="outlined"
				color="secondary"
				size="sm"
				url="https://go.elementor.com/app-import-plugin-installation-failed"
			/>
		);

	useEffect( () => {
		if ( ! context.data.uploadedData ) {
			navigate( '/import' );
		}
	}, [] );

	return (
		<Layout type="import" footer={ getFooter() }>
			<WizardStep
				image={ elementorAppConfig.assets_url + 'images/go-pro.svg' }
				heading={ __( 'Your kit is now live on your site!', 'elementor' ) }
				notice={ (
					<>
						<InlineLink url="https://go.elementor.com/app-what-are-kits" italic>
							{ __( 'Click Here', 'elementor' ) }
						</InlineLink> { __( 'to learn more about building your site with Elementor Kits', 'elementor' ) }
					</>
				) }
			>
				{
					! ! failedPlugins.length &&
					<Notice label={ __( 'Important:', 'elementor' ) } color="warning" button={ <FailedPluginsNoticeButton /> }>
						{
							__( 'There are few plugins that we couldn\'t install:', 'elementor' ) + ' ' +
							failedPlugins.map( ( { name } ) => name ).join( ' | ' )
						}
					</Notice>
				}

				<KitData data={ getKitData() } />
			</WizardStep>
		</Layout>
	);
}
