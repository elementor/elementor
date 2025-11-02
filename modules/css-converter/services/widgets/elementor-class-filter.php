<?php

namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Elementor_Class_Filter {

	public function filter_classes( array $classes ): array {
		$filtered_classes = [];
		
		foreach ( $classes as $class ) {
			if ( ! $this->is_elementor_v3_class( $class ) ) {
				$filtered_classes[] = $class;
			}
		}
		
		return $filtered_classes;
	}

	public function filter_class_string( string $class_string ): string {
		if ( empty( $class_string ) ) {
			return '';
		}
		
		$classes = explode( ' ', $class_string );
		$filtered_classes = $this->filter_classes( $classes );
		
		return implode( ' ', $filtered_classes );
	}

	private function is_elementor_v3_class( string $class ): bool {
		$v3_class_patterns = [
			'e-con',
			'e-con-boxed',
			'e-con-inner',
			'e-flex',
			'e-parent',
			'e-child',
			'e-lazyloaded',
			'elementor-element',
			'elementor-widget',
			'elementor-section',
			'elementor-column',
			'elementor-container',
		];
		
		foreach ( $v3_class_patterns as $pattern ) {
			if ( strpos( $class, $pattern ) === 0 ) {
				return true;
			}
		}
		
		$v3_class_suffixes = [
			'--e-con-',
			'--elementor-',
			'-and-e-flex',
			'-and-e-con',
		];
		
		foreach ( $v3_class_suffixes as $suffix ) {
			if ( strpos( $class, $suffix ) !== false ) {
				return true;
			}
		}
		
		return false;
	}

	public function should_preserve_class( string $class ): bool {
		if ( $this->is_elementor_v3_class( $class ) ) {
			return false;
		}
		
		if ( $this->is_generated_atomic_class( $class ) ) {
			return true;
		}
		
		if ( $this->is_user_defined_class( $class ) ) {
			return true;
		}
		
		if ( $this->is_global_class( $class ) ) {
			return true;
		}
		
		return false;
	}

	private function is_generated_atomic_class( string $class ): bool {
		return preg_match( '/^e-[a-f0-9]{7}-[a-f0-9]{7}$/', $class );
	}

	private function is_user_defined_class( string $class ): bool {
		if ( $this->is_elementor_v3_class( $class ) ) {
			return false;
		}
		
		if ( $this->is_generated_atomic_class( $class ) ) {
			return false;
		}
		
		$elementor_prefixes = [ 'e-', 'elementor-' ];
		foreach ( $elementor_prefixes as $prefix ) {
			if ( strpos( $class, $prefix ) === 0 ) {
				return false;
			}
		}
		
		return true;
	}

	private function is_global_class( string $class ): bool {
		$global_class_patterns = [
			'loading',
			'copy',
			'btn-',
			'hero-',
			'nav-',
			'footer-',
			'header-',
		];
		
		foreach ( $global_class_patterns as $pattern ) {
			if ( strpos( $class, $pattern ) === 0 ) {
				return true;
			}
		}
		
		return false;
	}
}
