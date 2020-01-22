elementorCommon.ajax.send = ( action, options ) => {};

const elementorConfigDocument = {
	remoteLibrary: {
		type: 'page',
		category: '',
	},
	panel: {
		title: 'Post',
		widgets_settings: [],
		elements_categories: {
		},
		messages: {
			publish_notification: 'Hurray! Your Post is live.',
		},
	},
	container: 'body',
	urls: {
		exit_to_dashboard: 'http: //localhost/elementor/wp-admin/post.php?post=1819&action=edit',
		preview: 'http://localhost/elementor/?p=1819&elementor-preview=1819&ver=1574068998',
		wp_preview: 'http://localhost/elementor/?p=1819&preview_id=1819&preview_nonce=d50fdce90b&preview=true',
		permalink: 'http://localhost/elementor/?p=1819',
	},
	debounceDelay: 0,
};

const elementorConfigSettings = {
	page: {
		name: 'page',
		panelPage: {
			title: 'Post Settings',
		},
		controls: {
			padding: {
				unit: 'px',
				top: '',
				right: '',
				bottom: '',
				left: '',
				isLinked: true,
			},
		},
	},
	general: {
		name: 'general',
		panelPage: {
			title: 'Global Settings',
		},
		cssWrapperSelector: '',
		controls: {
			style: {
				type: 'section',
				tab: 'style',
				label: 'Style',
				name: 'style',
			},
			elementor_default_generic_fonts: {
				type: 'text',
				tab: 'style',
				section: 'style',
				label: 'Default Generic Fonts',
				default: 'Sans-serif',
				description: 'The list of fonts used if the chosen font is not available.',
				label_block: true,
				name: 'elementor_default_generic_fonts',
			},
			lightbox: {
				type: 'section',
				tab: 'lightbox',
				label: 'Lightbox',
				name: 'lightbox',
			},
			elementor_global_image_lightbox: {
				type: 'switcher',
				tab: 'lightbox',
				section: 'lightbox',
				label: 'Image Lightbox',
				default: 'yes',
				description: 'Open all image links in a lightbox popup window. The lightbox will automatically work on any link that leads to an image file.',
				frontend_available: true,
				name: 'elementor_global_image_lightbox',
			},
		},
		tabs: {
			style: 'Style',
			lightbox: 'Lightbox',
		},
		settings: {
			elementor_default_generic_fonts: 'Sans-serif ',
			elementor_container_width: '1083',
			elementor_space_between_widgets: '6',
			elementor_stretched_section_container: '0',
			elementor_page_title_selector: '5552222',
			elementor_lightbox_color: '#383838',
			elementor_lightbox_ui_color: '#ffffff',
			elementor_global_image_lightbox: 'yes',
			elementor_lightbox_ui_color_hover: '',
		},
	},
	editorPreferences: {},
};

