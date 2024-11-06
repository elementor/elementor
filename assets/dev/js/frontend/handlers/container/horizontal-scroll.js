export default class HorizontalScroll extends elementorModules.frontend.handlers.Base {
	onInit() {

// Adding scroll event listener
		document.addEventListener( 'scroll', this.horizontalScroll );

	}

	horizontalScroll() {

//Selecting Elements
		let sticky = document.querySelector('.e-con-horizontal');
		let stickyParent = document.querySelector('.e-con-horizontal-sticky');

		console.log( 'sticky: ', sticky );
		console.log( 'stickyParent: ', stickyParent );

		let scrollWidth = sticky.scrollWidth;
		let verticalScrollHeight = stickyParent.getBoundingClientRect().height - sticky.getBoundingClientRect().height;

		let stickyPosition = sticky.getBoundingClientRect().top;

		console.log( 'stickyPosition: ', stickyPosition );

		if (stickyPosition > 1) {
			return;
		} else {
			let scrolled = stickyParent.getBoundingClientRect().top; //how much is scrolled?

			console.log( 'scrolled: ', scrolled );
			console.log( 'verticalScrollHeight: ', verticalScrollHeight );
			console.log( 'scrollWidth: ', scrollWidth );

			sticky.scrollLeft = (scrollWidth / verticalScrollHeight) * (-scrolled) * 0.85;

		}
	}
}
