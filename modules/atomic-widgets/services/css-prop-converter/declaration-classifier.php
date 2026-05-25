<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Declaration_Classifier {

	public static function make(): self {
		return new self();
	}

	public function split( string $css ): array {
		$css = $this->strip_dangerous( $css );
		$declarations = [];

		foreach ( explode( ';', $css ) as $chunk ) {
			$chunk = trim( $chunk );

			if ( '' === $chunk ) {
				continue;
			}

			$colon = strpos( $chunk, ':' );

			if ( false === $colon || 0 === $colon ) {
				continue;
			}

			$property = strtolower( trim( substr( $chunk, 0, $colon ) ) );
			$value = trim( substr( $chunk, $colon + 1 ) );

			if ( '' === $property || '' === $value ) {
				continue;
			}

			if ( ! preg_match( '/^[a-z-]+$/', $property ) ) {
				continue;
			}

			$declarations[] = [
				'property' => $property,
				'value' => $value,
			];
		}

		return $declarations;
	}

	private function strip_dangerous( string $css ): string {
		$css = preg_replace( '#/\*.*?\*/#s', '', $css );
		$css = str_ireplace( [ 'expression(', 'javascript:', '@import' ], '', $css );

		return $css;
	}
}
