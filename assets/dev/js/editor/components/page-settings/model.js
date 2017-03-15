var SettingsModel = Backbone.Model.extend( {
	defaults: {
		post_id: 0,
		template: '',
		content_width: '',
		post_status: '',
		post_title: ''
	}
} );

SettingsModel.prototype.sync = function() {
	return null;
};

module.exports = SettingsModel;
