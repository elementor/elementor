<?php
namespace Elementor\Core\Files\Assets\Svg;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Svg_Handler {
	/**
	 * Inline svg attachment meta key
	 */
	const META_KEY = '_elementor_inline_svg';

	const MIME_TYPE = 'image/svg+xml';

	const SCRIPT_REGEX = '/(?:\w+script|data):/xi';

	/**
	 * @var \DOMDocument
	 */
	private $svg_dom = null;

	/**
	 * Attachment ID.
	 *
	 * Holds the current attachment ID.
	 *
	 * @var int
	 */
	private $attachment_id;

	public static function get_name() {
		return 'svg-handler';
	}

	/**
	 * @return bool
	 */
	public static function is_svg_uploads_enabled() {
		return ! ! get_option( 'elementor_allow_svg', false );
	}

	/**
	 * svg_sanitizer_can_run
	 * @return bool
	 */
	public static function svg_sanitizer_can_run() {
		return class_exists( 'DOMDocument' ) && class_exists( 'SimpleXMLElement' );
	}

	/**
	 * set_attachment_id
	 * @param $attachment_id
	 *
	 * @return int
	 */
	public function set_attachment_id( $attachment_id ) {
		$this->attachment_id = $attachment_id;
		return $this->attachment_id;
	}

	/**
	 * get_attachment_id
	 * @return int
	 */
	public function get_attachment_id() {
		return $this->attachment_id;
	}

	/**
	 * get_meta
	 * @return mixed
	 */
	protected function get_meta() {
		return get_post_meta( $this->attachment_id, self::META_KEY, true );
	}

	/**
	 * update_meta
	 * @param $meta
	 */
	protected function update_meta( $meta ) {
		update_post_meta( $this->attachment_id, self::META_KEY, $meta );
	}

	/**
	 * delete_meta
	 */
	protected function delete_meta() {
		delete_post_meta( $this->attachment_id, self::META_KEY );
	}

	/**
	 * delete_meta_cache
	 */
	public function delete_meta_cache() {
		delete_post_meta_by_key( self::META_KEY );
	}

	/**
	 * read_from_file
	 * @return bool|string
	 */
	public function read_from_file() {
		return file_get_contents( get_attached_file( $this->attachment_id ) );
	}

	/**
	 * get_inline_svg
	 * @param $attachment_id
	 *
	 * @return bool|mixed|string
	 */
	public static function get_inline_svg( $attachment_id ) {
		$svg = get_post_meta( $attachment_id, self::META_KEY, true );
		if ( ! empty( $svg ) ) {
			return $svg;
		}

		$svg = file_get_contents( get_attached_file( $attachment_id ) );
		if ( ! empty( $svg ) ) {
			update_post_meta( $attachment_id, self::META_KEY, $svg );
		}

		return $svg;
	}

	public function upload_mimes( $allowed_types ) {
		if ( $this->is_elementor_media_upload() ) {
			$allowed_types['svg'] = self::MIME_TYPE;
		}
		return $allowed_types;
	}

	/**
	 * wp_handle_upload_prefilter
	 * @param $file
	 *
	 * @return mixed
	 */
	public function wp_handle_upload_prefilter( $file ) {
		if ( ! $this->is_elementor_media_upload() || self::MIME_TYPE !== $file['type'] ) {
			return $file;
		}

		$ext = pathinfo( $file['name'], PATHINFO_EXTENSION );

		if ( 'svg' !== $ext ) {
			$file['error'] = sprintf( __( 'The uploaded %s file is not supported. Please upload a valid svg file', 'elementor' ), $ext );
			return $file;
		}

		if ( ! self::is_enabled() ) {
			$file['error'] = __( 'SVG file is not allowed for security reasons', 'elementor' );
			return $file;
		}

		if ( self::svg_sanitizer_can_run() && ! $this->sanitize_svg( $file['tmp_name'] ) ) {
			$file['error'] = __( 'Invalid SVG Format, file not uploaded for security reasons', 'elementor' );
		}

		return $file;
	}

