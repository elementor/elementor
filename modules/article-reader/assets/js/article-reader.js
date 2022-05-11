document.addEventListener('DOMContentLoaded', function() {
	const widgetMetaData = document.querySelector('.article-reader-widget');
	const badVoices = [0,11];
	window.msg = new SpeechSynthesisUtterance();
	window.voices = window.speechSynthesis.getVoices();
	window.msg.text = widgetMetaData.getAttribute('text');
	window.msg.lang = widgetMetaData.getAttribute('page-full-locale').split('_')[0];
	//set default voice
	window.msg.voice = voices[0];
	if (widgetMetaData.getAttribute('default-voice') == ""){   
		for(var i = 0; i < voices.length; i++) {
			//bad voices filter
			if (badVoices.includes(i)) {continue;}
			//get voice by locale
			if (voices[i].lang == widgetMetaData.getAttribute('page-full-locale').replace('_', '-')) {
				window.msg.voice = voices[i];
				break;
			}
		}
	} else {
		window.msg.lang = voices[widgetMetaData.getAttribute('default-voice')].lang.split('-')[0];
		window.msg.voice = voices[widgetMetaData.getAttribute('default-voice')];
	}
	window.msg.rate = widgetMetaData.getAttribute('play-rate');
});

function speechSynthesisPlay(event) {
	const isinitialized = event.classList.contains('initialized');
	const isPlaying = event.classList.contains('playing');
	if(!isPlaying) {
		if(isinitialized) {
			window.speechSynthesis.resume();
		} else {
			window.speechSynthesis.speak(window.msg);
			event.classList.add('initialized')
		}
		event.classList.add('playing');
		event.innerText = event.getAttribute('pause-text');
	} else {
		window.speechSynthesis.pause();
		event.classList.remove('playing');
		event.innerText = event.getAttribute('play-text');
	} 
}


