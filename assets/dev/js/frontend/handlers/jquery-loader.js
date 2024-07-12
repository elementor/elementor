export default class ScriptLoader {
	// Ref: https://stackoverflow.com/questions/1140402/how-to-add-jquery-in-js-file
	scriptUrl = '//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
	startingTime = new Date().getTime();

	loadScript() {
		return new Promise((resolve, reject) => {
			// Create a script element
			let script = document.createElement("script");
			script.src = this.scriptUrl;
			script.type = 'text/javascript';

			// Set up onload and onerror handlers
			script.onload = () => resolve();
			script.onerror = () => reject(new Error(`Failed to load script: ${this.scriptUrl}`));

			// Append the script to the document head
			document.getElementsByTagName("head")[0].appendChild(script);
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
			// Load jQuery asynchronously
			await this.loadScript();

			// Wait for jQuery to be ready
			const $ = await this.checkReady();

			// Now jQuery is loaded and ready to use
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

