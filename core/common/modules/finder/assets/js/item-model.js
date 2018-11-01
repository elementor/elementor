export default class extends Backbone.Model {
	defaults() {
		return {
			description: '',
			icon: 'settings',
			link: '',
			keywords: [],
			actions: [],
		};
	}
}
