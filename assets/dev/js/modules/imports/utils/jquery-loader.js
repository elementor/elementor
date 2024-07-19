// Experimental file to load jQuery in a non-blocking way.
// To be discussed in the context of the general infra.
export default class JqueryLoader {
	// Ref: https://stackoverflow.com/questions/1140402/how-to-add-jquery-in-js-file
	baseUrl = elementorFrontendConfig.urls.ajaxurl.replace( '/wp-admin/admin-ajax.php', '' );
	scriptUrl = '/wp-includes/js/jquery/jquery.js';
	startingTime = new Date().getTime();

	loadScript() {
		return new Promise((resolve, reject) => {
			// Create a script element
			let script = document.createElement("script");
			script.src = `${ this.baseUrl }${ this.scriptUrl }`;
			script.type = 'text/javascript';

			// Append the script to the document head
			document.getElementsByTagName("head")[0].appendChild(script);

			// Resolve once the script has loaded
			script.onload = () => resolve();
			script.onerror = () => reject(new Error(`Failed to load script: ${this.scriptUrl}`));
		});
	}

	checkReady() {
		return new Promise((resolve) => {
			const poll = () => {
				if (window.jQuery) {
					resolve(window.jQuery);
				} else {
					setTimeout(poll, 20);
				}
			};
			poll();
		});
	}

	async execute() {
		try {
			await this.loadScript();
			const $ = await this.checkReady();
			$(function() {
				const endingTime = new Date().getTime();
				const tookTime = endingTime - this.startingTime;
				window.alert(`jQuery is loaded, after ${tookTime} milliseconds!`);
			}.bind(this));
		} catch (error) {
			console.error(error);
		}
	}
}

// // Usage example
// const scriptLoader = new ScriptLoader();
// scriptLoader.execute();
//
// console.log( 'jquery was loaded' );

