import KitContent from '../../../../../shared/kit-content/kit-content';
import kitContentData from '../../../../../shared/kit-content-data/kit-content-data';
import Notice from 'elementor-app/ui/molecules/notice';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import Button from 'elementor-app/ui/molecules/button';

export default function ImportContentDisplay( {
	manifest,
	hasPro,
	hasPlugins,
	isAllRequiredPluginsSelected,
	onResetProcess,
} ) {
	const contentData = kitContentData.filter( ( { type } ) => {
		const contentType = 'settings' === type ? 'site-settings' : type,
			data = manifest?.[ contentType ];

		return ! ! ( Array.isArray( data ) ? data.length : data );
	} );

	if ( ! contentData.length && hasPlugins ) {
		return (
			<Notice color="info" label={ __( 'Note:', 'elementor' ) }>
				{ __( 'The Template Kit you’re using contains plugins for functionality, but no content or pages, etc.', 'elementor' ) }
			</Notice>
		);
	}

	if ( ! contentData.length ) {
		return (
			<Notice color="danger">
				{ __( 'You can’t use this Template Kit because it doesn’t contain any content, pages, etc. Try again with a different file.', 'elementor' ) } <InlineLink onClick={ onResetProcess }>{ __( 'Go Back', 'elementor' ) }</InlineLink>
			</Notice>
		);
	}

	return (
		<>
			{
				! isAllRequiredPluginsSelected &&
				<Notice color="warning" label={ __( 'Required plugins are still missing.', 'elementor' ) } className="e-app-import-content__plugins-notice">
					{ __( "If you don't include them, this kit may not work properly.", 'elementor' ) } <InlineLink url="/import/plugins">{ __( 'Go Back', 'elementor' ) }</InlineLink>
				</Notice>
			}

			<KitContent contentData={ contentData } hasPro={ hasPro } />;
		</>
	);
}

ImportContentDisplay.propTypes = {
	manifest: PropTypes.object,
	hasPro: PropTypes.bool,
	hasPlugins: PropTypes.bool,
	isAllRequiredPluginsSelected: PropTypes.bool,
	onResetProcess: PropTypes.func,
};
