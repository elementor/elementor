export function createNoticeView() {
	return window.Marionette?.CompositeView.extend( {
		template: `<div></div>`,
	} );
}
