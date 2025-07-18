initElement( 'v4-hero', function( { element } ) {
	/** @type {HTMLDivElement} */
	const el = element;

	el.onmousemove = ( e ) => {
		const rect = el.getBoundingClientRect();
		const centerX = ( rect.left + rect.width ) / 2;
		const centerY = ( rect.top + rect.height ) / 2;
		const mouseX = e.clientX - centerX;
		const mouseY = e.clientY - centerY;
		const rotateX = -mouseY / 150;
		const rotateY = mouseX / 60;
		el.style.transform = `perspective(800px) rotateX(${ rotateX }deg) rotateY(${ rotateY }deg)`;
	};

	el.onmouseleave = () => {
		el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
	};
} );
