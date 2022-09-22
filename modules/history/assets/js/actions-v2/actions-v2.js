import { History } from './History';

export default class extends Marionette.CompositeView {
	id() {
		return 'elementor-panel-history-v2';
	}

	template() {
		return '<div></div>';
	}

	render() {
		ReactDOM.render(
			<History />,
			this.$el[ 0 ],
		);
	}

	onDestroy() {
		ReactDOM.unmountComponentAtNode( this.$el[ 0 ] );
	}
}
