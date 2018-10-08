export default class extends Backbone.Model {
	defaults() {
		return {
			description: '',
			icon: '',
			link: '',
		};
	}
}
