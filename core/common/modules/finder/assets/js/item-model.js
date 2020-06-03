export default class extends Backbone.Model {
	defaults() {
		return {
			description: '',
			icon: 'settings',
			url: '',
			keywords: [],
			actions: [],
		};
	}
}
