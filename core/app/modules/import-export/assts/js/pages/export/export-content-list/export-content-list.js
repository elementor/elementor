import KitContent from '../../../shared/kit-content/kit-content';
import Box from '../../../ui/box/box';
import Footer from '../../../shared/footer/footer';
import DownloadButton from './download-button/download-button';
import KitNameInput from './kit-name-input/kit-name-input';
import Heading from 'elementor-app/ui/atoms/heading';

export default function ExportContentList() {
	console.log( 'RE-RENDERS: ExportContentList()' );

	return (
		<section className="e-app-export">
			<div className="e-app-export__kit-name">
				<Heading variant="h2" tag="h1">
					{ __( 'Kit Name', 'elementor' ) }
				</Heading>
				<Box>
					<KitNameInput />
				</Box>
			</div>

			<div className="e-app-export__kit-content">
				<Heading variant="h2">
					{ __( 'Choose What To Include In The Kit', 'elementor' ) }
				</Heading>

				<KitContent type="export" />
			</div>

			<Footer separator justify="end">
				<DownloadButton />
			</Footer>
		</section>
	);
}

ExportContentList.propTypes = {
	classname: PropTypes.string,
	isLoading: PropTypes.bool,
	setIsLoading: PropTypes.func,
};

ExportContentList.defaultProps = {
	className: '',
};
