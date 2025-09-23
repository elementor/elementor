<?php

namespace Elementor\Modules\CssConverter\Convertors\AtomicProperties\PropTypes;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Transform_Prop_Type_Mapper extends Atomic_Prop_Mapper_Base {
	protected $supported_properties = [
		'transform'
	];

	protected $atomic_prop_type = 'transform';

	protected $supported_css_units = [
		'px', 'em', 'rem', '%', 'deg', 'rad', 'turn'
	];

	public function map_css_to_atomic( string $css_value ): ?array {
		$css_value = trim( $css_value );
		
		if ( empty( $css_value ) || 'none' === $css_value ) {
			return null;
		}

		$transforms = $this->parse_transform_functions( $css_value );
		if ( empty( $transforms ) ) {
			return null;
		}

		return $this->create_atomic_prop( $transforms );
	}

	private function parse_transform_functions( string $css_value ): array {
		$transforms = [];
		$pattern = '/(\w+)\s*\([^)]+\)/';
		
		if ( ! preg_match_all( $pattern, $css_value, $matches, PREG_SET_ORDER ) ) {
			return [];
		}

		foreach ( $matches as $match ) {
			$transform = $this->parse_single_transform( $match[0] );
			if ( null !== $transform ) {
				$transforms[] = $transform;
			}
		}

		return $transforms;
	}

	private function parse_single_transform( string $transform_string ): ?array {
		if ( ! preg_match( '/(\w+)\s*\(([^)]+)\)/', $transform_string, $matches ) ) {
			return null;
		}

		$function = $matches[1];
		$values = array_map( 'trim', explode( ',', $matches[2] ) );

		switch ( $function ) {
			case 'translateX':
			case 'translateY':
			case 'translateZ':
				return $this->create_translate_transform( $function, $values );
			case 'translate':
			case 'translate3d':
				return $this->create_translate_transform( $function, $values );
			case 'scaleX':
			case 'scaleY':
			case 'scaleZ':
			case 'scale':
			case 'scale3d':
				return $this->create_scale_transform( $function, $values );
			case 'rotateX':
			case 'rotateY':
			case 'rotateZ':
			case 'rotate':
			case 'rotate3d':
				return $this->create_rotate_transform( $function, $values );
			case 'skewX':
			case 'skewY':
			case 'skew':
				return $this->create_skew_transform( $function, $values );
			default:
				return null;
		}
	}

	private function create_translate_transform( string $function, array $values ): array {
		$x = $y = $z = [ 'size' => 0.0, 'unit' => 'px' ];

		if ( 'translateX' === $function && ! empty( $values[0] ) ) {
			$x = $this->parse_size_value( $values[0] );
		} elseif ( 'translateY' === $function && ! empty( $values[0] ) ) {
			$y = $this->parse_size_value( $values[0] );
		} elseif ( 'translateZ' === $function && ! empty( $values[0] ) ) {
			$z = $this->parse_size_value( $values[0] );
		} elseif ( 'translate' === $function ) {
			if ( ! empty( $values[0] ) ) {
				$x = $this->parse_size_value( $values[0] );
			}
			if ( ! empty( $values[1] ) ) {
				$y = $this->parse_size_value( $values[1] );
			}
		} elseif ( 'translate3d' === $function ) {
			if ( ! empty( $values[0] ) ) {
				$x = $this->parse_size_value( $values[0] );
			}
			if ( ! empty( $values[1] ) ) {
				$y = $this->parse_size_value( $values[1] );
			}
			if ( ! empty( $values[2] ) ) {
				$z = $this->parse_size_value( $values[2] );
			}
		}

		return [
			'type' => 'translate',
			'x' => [ '$$type' => 'size', 'value' => $x ],
			'y' => [ '$$type' => 'size', 'value' => $y ],
			'z' => [ '$$type' => 'size', 'value' => $z ],
		];
	}