	/**
	 * is_elementor_media_upload
	 * @return bool
	 */
	private function is_elementor_media_upload() {
		return isset( $_POST['uploadTypeCaller'] ) && 'elementor-editor-upload' === $_POST['uploadTypeCaller']; // phpcs:ignore
	}

	/**
	 * wp_check_filetype_and_ext
	 * A workaround for upload validation which relies on a PHP extension (fileinfo)
	 * with inconsistent reporting behaviour.
	 * ref: https://core.trac.wordpress.org/ticket/39550
	 * ref: https://core.trac.wordpress.org/ticket/40175
	 *
	 * @param $data
	 * @param $file
	 * @param $filename
	 * @param $mimes
	 *
	 * @return mixed
	 */
	public function wp_check_filetype_and_ext( $data, $file, $filename, $mimes ) {
		if ( ! empty( $data['ext'] ) && ! empty( $data['type'] ) ) {
			return $data;
		}

		$filetype = wp_check_filetype( $filename, $mimes );

		if ( 'svg' === $filetype['ext'] ) {
			$data['ext'] = 'svg';
			$data['type'] = self::MIME_TYPE;
		}

		return $data;
	}

	/**
	 * Check if the contents are gzipped
	 * @see http://www.gzip.org/zlib/rfc-gzip.html#member-format
	 *
	 * @param $contents
	 * @return bool
	 */
	private function is_encoded( $contents ) {
		$needle = "\x1f\x8b\x08";
		if ( function_exists( 'mb_strpos' ) ) {
			return 0 === mb_strpos( $contents, $needle );
		} else {
			return 0 === strpos( $contents, $needle );
		}
	}

	/**
	 * decode_svg
	 * @param $content
	 *
	 * @return string
	 */
	private function decode_svg( $content ) {
		return gzdecode( $content );
	}

	/**
	 * encode_svg
	 * @param $content
	 *
	 * @return string
	 */
	private function encode_svg( $content ) {
		return gzencode( $content );
	}

	/**
	 * sanitize_svg
	 * @param $filename
	 *
	 * @return bool
	 */
	public function sanitize_svg( $filename ) {
		$original_content = file_get_contents( $filename );
		$is_encoded = $this->is_encoded( $original_content );

		if ( $is_encoded ) {
			$decoded = $this->decode_svg( $original_content );
			if ( false === $decoded ) {
				return false;
			}
			$original_content = $decoded;
		}

		$valid_svg = $this->sanitizer( $original_content );

		if ( false === $valid_svg ) {
			return false;
		}

		// If we were gzipped, we need to re-zip
		if ( $is_encoded ) {
			$valid_svg = $this->encode_svg( $valid_svg );
		}
		file_put_contents( $filename, $valid_svg );

		return true;
	}

	/**
	 * is_allowed_tag
	 * @param $element
	 *
	 * @return bool
	 */
	private function is_allowed_tag( $element ) {
		static $allowed_tags = false;
		if ( false === $allowed_tags ) {
			$allowed_tags = $this->get_allowed_elements();
		}

		$tag_name = $element->tagName; // phpcs:ignore -- php DomDocument

		if ( ! in_array( strtolower( $tag_name ), $allowed_tags ) ) {
			$this->remove_element( $element );
			return false;
		}

		return true;
	}

	private function remove_element( $element ) {
		$element->parentNode->removeChild( $element ); // phpcs:ignore -- php DomDocument
	}

	/**
	 * is_a_attribute
	 * @param $name
	 * @param $check
	 *
	 * @return bool
	 */
	private function is_a_attribute( $name, $check ) {
		return 0 === strpos( $name, $check . '-' );
	}

	/**
	 * is_remote_value
	 * @param $value
	 *
	 * @return string
	 */
	private function is_remote_value( $value ) {
		$value = trim( preg_replace( '/[^ -~]/xu', '', $value ) );
		$wrapped_in_url = preg_match( '~^url\(\s*[\'"]\s*(.*)\s*[\'"]\s*\)$~xi', $value, $match );
		if ( ! $wrapped_in_url ) {
			return false;
		}

		$value = trim( $match[1], '\'"' );
		return preg_match( '~^((https?|ftp|file):)?//~xi', $value );
	}

