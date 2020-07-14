import { ExportConsumer } from '../../../../context/export';

export default class KitNameInput extends React.Component {
	constructor() {
		super();

		console.log( 'RE-RENDERS: KitNameInput() - constructor' );
	}
	render() {
		console.log( 'RE-RENDERS: KitNameInput()' );

		return (
			<ExportConsumer>
				{
					( state ) => (
						<input
							type="text"
							onChange={ ( event ) => state.setTitle( event.target.value ) }
							defaultValue={ state.title }
						/>
					)
				}
			</ExportConsumer>
		);
	}
}