	private function create_scale_transform( string $function, array $values ): array {
		$x = $y = $z = 1.0;

		if ( 'scaleX' === $function && ! empty( $values[0] ) ) {
			$x = (float) $values[0];
		} elseif ( 'scaleY' === $function && ! empty( $values[0] ) ) {
			$y = (float) $values[0];
		} elseif ( 'scaleZ' === $function && ! empty( $values[0] ) ) {
			$z = (float) $values[0];
		} elseif ( 'scale' === $function ) {
			if ( ! empty( $values[0] ) ) {
				$x = $y = (float) $values[0];
			}
			if ( ! empty( $values[1] ) ) {
				$y = (float) $values[1];
			}
		} elseif ( 'scale3d' === $function ) {
			if ( ! empty( $values[0] ) ) {
				$x = (float) $values[0];
			}
			if ( ! empty( $values[1] ) ) {
				$y = (float) $values[1];
			}
			if ( ! empty( $values[2] ) ) {
				$z = (float) $values[2];
			}
		}

		return [
			'type' => 'scale',
			'x' => [ '$$type' => 'number', 'value' => $x ],
			'y' => [ '$$type' => 'number', 'value' => $y ],
			'z' => [ '$$type' => 'number', 'value' => $z ],
		];
	}

	private function create_rotate_transform( string $function, array $values ): array {
		$x = $y = $z = 0.0;
		$angle = 0.0;

		if ( 'rotate' === $function && ! empty( $values[0] ) ) {
			$angle = $this->parse_angle_value( $values[0] );
			$z = 1.0;
		} elseif ( 'rotateX' === $function && ! empty( $values[0] ) ) {
			$angle = $this->parse_angle_value( $values[0] );
			$x = 1.0;
		} elseif ( 'rotateY' === $function && ! empty( $values[0] ) ) {
			$angle = $this->parse_angle_value( $values[0] );
			$y = 1.0;
		} elseif ( 'rotateZ' === $function && ! empty( $values[0] ) ) {
			$angle = $this->parse_angle_value( $values[0] );
			$z = 1.0;
		} elseif ( 'rotate3d' === $function && count( $values ) >= 4 ) {
			$x = (float) $values[0];
			$y = (float) $values[1];
			$z = (float) $values[2];
			$angle = $this->parse_angle_value( $values[3] );
		}

		return [
			'type' => 'rotate',
			'x' => [ '$$type' => 'number', 'value' => $x ],
			'y' => [ '$$type' => 'number', 'value' => $y ],
			'z' => [ '$$type' => 'number', 'value' => $z ],
			'angle' => [ '$$type' => 'number', 'value' => $angle ],
		];
	}

	private function create_skew_transform( string $function, array $values ): array {
		$x = $y = 0.0;

		if ( 'skewX' === $function && ! empty( $values[0] ) ) {
			$x = $this->parse_angle_value( $values[0] );
		} elseif ( 'skewY' === $function && ! empty( $values[0] ) ) {
			$y = $this->parse_angle_value( $values[0] );
		} elseif ( 'skew' === $function ) {
			if ( ! empty( $values[0] ) ) {
				$x = $this->parse_angle_value( $values[0] );
			}
			if ( ! empty( $values[1] ) ) {
				$y = $this->parse_angle_value( $values[1] );
			}
		}

		return [
			'type' => 'skew',
			'x' => [ '$$type' => 'number', 'value' => $x ],
			'y' => [ '$$type' => 'number', 'value' => $y ],
		];
	}

	private function parse_angle_value( string $angle_string ): float {
		if ( preg_match( '/^(-?\d*\.?\d+)(deg|rad|turn)?$/i', $angle_string, $matches ) ) {
			$value = (float) $matches[1];
			$unit = isset( $matches[2] ) ? strtolower( $matches[2] ) : 'deg';

			switch ( $unit ) {
				case 'rad':
					return $value * ( 180 / M_PI );
				case 'turn':
					return $value * 360;
				default:
					return $value;
			}
		}

		return 0.0;
	}
}