	/**
	 * has_js_value
	 * @param $value
	 *
	 * @return false|int
	 */
	private function has_js_value( $value ) {
		return preg_match( '/(script|javascript|alert\(|window\.|document)/i', $value );
	}

	/**
	 * get_allowed_attributes
	 * @return array
	 */
	private function get_allowed_attributes() {
		$allowed_attributes = [
			'class',
			'clip-path',
			'clip-rule',
			'fill',
			'fill-opacity',
			'fill-rule',
			'filter',
			'id',
			'mask',
			'opacity',
			'stroke',
			'stroke-dasharray',
			'stroke-dashoffset',
			'stroke-linecap',
			'stroke-linejoin',
			'stroke-miterlimit',
			'stroke-opacity',
			'stroke-width',
			'style',
			'systemlanguage',
			'transform',
			'href',
			'xlink:href',
			'xlink:title',
			'cx',
			'cy',
			'r',
			'requiredfeatures',
			'clippathunits',
			'type',
			'rx',
			'ry',
			'color-interpolation-filters',
			'stddeviation',
			'filterres',
			'filterunits',
			'height',
			'primitiveunits',
			'width',
			'x',
			'y',
			'font-size',
			'display',
			'font-family',
			'font-style',
			'font-weight',
			'text-anchor',
			'marker-end',
			'marker-mid',
			'marker-start',
			'x1',
			'x2',
			'y1',
			'y2',
			'gradienttransform',
			'gradientunits',
			'spreadmethod',
			'markerheight',
			'markerunits',
			'markerwidth',
			'orient',
			'preserveaspectratio',
			'refx',
			'refy',
			'viewbox',
			'maskcontentunits',
			'maskunits',
			'd',
			'patterncontentunits',
			'patterntransform',
			'patternunits',
			'points',
			'fx',
			'fy',
			'offset',
			'stop-color',
			'stop-opacity',
			'xmlns',
			'xmlns:se',
			'xmlns:xlink',
			'xml:space',
			'method',
			'spacing',
			'startoffset',
			'dx',
			'dy',
			'rotate',
			'textlength',
		];

		return apply_filters( 'elementor/files/svg/allowed_attributes', $allowed_attributes );
	}

	/**
	 * get_allowed_elements
	 * @return array
	 */
	private function get_allowed_elements() {
		$allowed_elements = [
			'a',
			'circle',
			'clippath',
			'defs',
			'style',
			'desc',
			'ellipse',
			'fegaussianblur',
			'filter',
			'foreignobject',
			'g',
			'image',
			'line',
			'lineargradient',
			'marker',
			'mask',
			'metadata',
			'path',
			'pattern',
			'polygon',
			'polyline',
			'radialgradient',
			'rect',
			'stop',
			'svg',
			'switch',
			'symbol',
			'text',
			'textpath',
			'title',
			'tspan',
			'use',
		];
		return apply_filters( 'elementor/files/svg/allowed_elements', $allowed_elements );
	}

	/**
	 * validate_allowed_attributes
	 * @param \DOMElement $element
	 */
	private function validate_allowed_attributes( $element ) {
		static $allowed_attributes = false;
		if ( false === $allowed_attributes ) {
			$allowed_attributes = $this->get_allowed_attributes();
		}

		for ( $index = $element->attributes->length - 1; $index >= 0; $index-- ) {
			// get attribute name
			$attr_name = $element->attributes->item( $index )->name;
			$attr_name_lowercase = strtolower( $attr_name );
			// Remove attribute if not in whitelist
			if ( ! in_array( $attr_name_lowercase, $allowed_attributes ) && ! $this->is_a_attribute( $attr_name_lowercase, 'aria' ) && ! $this->is_a_attribute( $attr_name_lowercase, 'data' ) ) {
				$element->removeAttribute( $attr_name );
				continue;
			}

			$attr_value = $element->attributes->item( $index )->value;

			// Remove attribute if it has a remote reference or js
			if ( ! empty( $attr_value ) && ( $this->is_remote_value( $attr_value ) || $this->has_js_value( $attr_value ) ) ) {
				$element->removeAttribute( $attr_name );
				continue;
			}
		}
	}

