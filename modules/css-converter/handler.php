<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/autoloader.php';
require_once __DIR__ . '/schema-mapping.php';
require_once __DIR__ . '/widget-creation.php';
require_once __DIR__ . '/widgets/flexbox-widget-handler.php';
require_once __DIR__ . '/widgets/paragraph-widget-handler.php';
require_once __DIR__ . '/widgets/html-widget-handler.php';

// Initialize CSS parser dependencies
CSS_Converter_Autoloader::register();

class CssConverterHandler {
	private $widgetHandlers;

	public function __construct() {
		$this->widgetHandlers = [
            'flexbox' => new \Elementor\Modules\CssConverter\Widgets\Flexbox_Widget_Handler(),
            'paragraph' => new \Elementor\Modules\CssConverter\Widgets\Paragraph_Widget_Handler(),
            'html' => new \Elementor\Modules\CssConverter\Widgets\Html_Widget_Handler(),
		];
	}

	public function handleRequest( $request ) {
		$body = $request->get_body();
		$data = json_decode( $body, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return [
				'error' => 'Invalid JSON',
				'details' => json_last_error_msg(),
			];
		}
		if ( ! isset( $data['elements'] ) || ! is_array( $data['elements'] ) ) {
			return [
				'error' => 'Missing or invalid elements array',
			];
		}
		$postId = isset( $data['postId'] ) ? $data['postId'] : null;
		$postType = isset( $data['postType'] ) ? $data['postType'] : 'page';
		$parentContainerId = isset( $data['parentContainerId'] ) ? $data['parentContainerId'] : null;

		$results = [];
		foreach ( $data['elements'] as $element ) {
			$handler = $this->resolveHandler( $element );
			$results[] = $handler->handle( $element );
		}
		return elementor_css_converter_create_widgets( $results, $postId, $postType, $parentContainerId );
	}

	private function resolveHandler( $element ) {
		$tag = isset( $element['tag'] ) ? $element['tag'] : null;
		if ( in_array( $tag, [ 'div', 'header', 'section', 'article', 'aside', 'footer' ] ) ) {
			return $this->widgetHandlers['flexbox'];
		} elseif ( $tag === 'p' ) {
			return $this->widgetHandlers['paragraph'];
		} else {
			return $this->widgetHandlers['html'];
		}
	}
}
