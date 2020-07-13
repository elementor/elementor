import { Context as ExportContext } from '../../../context/export';

import KitContentList from '../../../shared/kit-content-list/kit-content-list';
import Box from '../../../ui/box/box';
import Footer from '../../../shared/footer/footer';
import Heading from 'elementor-app/ui/atoms/heading';
import Button from 'elementor-app/ui/molecules/button';

export default function ExportContentList( props ) {
	const contextData = React.useContext( ExportContext ),
		exportData = {
			elementor_export_kit: {
				title: contextData.title,
				include: contextData.includes,
				custom_post_types: contextData.postTypes,
			},
		},
		exportContent = () => {
			const currentBaseUrl = window.location.origin + window.location.pathname + window.location.search,
				queryConnection = currentBaseUrl.indexOf( '?' ) > -1 ? '&' : '?',
				downloadUrl = currentBaseUrl + queryConnection + 'data=1' + window.location.hash,
				downloadWindow = window.open( downloadUrl, 'download_window', 'toolbar=0,location=no,directories=0,status=0,scrollbars=0,resizeable=0,width=1,height=1,top=0,left=0' );

			props.setIsLoading( true );

			downloadWindow.addEventListener( 'beforeunload', () => {
				props.setIsLoading( false );
			} );
		},
		setTitle = ( event ) => contextData.setTitle( event.target.value );

	return (
		<section className="e-app-export">
			<div className="e-app-export__kit-name">
				<Heading variant="h2" tag="h1">
					{ __( 'Kit Name', 'elementor' ) }
				</Heading>
				<Box>
					<input type="text" onChange={ setTitle } defaultValue={contextData.title} />
				</Box>
			</div>

			<div className="e-app-export__kit-content">
				<Heading variant="h2">
					{ __( 'Choose What To Include In The Kit', 'elementor' ) }
				</Heading>

				<KitContentList type="export" />
			</div>

			<Footer separator justify="end">
				<Button onClick={ exportContent } size="lg" color="primary" text={ __( 'Next', 'elementor' ) } />
			</Footer>
		</section>
	);
}

ExportContentList.propTypes = {
	classname: PropTypes.string,
	setIsLoading: PropTypes.func,
};

ExportContentList.defaultProps = {
	className: '',
};
