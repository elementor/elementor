/**
 * Extracted from https://github.com/sca-/webpack-watch-time-plugin
 */

function WatchTimePlugin() {}

WatchTimePlugin.prototype.onWatchRun = function onWatchRun( watching, callback ) {
	console.log( '\x1b[35m', ' ' + ( new Date() ).toLocaleString() );
	callback();
}

WatchTimePlugin.prototype.apply = function ( compiler ) {
	compiler.hooks.watchRun.tapAsync( 'watch-time', this.onWatchRun.bind( this ) );
}

module.exports = WatchTimePlugin;
