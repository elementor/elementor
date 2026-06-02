<?php
namespace Elementor\Modules\DesignMd\Render;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Yaml_Emitter {

	const MARKDOWN_ONLY_KEYS = [ 'color_titles' ];

	public function emit( array $tokens ): string {
		$yaml_tokens = array_diff_key( $tokens, array_flip( self::MARKDOWN_ONLY_KEYS ) );
		$lines       = [ '---' ];
		$this->write_tokens( $lines, $yaml_tokens, 0 );
		$lines[] = '---';

		return implode( "\n", $lines );
	}

	private function write_tokens( array &$lines, array $data, int $depth ): void {
		$indent = str_repeat( '  ', $depth );

		foreach ( $data as $key => $value ) {
			$safe_key = $this->quote_key( (string) $key );

			if ( is_array( $value ) ) {
				$lines[] = $indent . $safe_key . ':';
				$this->write_tokens( $lines, $value, $depth + 1 );
			} elseif ( is_int( $value ) ) {
				$lines[] = $indent . $safe_key . ': ' . $value;
			} else {
				$lines[] = $indent . $safe_key . ': ' . $this->quote_value( (string) $value );
			}
		}
	}

	private function quote_value( string $value ): string {
		if ( '' === $value ) {
			return '""';
		}

		return '"' . str_replace(
			[ '\\', '"', "\n", "\r", "\t" ],
			[ '\\\\', '\\"', '\\n', '\\r', '\\t' ],
			$value
		) . '"';
	}

	private function quote_key( string $key ): string {
		if ( '' === $key ) {
			return '""';
		}

		if ( preg_match( '/^[A-Za-z0-9_\-]+$/', $key ) ) {
			return $key;
		}

		return $this->quote_value( $key );
	}
}
