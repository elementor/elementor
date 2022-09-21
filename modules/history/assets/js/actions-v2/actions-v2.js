/* global ReactDOM */
import { HistoryPanel } from 'history';

export default class extends Marionette.CompositeView {
	id() {
		return 'elementor-panel-history-v2';
	}

	template() {
		return '<div></div>';
	}

	render() {
		ReactDOM.render(
			<HistoryPanel />,
			this.$el[ 0 ],
		);
	}

	onDestroy() {
		ReactDOM.unmountComponentAtNode( this.$el[ 0 ] );
	}
}
