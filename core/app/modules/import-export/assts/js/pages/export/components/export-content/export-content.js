import KitContent from '../../../../shared/kit-content/kit-content';
import KitNameInput from './kit-name-input/kit-name-input';
import Heading from 'elementor-app/ui/atoms/heading';

export default function ExportContent() {
	console.log( '--- RENDER BY PARENT: ExportContent()' );

	return (
		<section className="e-app-export">
			<div className="e-app-export__kit-name">
				<Heading variant="h2" tag="h2">
					{ __( 'Kit Name', 'elementor' ) }
				</Heading>

				<KitNameInput />
			</div>

			<div className="e-app-export__kit-content">
				<Heading variant="h2" tag="h1">
					{ __( 'Choose What To Include In The Kit', 'elementor' ) }
				</Heading>

				<KitContent type="export" />
			</div>
		</section>
	);
}

ExportContent.propTypes = {
	classname: PropTypes.string,
};

ExportContent.defaultProps = {
	className: '',
};
