var App = Marionette.Application.extend( {

	onStart: function() {
		this.initComponents();
	},

	initComponents: function() {
	}
} );

module.exports = ( window.elementorApp = new App() ).start();