	/**
	 * strip_xlinks
	 * @param \DOMElement $element
	 */
	private function strip_xlinks( $element ) {
		$xlinks = $element->getAttributeNS( 'http://www.w3.org/1999/xlink', 'href' );
		$allowed_links = [
			'data:image/png', // PNG
			'data:image/gif', // GIF
			'data:image/jpg', // JPG
			'data:image/jpe', // JPEG
			'data:image/pjp', // PJPEG
		];
		if ( 1 === preg_match( self::SCRIPT_REGEX, $xlinks ) ) {
			if ( ! in_array( substr( $xlinks, 0, 14 ), $allowed_links ) ) {
				$element->removeAttributeNS( 'http://www.w3.org/1999/xlink', 'href' );
			}
		}
	}

	/**
	 * validate_use_tag
	 * @param $element
	 */
	private function validate_use_tag( $element ) {
		$xlinks = $element->getAttributeNS( 'http://www.w3.org/1999/xlink', 'href' );
		if ( $xlinks && '#' !== substr( $xlinks, 0, 1 ) ) {
			$element->parentNode->removeChild( $element ); // phpcs:ignore -- php DomNode
		}
	}

	/**
	 * strip_docktype
	 */
	private function strip_doctype() {
		foreach ( $this->svg_dom->childNodes as $child ) {
			if ( XML_DOCUMENT_TYPE_NODE === $child->nodeType ) { // phpcs:ignore -- php DomDocument
				$child->parentNode->removeChild( $child ); // phpcs:ignore -- php DomDocument
			}
		}
	}

	/**
	 * strip_php_tags
	 * @param $string
	 *
	 * @return string
	 */
	private function strip_php_tags( $string ) {
		$string = preg_replace( '/<\?(=|php)(.+?)\?>/i', '', $string );
		// Remove XML, ASP, etc.
		$string = preg_replace( '/<\?(.*)\?>/Us', '', $string );
		$string = preg_replace( '/<\%(.*)\%>/Us', '', $string );

		if ( ( false !== strpos( $string, '<?' ) ) || ( false !== strpos( $string, '<%' ) ) ) {
			return '';
		}
		return $string;
	}

	/**
	 * strip_comments
	 * @param $string
	 *
	 * @return string
	 */
	private function strip_comments( $string ) {
		// Remove comments.
		$string = preg_replace( '/<!--(.*)-->/Us', '', $string );
		$string = preg_replace( '/\/\*(.*)\*\//Us', '', $string );
		if ( ( false !== strpos( $string, '<!--' ) ) || ( false !== strpos( $string, '/*' ) ) ) {
			return '';
		}
		return $string;
	}

	/**
	 * sanitize_elements
	 */
	private function sanitize_elements() {
		$elements = $this->svg_dom->getElementsByTagName( '*' );
		// loop through all elements
		// we do this backwards so we don't skip anything if we delete a node
		// see comments at: http://php.net/manual/en/class.domnamednodemap.php
		for ( $index = $elements->length - 1; $index >= 0; $index-- ) {
			/**
			 * @var \DOMElement $current_element
			 */
			$current_element = $elements->item( $index );
			// If the tag isn't in the whitelist, remove it and continue with next iteration
			if ( ! $this->is_allowed_tag( $current_element ) ) {
				continue;
			}

			//validate element attributes
			$this->validate_allowed_attributes( $current_element );

			$this->strip_xlinks( $current_element );

			$href = $current_element->getAttribute( 'href' );
			if ( 1 === preg_match( self::SCRIPT_REGEX, $href ) ) {
				$current_element->removeAttribute( 'href' );
			}

			if ( 'use' === strtolower( $current_element->tagName ) ) { // phpcs:ignore -- php DomDocument
				$this->validate_use_tag( $current_element );
			}
		}
	}

