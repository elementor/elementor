module.exports = {

	login: function( browser ) {
		browser
			.url( 'http://localhost:4001/wp-admin' )
			.waitForElementVisible( 'body', 1000 )
			.setValue( 'input[id=user_login]', 'admin' )
			.setValue( 'input[id=user_pass]', 'password' )
			.click( 'input[id=wp-submit]' );
	},

	'add page': function( browser ) {
		browser
			.url( 'http://localhost:4001/wp-admin/post-new.php?post_type=page' )
			.waitForElementVisible( 'body', 1000 )
			.click( 'button[id=elementor-switch-mode-button]' )
			.waitForElementNotVisible( 'div[id=elementor-loading]', 5000 );
	},
};
