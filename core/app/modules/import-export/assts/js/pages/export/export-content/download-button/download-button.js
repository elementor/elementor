import { ExportConsumer } from '../../../../context/export';

import Button from 'elementor-app/ui/molecules/button';

export default class DownloadButton extends React.PureComponent {
	getDownloadUrl = ( data ) => {
		const currentBaseUrl = window.location.origin + window.location.pathname + window.location.search,
			queryConnection = currentBaseUrl.indexOf( '?' ) > -1 ? '&' : '?';

		console.log( 'data', data );

		return currentBaseUrl + queryConnection + 'data=1' + window.location.hash;
	}

	render() {
		return (
			<ExportConsumer>
				{
					( context ) => (
						<Button onClick={ () => { this.getDownloadUrl( context ) } } variant="contained" size="lg" color="primary" text={ __( 'Next', 'elementor' ) } />
					)
				}
			</ExportConsumer>
		);
	}
}
