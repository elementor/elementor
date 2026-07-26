'use strict';

module.exports = function( grunt ) {
	grunt.initConfig( {
		checktextdomain: require( './checktextdomain.config.cjs' ),
	} );

	grunt.loadNpmTasks( 'grunt-checktextdomain' );
	grunt.registerTask( 'default', [ 'checktextdomain' ] );
};
