import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default class HorizontalScroll extends elementorModules.frontend.handlers.Base {
	__construct( settings ) {
		super.__construct( settings );
console.log( 'testje' );
	}
	onInit() {
		this.initScroll();

		console.log( 'HorizontalScroll' );
	}

	initScroll() {
		gsap.registerPlugin( ScrollTrigger );

		gsap.to('.e-con .elementor-element', {
			xPercent: -100, // Moves the content to the left to create the scroll effect
			ease: "none",
			scrollTrigger: {
				trigger: '.e-con',
				start: "top top", // Start when the element is at the top of the viewport
				end: () => "+=" + document.querySelector('.e-con').offsetWidth,
				scrub: true, // Smooth scroll effect
				pin: true, // Pin the section in place while scrolling
				anticipatePin: 1,
			},
		});
	}
}