	/**
	 * sanitizer
	 * @param $content
	 *
	 * @return bool|string
	 */
	public function sanitizer( $content ) {
		// Strip php tags
		$content = $this->strip_php_tags( $content );
		$content = $this->strip_comments( $content );

		// Find the start and end tags so we can cut out miscellaneous garbage.
		$start = strpos( $content, '<svg' );
		$end = strrpos( $content, '</svg>' );
		if ( false === $start || false === $end ) {
			return false;
		}

		$content = substr( $content, $start, ( $end - $start + 6 ) );

		// Make sure to Disable the ability to load external entities
		$libxml_disable_entity_loader = libxml_disable_entity_loader( true );
		// Suppress the errors
		$libxml_use_internal_errors = libxml_use_internal_errors( true );

		// Create DomDocument instance
		$this->svg_dom = new \DOMDocument();
		$this->svg_dom->formatOutput = false;
		$this->svg_dom->preserveWhiteSpace = false;
		$this->svg_dom->strictErrorChecking = false;

		$open_svg = $this->svg_dom->loadXML( $content );
		if ( ! $open_svg ) {
			return false;
		}

		$this->strip_doctype();
		$this->sanitize_elements();

		// Export sanitized svg to string
		// Using documentElement to strip out <?xml version="1.0" encoding="UTF-8"...
		$sanitized = $this->svg_dom->saveXML( $this->svg_dom->documentElement, LIBXML_NOEMPTYTAG );

		// Restore defaults
		libxml_disable_entity_loader( $libxml_disable_entity_loader );
		libxml_use_internal_errors( $libxml_use_internal_errors );

		return $sanitized;
	}

	/**
	 * wp_prepare_attachment_for_js
	 * @param $attachment_data
	 * @param $attachment
	 * @param $meta
	 *
	 * @return mixed
	 */
	public function wp_prepare_attachment_for_js( $attachment_data, $attachment, $meta ) {
		if ( 'image' !== $attachment_data['type'] || 'svg+xml' !== $attachment_data['subtype'] || ! class_exists( 'SimpleXMLElement' ) ) {
			return $attachment_data;
		}

		$svg = self::get_inline_svg( $attachment->ID );
		if ( ! $svg ) {
			return $attachment_data;
		}

		try {
			$svg = new \SimpleXMLElement( $svg );
		} catch ( \Exception $e ) {
			return $attachment_data;
		}

		$src = $attachment_data['url'];
		$width = (int) $svg['width'];
		$height = (int) $svg['height'];

		// Media Gallery
		$attachment_data['image'] = compact( 'src', 'width', 'height' );
		$attachment_data['thumb'] = compact( 'src', 'width', 'height' );

		// Single Details of Image
		$attachment_data['sizes']['full'] = [
			'height' => $height,
			'width' => $width,
			'url' => $src,
			'orientation' => $height > $width ? 'portrait' : 'landscape',
		];
		return $attachment_data;
	}

	public static function is_enabled() {
		static $enabled = null;
		if ( null === $enabled ) {
			$enabled = self::is_svg_uploads_enabled() && self::svg_sanitizer_can_run();
			$enabled = apply_filters( 'elementor/files/svg/enabled', $enabled );
		}
		return $enabled;
	}

	/**
	 * Svg_Handler constructor.
	 */
	public function __construct() {
		add_filter( 'upload_mimes', [ $this, 'upload_mimes' ] );
		add_filter( 'wp_handle_upload_prefilter', [ $this, 'wp_handle_upload_prefilter' ] );
		add_filter( 'wp_check_filetype_and_ext', [ $this, 'wp_check_filetype_and_ext' ], 10, 4 );
		add_filter( 'wp_prepare_attachment_for_js', [ $this, 'wp_prepare_attachment_for_js' ], 10, 3 );
		add_action( 'elementor/core/files/clear_cache', [ $this, 'delete_meta_cache' ] );
	}
}