/* global jQuery */
const ElementorConfig = {
	document: elementorConfigDocument,
	user: { introduction: {}, restrictions: [] },
	elements: {},
	dynamicTags: {},
	library_connect: {
		show_popup: 0,
	},
	icons: { libraries: [] },
	settings: elementorConfigSettings,
	schemes: {},
	controls: {
		font: { label: '', description: '', show_label: true, label_block: false, separator: 'default', groups: { custom: 'Custom Fonts', typekit: 'TypeKit Web Fonts by Adobe', system: 'System', googlefonts: 'Google', earlyaccess: 'Google Early Access' }, options: { Arial: 'system', Tahoma: 'system', Verdana: 'system', Helvetica: 'system', 'Times New Roman': 'system', 'Trebuchet MS': 'system', Georgia: 'system', ABeeZee: 'googlefonts', Abel: 'googlefonts', 'Abhaya Libre': 'googlefonts', 'Abril Fatface': 'googlefonts', Aclonica: 'googlefonts', Acme: 'googlefonts', Actor: 'googlefonts', Adamina: 'googlefonts', 'Advent Pro': 'googlefonts', 'Aguafina Script': 'googlefonts', Akronim: 'googlefonts', Aladin: 'googlefonts', Aldrich: 'googlefonts', Alef: 'googlefonts', 'Alef Hebrew': 'earlyaccess', Alegreya: 'googlefonts', 'Alegreya SC': 'googlefonts', 'Alegreya Sans': 'googlefonts', 'Alegreya Sans SC': 'googlefonts', 'Alex Brush': 'googlefonts', 'Alfa Slab One': 'googlefonts', Alice: 'googlefonts', Alike: 'googlefonts', 'Alike Angular': 'googlefonts', Allan: 'googlefonts', Allerta: 'googlefonts', 'Allerta Stencil': 'googlefonts', Allura: 'googlefonts', Almendra: 'googlefonts', 'Almendra Display': 'googlefonts', 'Almendra SC': 'googlefonts', Amarante: 'googlefonts', Amaranth: 'googlefonts', 'Amatic SC': 'googlefonts', Amethysta: 'googlefonts', Amiko: 'googlefonts', Amiri: 'googlefonts', Amita: 'googlefonts', Anaheim: 'googlefonts', Andada: 'googlefonts', Andika: 'googlefonts', Angkor: 'googlefonts', 'Annie Use Your Telescope': 'googlefonts', 'Anonymous Pro': 'googlefonts', Antic: 'googlefonts', 'Antic Didone': 'googlefonts', 'Antic Slab': 'googlefonts', Anton: 'googlefonts', Arapey: 'googlefonts', Arbutus: 'googlefonts', 'Arbutus Slab': 'googlefonts', 'Architects Daughter': 'googlefonts', Archivo: 'googlefonts', 'Archivo Black': 'googlefonts', 'Archivo Narrow': 'googlefonts', 'Aref Ruqaa': 'googlefonts', 'Arima Madurai': 'googlefonts', Arimo: 'googlefonts', Arizonia: 'googlefonts', Armata: 'googlefonts', Arsenal: 'googlefonts', Artifika: 'googlefonts', Arvo: 'googlefonts', Arya: 'googlefonts', Asap: 'googlefonts', 'Asap Condensed': 'googlefonts', Asar: 'googlefonts', Asset: 'googlefonts', Assistant: 'googlefonts', Astloch: 'googlefonts', Asul: 'googlefonts', Athiti: 'googlefonts', Atma: 'googlefonts', 'Atomic Age': 'googlefonts', Aubrey: 'googlefonts', Audiowide: 'googlefonts', 'Autour One': 'googlefonts', Average: 'googlefonts', 'Average Sans': 'googlefonts', 'Averia Gruesa Libre': 'googlefonts', 'Averia Libre': 'googlefonts', 'Averia Sans Libre': 'googlefonts', 'Averia Serif Libre': 'googlefonts', 'Bad Script': 'googlefonts', Bahiana: 'googlefonts', 'Bai Jamjuree': 'googlefonts', Baloo: 'googlefonts', 'Baloo Bhai': 'googlefonts', 'Baloo Bhaijaan': 'googlefonts', 'Baloo Bhaina': 'googlefonts', 'Baloo Chettan': 'googlefonts', 'Baloo Da': 'googlefonts', 'Baloo Paaji': 'googlefonts', 'Baloo Tamma': 'googlefonts', 'Baloo Tammudu': 'googlefonts', 'Baloo Thambi': 'googlefonts', Balthazar: 'googlefonts', Bangers: 'googlefonts', Barlow: 'googlefonts', 'Barlow Condensed': 'googlefonts', 'Barlow Semi Condensed': 'googlefonts', Barrio: 'googlefonts', Basic: 'googlefonts', Battambang: 'googlefonts', Baumans: 'googlefonts', Bayon: 'googlefonts', Belgrano: 'googlefonts', Bellefair: 'googlefonts', Belleza: 'googlefonts', BenchNine: 'googlefonts', Bentham: 'googlefonts', 'Berkshire Swash': 'googlefonts', Bevan: 'googlefonts', 'Bigelow Rules': 'googlefonts', 'Bigshot One': 'googlefonts', Bilbo: 'googlefonts', 'Bilbo Swash Caps': 'googlefonts', BioRhyme: 'googlefonts', 'BioRhyme Expanded': 'googlefonts', Biryani: 'googlefonts', Bitter: 'googlefonts', 'Black And White Picture': 'googlefonts', 'Black Han Sans': 'googlefonts', 'Black Ops One': 'googlefonts', Bokor: 'googlefonts', Bonbon: 'googlefonts', Boogaloo: 'googlefonts', 'Bowlby One': 'googlefonts', 'Bowlby One SC': 'googlefonts', Brawler: 'googlefonts', 'Bree Serif': 'googlefonts', 'Bubblegum Sans': 'googlefonts', 'Bubbler One': 'googlefonts', Buda: 'googlefonts', Buenard: 'googlefonts', Bungee: 'googlefonts', 'Bungee Hairline': 'googlefonts', 'Bungee Inline': 'googlefonts', 'Bungee Outline': 'googlefonts', 'Bungee Shade': 'googlefonts', Butcherman: 'googlefonts', 'Butterfly Kids': 'googlefonts', Cabin: 'googlefonts', 'Cabin Condensed': 'googlefonts', 'Cabin Sketch': 'googlefonts', 'Caesar Dressing': 'googlefonts', Cagliostro: 'googlefonts', Cairo: 'googlefonts', Calligraffitti: 'googlefonts', Cambay: 'googlefonts', Cambo: 'googlefonts', Candal: 'googlefonts', Cantarell: 'googlefonts', 'Cantata One': 'googlefonts', 'Cantora One': 'googlefonts', Capriola: 'googlefonts', Cardo: 'googlefonts', Carme: 'googlefonts', 'Carrois Gothic': 'googlefonts', 'Carrois Gothic SC': 'googlefonts', 'Carter One': 'googlefonts', Catamaran: 'googlefonts', Caudex: 'googlefonts', Caveat: 'googlefonts', 'Caveat Brush': 'googlefonts', 'Cedarville Cursive': 'googlefonts', 'Ceviche One': 'googlefonts', 'Chakra Petch': 'googlefonts', Changa: 'googlefonts', 'Changa One': 'googlefonts', Chango: 'googlefonts', Charmonman: 'googlefonts', Chathura: 'googlefonts', 'Chau Philomene One': 'googlefonts', 'Chela One': 'googlefonts', 'Chelsea Market': 'googlefonts', Chenla: 'googlefonts', 'Cherry Cream Soda': 'googlefonts', 'Cherry Swash': 'googlefonts', Chewy: 'googlefonts', Chicle: 'googlefonts', Chivo: 'googlefonts', Chonburi: 'googlefonts', Cinzel: 'googlefonts', 'Cinzel Decorative': 'googlefonts', 'Clicker Script': 'googlefonts', Coda: 'googlefonts', 'Coda Caption': 'googlefonts', Codystar: 'googlefonts', Coiny: 'googlefonts', Combo: 'googlefonts', Comfortaa: 'googlefonts', 'Coming Soon': 'googlefonts', 'Concert One': 'googlefonts', Condiment: 'googlefonts', Content: 'googlefonts', 'Contrail One': 'googlefonts', Convergence: 'googlefonts', Cookie: 'googlefonts', Copse: 'googlefonts', Corben: 'googlefonts', Cormorant: 'googlefonts', 'Cormorant Garamond': 'googlefonts', 'Cormorant Infant': 'googlefonts', 'Cormorant SC': 'googlefonts', 'Cormorant Unicase': 'googlefonts', 'Cormorant Upright': 'googlefonts', Courgette: 'googlefonts', Cousine: 'googlefonts', Coustard: 'googlefonts', 'Covered By Your Grace': 'googlefonts', 'Crafty Girls': 'googlefonts', Creepster: 'googlefonts', 'Crete Round': 'googlefonts', 'Crimson Text': 'googlefonts', 'Croissant One': 'googlefonts', Crushed: 'googlefonts', Cuprum: 'googlefonts', 'Cute Font': 'googlefonts', Cutive: 'googlefonts', 'Cutive Mono': 'googlefonts', Damion: 'googlefonts', 'Dancing Script': 'googlefonts', Dangrek: 'googlefonts', 'David Libre': 'googlefonts', 'Dawning of a New Day': 'googlefonts', 'Days One': 'googlefonts', Dekko: 'googlefonts', Delius: 'googlefonts', 'Delius Swash Caps': 'googlefonts', 'Delius Unicase': 'googlefonts', 'Della Respira': 'googlefonts', 'Denk One': 'googlefonts', Devonshire: 'googlefonts', Dhurjati: 'googlefonts', 'Didact Gothic': 'googlefonts', Diplomata: 'googlefonts', 'Diplomata SC': 'googlefonts', 'Do Hyeon': 'googlefonts', Dokdo: 'googlefonts', Domine: 'googlefonts', 'Donegal One': 'googlefonts', 'Doppio One': 'googlefonts', Dorsa: 'googlefonts', Dosis: 'googlefonts', 'Dr Sugiyama': 'googlefonts', 'Droid Arabic Kufi': 'earlyaccess', 'Droid Arabic Naskh': 'earlyaccess', 'Duru Sans': 'googlefonts', Dynalight: 'googlefonts', 'EB Garamond': 'googlefonts', 'Eagle Lake': 'googlefonts', 'East Sea Dokdo': 'googlefonts', Eater: 'googlefonts', Economica: 'googlefonts', Eczar: 'googlefonts', 'El Messiri': 'googlefonts', Electrolize: 'googlefonts', Elsie: 'googlefonts', 'Elsie Swash Caps': 'googlefonts', 'Emblema One': 'googlefonts', 'Emilys Candy': 'googlefonts', 'Encode Sans': 'googlefonts', 'Encode Sans Condensed': 'googlefonts', 'Encode Sans Expanded': 'googlefonts', 'Encode Sans Semi Condensed': 'googlefonts', 'Encode Sans Semi Expanded': 'googlefonts', Engagement: 'googlefonts', Englebert: 'googlefonts', Enriqueta: 'googlefonts', 'Erica One': 'googlefonts', Esteban: 'googlefonts', 'Euphoria Script': 'googlefonts', Ewert: 'googlefonts', Exo: 'googlefonts', 'Exo 2': 'googlefonts', 'Expletus Sans': 'googlefonts', Fahkwang: 'googlefonts', 'Fanwood Text': 'googlefonts', Farsan: 'googlefonts', Fascinate: 'googlefonts', 'Fascinate Inline': 'googlefonts', 'Faster One': 'googlefonts', Fasthand: 'googlefonts', 'Fauna One': 'googlefonts', Faustina: 'googlefonts', Federant: 'googlefonts', Federo: 'googlefonts', Felipa: 'googlefonts', Fenix: 'googlefonts', 'Finger Paint': 'googlefonts', 'Fira Mono': 'googlefonts', 'Fira Sans': 'googlefonts', 'Fira Sans Condensed': 'googlefonts', 'Fira Sans Extra Condensed': 'googlefonts', 'Fjalla One': 'googlefonts', 'Fjord One': 'googlefonts', Flamenco: 'googlefonts', Flavors: 'googlefonts', Fondamento: 'googlefonts', 'Fontdiner Swanky': 'googlefonts', Forum: 'googlefonts', 'Francois One': 'googlefonts', 'Frank Ruhl Libre': 'googlefonts', 'Freckle Face': 'googlefonts', 'Fredericka the Great': 'googlefonts', 'Fredoka One': 'googlefonts', Freehand: 'googlefonts', Fresca: 'googlefonts', Frijole: 'googlefonts', Fruktur: 'googlefonts', 'Fugaz One': 'googlefonts', 'GFS Didot': 'googlefonts', 'GFS Neohellenic': 'googlefonts', Gabriela: 'googlefonts', Gaegu: 'googlefonts', Gafata: 'googlefonts', Galada: 'googlefonts', Galdeano: 'googlefonts', Galindo: 'googlefonts', 'Gamja Flower': 'googlefonts', 'Gentium Basic': 'googlefonts', 'Gentium Book Basic': 'googlefonts', Geo: 'googlefonts', Geostar: 'googlefonts', 'Geostar Fill': 'googlefonts', 'Germania One': 'googlefonts', Gidugu: 'googlefonts', 'Gilda Display': 'googlefonts', 'Give You Glory': 'googlefonts', 'Glass Antiqua': 'googlefonts', Glegoo: 'googlefonts', 'Gloria Hallelujah': 'googlefonts', 'Goblin One': 'googlefonts', 'Gochi Hand': 'googlefonts', Gorditas: 'googlefonts', 'Gothic A1': 'googlefonts', 'Goudy Bookletter 1911': 'googlefonts', Graduate: 'googlefonts', 'Grand Hotel': 'googlefonts', 'Gravitas One': 'googlefonts', 'Great Vibes': 'googlefonts', Griffy: 'googlefonts', Gruppo: 'googlefonts', Gudea: 'googlefonts', Gugi: 'googlefonts', Gurajada: 'googlefonts', Habibi: 'googlefonts', Halant: 'googlefonts', 'Hammersmith One': 'googlefonts', Hanalei: 'googlefonts', 'Hanalei Fill': 'googlefonts', Handlee: 'googlefonts', Hanuman: 'googlefonts', 'Happy Monkey': 'googlefonts', Harmattan: 'googlefonts', 'Headland One': 'googlefonts', Heebo: 'googlefonts', 'Henny Penny': 'googlefonts', 'Herr Von Muellerhoff': 'googlefonts', 'Hi Melody': 'googlefonts', Hind: 'googlefonts', 'Hind Guntur': 'googlefonts', 'Hind Madurai': 'googlefonts', 'Hind Siliguri': 'googlefonts', 'Hind Vadodara': 'googlefonts', 'Holtwood One SC': 'googlefonts', 'Homemade Apple': 'googlefonts', Homenaje: 'googlefonts', 'IBM Plex Mono': 'googlefonts', 'IBM Plex Sans': 'googlefonts', 'IBM Plex Sans Condensed': 'googlefonts', 'IBM Plex Serif': 'googlefonts', 'IM Fell DW Pica': 'googlefonts', 'IM Fell DW Pica SC': 'googlefonts', 'IM Fell Double Pica': 'googlefonts', 'IM Fell Double Pica SC': 'googlefonts', 'IM Fell English': 'googlefonts', 'IM Fell English SC': 'googlefonts', 'IM Fell French Canon': 'googlefonts', 'IM Fell French Canon SC': 'googlefonts', 'IM Fell Great Primer': 'googlefonts', 'IM Fell Great Primer SC': 'googlefonts', Iceberg: 'googlefonts', Iceland: 'googlefonts', Imprima: 'googlefonts', Inconsolata: 'googlefonts', Inder: 'googlefonts', 'Indie Flower': 'googlefonts', Inika: 'googlefonts', 'Inknut Antiqua': 'googlefonts', 'Irish Grover': 'googlefonts', 'Istok Web': 'googlefonts', Italiana: 'googlefonts', Italianno: 'googlefonts', Itim: 'googlefonts', 'Jacques Francois': 'googlefonts', 'Jacques Francois Shadow': 'googlefonts', Jaldi: 'googlefonts', 'Jim Nightshade': 'googlefonts', 'Jockey One': 'googlefonts', 'Jolly Lodger': 'googlefonts', Jomhuria: 'googlefonts', 'Josefin Sans': 'googlefonts', 'Josefin Slab': 'googlefonts', 'Joti One': 'googlefonts', Jua: 'googlefonts', Judson: 'googlefonts', Julee: 'googlefonts', 'Julius Sans One': 'googlefonts', Junge: 'googlefonts', Jura: 'googlefonts', 'Just Another Hand': 'googlefonts', 'Just Me Again Down Here': 'googlefonts', K2D: 'googlefonts', Kadwa: 'googlefonts', Kalam: 'googlefonts', Kameron: 'googlefonts', Kanit: 'googlefonts', Kantumruy: 'googlefonts', Karla: 'googlefonts', Karma: 'googlefonts', Katibeh: 'googlefonts', 'Kaushan Script': 'googlefonts', Kavivanar: 'googlefonts', Kavoon: 'googlefonts', 'Kdam Thmor': 'googlefonts', 'Keania One': 'googlefonts', 'Kelly Slab': 'googlefonts', Kenia: 'googlefonts', Khand: 'googlefonts', Khmer: 'googlefonts', Khula: 'googlefonts', 'Kirang Haerang': 'googlefonts', 'Kite One': 'googlefonts', Knewave: 'googlefonts', KoHo: 'googlefonts', Kodchasan: 'googlefonts', Kosugi: 'googlefonts', 'Kosugi Maru': 'googlefonts', 'Kotta One': 'googlefonts', Koulen: 'googlefonts', Kranky: 'googlefonts', Kreon: 'googlefonts', Kristi: 'googlefonts', 'Krona One': 'googlefonts', Krub: 'googlefonts', 'Kumar One': 'googlefonts', 'Kumar One Outline': 'googlefonts', Kurale: 'googlefonts', 'La Belle Aurore': 'googlefonts', Laila: 'googlefonts', 'Lakki Reddy': 'googlefonts', Lalezar: 'googlefonts', Lancelot: 'googlefonts', Lateef: 'googlefonts', Lato: 'googlefonts', 'League Script': 'googlefonts', 'Leckerli One': 'googlefonts', Ledger: 'googlefonts', Lekton: 'googlefonts', Lemon: 'googlefonts', Lemonada: 'googlefonts', 'Libre Barcode 128': 'googlefonts', 'Libre Barcode 128 Text': 'googlefonts', 'Libre Barcode 39': 'googlefonts', 'Libre Barcode 39 Extended': 'googlefonts', 'Libre Barcode 39 Extended Text': 'googlefonts', 'Libre Barcode 39 Text': 'googlefonts', 'Libre Baskerville': 'googlefonts', 'Libre Franklin': 'googlefonts', 'Life Savers': 'googlefonts', 'Lilita One': 'googlefonts', 'Lily Script One': 'googlefonts', Limelight: 'googlefonts', 'Linden Hill': 'googlefonts', Lobster: 'googlefonts', 'Lobster Two': 'googlefonts', 'Londrina Outline': 'googlefonts', 'Londrina Shadow': 'googlefonts', 'Londrina Sketch': 'googlefonts', 'Londrina Solid': 'googlefonts', Lora: 'googlefonts', 'Love Ya Like A Sister': 'googlefonts', 'Loved by the King': 'googlefonts', 'Lovers Quarrel': 'googlefonts', 'Luckiest Guy': 'googlefonts', Lusitana: 'googlefonts', Lustria: 'googlefonts', 'M PLUS 1p': 'googlefonts', 'M PLUS Rounded 1c': 'googlefonts', Macondo: 'googlefonts', 'Macondo Swash Caps': 'googlefonts', Mada: 'googlefonts', Magra: 'googlefonts', 'Maiden Orange': 'googlefonts', Maitree: 'googlefonts', Mako: 'googlefonts', Mali: 'googlefonts', Mallanna: 'googlefonts', Mandali: 'googlefonts', Manuale: 'googlefonts', Marcellus: 'googlefonts', 'Marcellus SC': 'googlefonts', 'Marck Script': 'googlefonts', Margarine: 'googlefonts', 'Markazi Text': 'googlefonts', 'Marko One': 'googlefonts', Marmelad: 'googlefonts', Martel: 'googlefonts', 'Martel Sans': 'googlefonts', Marvel: 'googlefonts', Mate: 'googlefonts', 'Mate SC': 'googlefonts', 'Maven Pro': 'googlefonts', McLaren: 'googlefonts', Meddon: 'googlefonts', MedievalSharp: 'googlefonts', 'Medula One': 'googlefonts', 'Meera Inimai': 'googlefonts', Megrim: 'googlefonts', 'Meie Script': 'googlefonts', Merienda: 'googlefonts', 'Merienda One': 'googlefonts', Merriweather: 'googlefonts', 'Merriweather Sans': 'googlefonts', Metal: 'googlefonts', 'Metal Mania': 'googlefonts', Metamorphous: 'googlefonts', Metrophobic: 'googlefonts', Michroma: 'googlefonts', Milonga: 'googlefonts', Miltonian: 'googlefonts', 'Miltonian Tattoo': 'googlefonts', Mina: 'googlefonts', Miniver: 'googlefonts', 'Miriam Libre': 'googlefonts', Mirza: 'googlefonts', 'Miss Fajardose': 'googlefonts', Mitr: 'googlefonts', Modak: 'googlefonts', 'Modern Antiqua': 'googlefonts', Mogra: 'googlefonts', Molengo: 'googlefonts', Molle: 'googlefonts', Monda: 'googlefonts', Monofett: 'googlefonts', Monoton: 'googlefonts', 'Monsieur La Doulaise': 'googlefonts', Montaga: 'googlefonts', Montez: 'googlefonts', Montserrat: 'googlefonts', 'Montserrat Alternates': 'googlefonts', 'Montserrat Subrayada': 'googlefonts', Moul: 'googlefonts', Moulpali: 'googlefonts', 'Mountains of Christmas': 'googlefonts', 'Mouse Memoirs': 'googlefonts', 'Mr Bedfort': 'googlefonts', 'Mr Dafoe': 'googlefonts', 'Mr De Haviland': 'googlefonts', 'Mrs Saint Delafield': 'googlefonts', 'Mrs Sheppards': 'googlefonts', Mukta: 'googlefonts', 'Mukta Mahee': 'googlefonts', 'Mukta Malar': 'googlefonts', 'Mukta Vaani': 'googlefonts', Muli: 'googlefonts', 'Mystery Quest': 'googlefonts', NTR: 'googlefonts', 'Nanum Brush Script': 'googlefonts', 'Nanum Gothic': 'googlefonts', 'Nanum Gothic Coding': 'googlefonts', 'Nanum Myeongjo': 'googlefonts', 'Nanum Pen Script': 'googlefonts', Neucha: 'googlefonts', Neuton: 'googlefonts', 'New Rocker': 'googlefonts', 'News Cycle': 'googlefonts', Niconne: 'googlefonts', Niramit: 'googlefonts', 'Nixie One': 'googlefonts', Nobile: 'googlefonts', Nokora: 'googlefonts', Norican: 'googlefonts', Nosifer: 'googlefonts', Notable: 'googlefonts', 'Nothing You Could Do': 'googlefonts', 'Noticia Text': 'googlefonts', 'Noto Kufi Arabic': 'earlyaccess', 'Noto Naskh Arabic': 'earlyaccess', 'Noto Sans': 'googlefonts', 'Noto Sans Hebrew': 'earlyaccess', 'Noto Sans JP': 'googlefonts', 'Noto Sans KR': 'googlefonts', 'Noto Serif': 'googlefonts', 'Noto Serif JP': 'googlefonts', 'Noto Serif KR': 'googlefonts', 'Nova Cut': 'googlefonts', 'Nova Flat': 'googlefonts', 'Nova Mono': 'googlefonts', 'Nova Oval': 'googlefonts', 'Nova Round': 'googlefonts', 'Nova Script': 'googlefonts', 'Nova Slim': 'googlefonts', 'Nova Square': 'googlefonts', Numans: 'googlefonts', Nunito: 'googlefonts', 'Nunito Sans': 'googlefonts', 'Odor Mean Chey': 'googlefonts', Offside: 'googlefonts', 'Old Standard TT': 'googlefonts', Oldenburg: 'googlefonts', 'Oleo Script': 'googlefonts', 'Oleo Script Swash Caps': 'googlefonts', 'Open Sans': 'googlefonts', 'Open Sans Condensed': 'googlefonts', 'Open Sans Hebrew': 'earlyaccess', 'Open Sans Hebrew Condensed': 'earlyaccess', Oranienbaum: 'googlefonts', Orbitron: 'googlefonts', Oregano: 'googlefonts', Orienta: 'googlefonts', 'Original Surfer': 'googlefonts', Oswald: 'googlefonts', 'Over the Rainbow': 'googlefonts', Overlock: 'googlefonts', 'Overlock SC': 'googlefonts', Overpass: 'googlefonts', 'Overpass Mono': 'googlefonts', Ovo: 'googlefonts', Oxygen: 'googlefonts', 'Oxygen Mono': 'googlefonts', 'PT Mono': 'googlefonts', 'PT Sans': 'googlefonts', 'PT Sans Caption': 'googlefonts', 'PT Sans Narrow': 'googlefonts', 'PT Serif': 'googlefonts', 'PT Serif Caption': 'googlefonts', Pacifico: 'googlefonts', Padauk: 'googlefonts', Palanquin: 'googlefonts', 'Palanquin Dark': 'googlefonts', Pangolin: 'googlefonts', Paprika: 'googlefonts', Parisienne: 'googlefonts', 'Passero One': 'googlefonts', 'Passion One': 'googlefonts', 'Pathway Gothic One': 'googlefonts', 'Patrick Hand': 'googlefonts', 'Patrick Hand SC': 'googlefonts', Pattaya: 'googlefonts', 'Patua One': 'googlefonts', Pavanam: 'googlefonts', 'Paytone One': 'googlefonts', Peddana: 'googlefonts', Peralta: 'googlefonts', 'Permanent Marker': 'googlefonts', 'Petit Formal Script': 'googlefonts', Petrona: 'googlefonts', Philosopher: 'googlefonts', Piedra: 'googlefonts', 'Pinyon Script': 'googlefonts', 'Pirata One': 'googlefonts', Plaster: 'googlefonts', Play: 'googlefonts', Playball: 'googlefonts', 'Playfair Display': 'googlefonts', 'Playfair Display SC': 'googlefonts', Podkova: 'googlefonts', 'Poiret One': 'googlefonts', 'Poller One': 'googlefonts', Poly: 'googlefonts', Pompiere: 'googlefonts', 'Pontano Sans': 'googlefonts', 'Poor Story': 'googlefonts', Poppins: 'googlefonts', 'Port Lligat Sans': 'googlefonts', 'Port Lligat Slab': 'googlefonts', 'Pragati Narrow': 'googlefonts', Prata: 'googlefonts', Preahvihear: 'googlefonts', 'Press Start 2P': 'googlefonts', Pridi: 'googlefonts', 'Princess Sofia': 'googlefonts', Prociono: 'googlefonts', Prompt: 'googlefonts', 'Prosto One': 'googlefonts', 'Proza Libre': 'googlefonts', Puritan: 'googlefonts', 'Purple Purse': 'googlefonts', Quando: 'googlefonts', Quantico: 'googlefonts', Quattrocento: 'googlefonts', 'Quattrocento Sans': 'googlefonts', Questrial: 'googlefonts', Quicksand: 'googlefonts', Quintessential: 'googlefonts', Qwigley: 'googlefonts', 'Racing Sans One': 'googlefonts', Radley: 'googlefonts', Rajdhani: 'googlefonts', Rakkas: 'googlefonts', Raleway: 'googlefonts', 'Raleway Dots': 'googlefonts', Ramabhadra: 'googlefonts', Ramaraja: 'googlefonts', Rambla: 'googlefonts', 'Rammetto One': 'googlefonts', Ranchers: 'googlefonts', Rancho: 'googlefonts', Ranga: 'googlefonts', Rasa: 'googlefonts', Rationale: 'googlefonts', 'Ravi Prakash': 'googlefonts', Redressed: 'googlefonts', 'Reem Kufi': 'googlefonts', 'Reenie Beanie': 'googlefonts', Revalia: 'googlefonts', 'Rhodium Libre': 'googlefonts', Ribeye: 'googlefonts', 'Ribeye Marrow': 'googlefonts', Righteous: 'googlefonts', Risque: 'googlefonts', Roboto: 'googlefonts', 'Roboto Condensed': 'googlefonts', 'Roboto Mono': 'googlefonts', 'Roboto Slab': 'googlefonts', Rochester: 'googlefonts', 'Rock Salt': 'googlefonts', Rokkitt: 'googlefonts', Romanesco: 'googlefonts', 'Ropa Sans': 'googlefonts', Rosario: 'googlefonts', Rosarivo: 'googlefonts', 'Rouge Script': 'googlefonts', 'Rozha One': 'googlefonts', Rubik: 'googlefonts', 'Rubik Mono One': 'googlefonts', Ruda: 'googlefonts', Rufina: 'googlefonts', 'Ruge Boogie': 'googlefonts', Ruluko: 'googlefonts', 'Rum Raisin': 'googlefonts', 'Ruslan Display': 'googlefonts', 'Russo One': 'googlefonts', Ruthie: 'googlefonts', Rye: 'googlefonts', Sacramento: 'googlefonts', Sahitya: 'googlefonts', Sail: 'googlefonts', Saira: 'googlefonts', 'Saira Condensed': 'googlefonts', 'Saira Extra Condensed': 'googlefonts', 'Saira Semi Condensed': 'googlefonts', Salsa: 'googlefonts', Sanchez: 'googlefonts', Sancreek: 'googlefonts', Sansita: 'googlefonts', Sarala: 'googlefonts', Sarina: 'googlefonts', Sarpanch: 'googlefonts', Satisfy: 'googlefonts', 'Sawarabi Gothic': 'googlefonts', 'Sawarabi Mincho': 'googlefonts', Scada: 'googlefonts', Scheherazade: 'googlefonts', Schoolbell: 'googlefonts', 'Scope One': 'googlefonts', 'Seaweed Script': 'googlefonts', 'Secular One': 'googlefonts', 'Sedgwick Ave': 'googlefonts', 'Sedgwick Ave Display': 'googlefonts', Sevillana: 'googlefonts', 'Seymour One': 'googlefonts', 'Shadows Into Light': 'googlefonts', 'Shadows Into Light Two': 'googlefonts', Shanti: 'googlefonts', Share: 'googlefonts', 'Share Tech': 'googlefonts', 'Share Tech Mono': 'googlefonts', Shojumaru: 'googlefonts', 'Short Stack': 'googlefonts', Shrikhand: 'googlefonts', Siemreap: 'googlefonts', 'Sigmar One': 'googlefonts', Signika: 'googlefonts', 'Signika Negative': 'googlefonts', Simonetta: 'googlefonts', Sintony: 'googlefonts', 'Sirin Stencil': 'googlefonts', 'Six Caps': 'googlefonts', Skranji: 'googlefonts', 'Slabo 13px': 'googlefonts', 'Slabo 27px': 'googlefonts', Slackey: 'googlefonts', Smokum: 'googlefonts', Smythe: 'googlefonts', Sniglet: 'googlefonts', Snippet: 'googlefonts', 'Snowburst One': 'googlefonts', 'Sofadi One': 'googlefonts', Sofia: 'googlefonts', 'Song Myung': 'googlefonts', 'Sonsie One': 'googlefonts', 'Sorts Mill Goudy': 'googlefonts', 'Source Code Pro': 'googlefonts', 'Source Sans Pro': 'googlefonts', 'Source Serif Pro': 'googlefonts', 'Space Mono': 'googlefonts', 'Special Elite': 'googlefonts', Spectral: 'googlefonts', 'Spectral SC': 'googlefonts', 'Spicy Rice': 'googlefonts', Spinnaker: 'googlefonts', Spirax: 'googlefonts', 'Squada One': 'googlefonts', 'Sree Krushnadevaraya': 'googlefonts', Sriracha: 'googlefonts', Srisakdi: 'googlefonts', Stalemate: 'googlefonts', 'Stalinist One': 'googlefonts', 'Stardos Stencil': 'googlefonts', 'Stint Ultra Condensed': 'googlefonts', 'Stint Ultra Expanded': 'googlefonts', Stoke: 'googlefonts', Strait: 'googlefonts', Stylish: 'googlefonts', 'Sue Ellen Francisco': 'googlefonts', 'Suez One': 'googlefonts', Sumana: 'googlefonts', Sunflower: 'googlefonts', Sunshiney: 'googlefonts', 'Supermercado One': 'googlefonts', Sura: 'googlefonts', Suranna: 'googlefonts', Suravaram: 'googlefonts', Suwannaphum: 'googlefonts', 'Swanky and Moo Moo': 'googlefonts', Syncopate: 'googlefonts', Tajawal: 'googlefonts', Tangerine: 'googlefonts', Taprom: 'googlefonts', Tauri: 'googlefonts', Taviraj: 'googlefonts', Teko: 'googlefonts', Telex: 'googlefonts', 'Tenali Ramakrishna': 'googlefonts', 'Tenor Sans': 'googlefonts', 'Text Me One': 'googlefonts', 'The Girl Next Door': 'googlefonts', Tienne: 'googlefonts', Tillana: 'googlefonts', Timmana: 'googlefonts', Tinos: 'googlefonts', 'Titan One': 'googlefonts', 'Titillium Web': 'googlefonts', 'Trade Winds': 'googlefonts', Trirong: 'googlefonts', Trocchi: 'googlefonts', Trochut: 'googlefonts', Trykker: 'googlefonts', 'Tulpen One': 'googlefonts', Ubuntu: 'googlefonts', 'Ubuntu Condensed': 'googlefonts', 'Ubuntu Mono': 'googlefonts', Ultra: 'googlefonts', 'Uncial Antiqua': 'googlefonts', Underdog: 'googlefonts', 'Unica One': 'googlefonts', UnifrakturCook: 'googlefonts', UnifrakturMaguntia: 'googlefonts', Unkempt: 'googlefonts', Unlock: 'googlefonts', Unna: 'googlefonts', VT323: 'googlefonts', 'Vampiro One': 'googlefonts', Varela: 'googlefonts', 'Varela Round': 'googlefonts', 'Vast Shadow': 'googlefonts', 'Vesper Libre': 'googlefonts', Vibur: 'googlefonts', Vidaloka: 'googlefonts', Viga: 'googlefonts', Voces: 'googlefonts', Volkhov: 'googlefonts', Vollkorn: 'googlefonts', 'Vollkorn SC': 'googlefonts', Voltaire: 'googlefonts', 'Waiting for the Sunrise': 'googlefonts', Wallpoet: 'googlefonts', 'Walter Turncoat': 'googlefonts', Warnes: 'googlefonts', Wellfleet: 'googlefonts', 'Wendy One': 'googlefonts', 'Wire One': 'googlefonts', 'Work Sans': 'googlefonts', 'Yanone Kaffeesatz': 'googlefonts', Yantramanav: 'googlefonts', 'Yatra One': 'googlefonts', Yellowtail: 'googlefonts', 'Yeon Sung': 'googlefonts', 'Yeseva One': 'googlefonts', Yesteryear: 'googlefonts', Yrsa: 'googlefonts', Zeyada: 'googlefonts', 'Zilla Slab': 'googlefonts', 'Zilla Slab Highlight': 'googlefonts', test: 'custom' }, features: [] },
		repeater: {
			item_actions: { add: true, duplicate: true, remove: true, sort: true },
		},
	},
	autosave_interval: 1000,
};

const elementorFrontend = {
	elements: {
		window,
		$window: jQuery( window ),
	},
	config: { elements: { data: {}, editSettings: {} }, breakpoints: {} },
	isEditMode: () => {
	},
	elementsHandler: {
		runReadyTrigger: () => {
		},
	},
};

const originalGet = Marionette.TemplateCache.get;

Marionette.TemplateCache.get = function( template ) {
	if ( jQuery( template ).length ) {
		return originalGet.apply( Marionette.TemplateCache, [ template ] );
	}

	return () => `<div class="${ template }"></div>`;
};

Marionette.Region.prototype._ensureElement = () => {
	return true;
};

Marionette.Region.prototype.attachHtml = () => {
};

Marionette.CompositeView.prototype.getChildViewContainer = ( containerView ) => {
	containerView.$childViewContainer = jQuery( '<div />' );
	containerView.$childViewContainer.appendTo( '#qunit-fixture' );
	return containerView.$childViewContainer;
};

fixture.setBase( 'tests/qunit' );

QUnit.testStart( ( { module, name } ) => {
	fixture.load( 'index.html' );
} );

QUnit.testDone( ( { module, name } ) => {
	fixture.cleanup();
} );
