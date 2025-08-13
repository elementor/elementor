<?php
namespace Elementor\Modules\CssConverter\Parsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Sabberworm\CSS\CSSList\Document;

class ParsedCss {
	private $document;
	private $original_css;
	private $parse_timestamp;

	public function __construct( Document $document, string $original_css = '' ) {
		$this->document = $document;
		$this->original_css = $original_css;
		$this->parse_timestamp = time();
	}

	public function get_document(): Document {
		return $this->document;
	}

	public function get_original_css(): string {
		return $this->original_css;
	}

	public function get_parse_timestamp(): int {
		return $this->parse_timestamp;
	}

	public function render( array $format_options = [] ): string {
		if ( empty( $format_options ) ) {
			return $this->document->render();
		}

		$format = \Sabberworm\CSS\OutputFormat::create();

		if ( isset( $format_options['indent'] ) ) {
			$format->indentWithSpaces( $format_options['indent'] );
		}

		if ( isset( $format_options['space_between_rules'] ) ) {
			$format->setSpaceBetweenRules( $format_options['space_between_rules'] );
		}

		return $this->document->render( $format );
	}

	public function is_empty(): bool {
		$contents = $this->document->getContents();
		return empty( $contents );
	}

	public function get_stats(): array {
		return [
			'original_size' => strlen( $this->original_css ),
			'parsed_at' => $this->parse_timestamp,
			'is_empty' => $this->is_empty(),
			'rendered_size' => strlen( $this->render() ),
		];
	}
}
