import { useState } from 'react';
import { Context as ExportContext } from '../../../context/export';

import KitContentList from '../../../shared/kit-content-list/kit-content-list';
import Box from '../../../ui/box/box';
import Footer from '../../../shared/footer/footer';
import Loading from '../../../shared/loading/loading';
import Heading from 'elementor-app/ui/atoms/heading';
import Button from 'elementor-app/ui/molecules/button';

export default function ExportContentList( props ) {
	const exportData = React.useContext( ExportContext ),
		exportData2 = {
			elementor_export_kit: {
				title: exportData.title,
				include: exportData.includes,
				custom_post_types: exportData.postTypes,
			},
		},
		getButtonLink = () => '/export',
		setTitle = ( event ) => exportData.setTitle( event.target.value );

	const ExportContent = () => (
		<section className="e-app-export">
			<div className="e-app-export__kit-name">
				<Heading variant="h2" tag="h1">
					{ __( 'Kit Name', 'elementor' ) }
				</Heading>
				<Box>
					<input type="text" onChange={ setTitle } defaultValue={exportData.title} />
				</Box>
			</div>

			<div className="e-app-export__kit-content">
				<Heading variant="h2">
					{ __( 'Choose What To Include In The Kit', 'elementor' ) }
				</Heading>

				<KitContentList type="export" />
			</div>

			<Footer separator justify="end">
				<Button url={ getButtonLink() } onClick={ () => exportData.setIsLoading( true ) } size="lg" color="primary" text={ __( 'Next', 'elementor' ) } />
			</Footer>
		</section>
	);

	return (
		<>
			{ exportData.isLoading ? <Loading /> : <ExportContent /> }
		</>
	);
}

ExportContentList.propTypes = {
	classname: PropTypes.string,
	setApiStatus: PropTypes.func,
};

ExportContentList.defaultProps = {
	className: '',
};
