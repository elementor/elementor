import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default class HorizontalScroll extends elementorModules.frontend.handlers.Base {
	onInit() {
		gsap.registerPlugin( ScrollTrigger );

		gsap.to( '.e-con-horizontal .elementor-element', {
			xPercent: -100, // Moves the content to the left to create the scroll effect
			ease: 'none',
			scrollTrigger: {
				trigger: '.e-con-horizontal',
				start: 'top top', // Start when the element is at the top of the viewport
				end: () => '+=' + document.querySelector( '.e-con-horizontal' ).offsetWidth,
				scrub: true, // Smooth scroll effect
				pin: true, // Pin the section in place while scrolling
				anticipatePin: 1,
			},
		} );
	}
}
