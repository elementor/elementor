export default class HorizontalScroll extends elementorModules.frontend.handlers.Base {
	onInit() {

// Adding scroll event listener
		document.addEventListener( 'scroll', this.horizontalScroll );

//Selecting Elements
		let sticky = document.querySelector('.e-con-horizontal');
		let stickyParent = document.querySelector('.e-con-horizontal-sticky');

		let scrollWidth = sticky.scrollWidth;
		let verticalScrollHeight = stickyParent.getBoundingClientRect().height - sticky.getBoundingClientRect().height;
	}


//Scroll function
	horizontalScroll() {
		console.log( 'test ');

		//Checking whether the sticky element has entered into view or not
		let stickyPosition = sticky.getBoundingClientRect().top;
		if (stickyPosition > 1) {
			return;
		} else {
			let scrolled = stickyParent.getBoundingClientRect().top; //how much is scrolled?
			sticky.scrollLeft = (scrollWidth / verticalScrollHeight) * (-scrolled) * 0.85;

		}
	}
}
