<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Mcp\Abilities\Manage_Classes_Ability;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Test_Manage_Classes_Ability_Base extends TestCase {

	protected function assertWPError( $actual ): void {
		$this->assertInstanceOf( \WP_Error::class, $actual );
	}

	protected function assertCleanVariants( array $variants ): void {
		foreach ( $variants as $variant ) {
			$this->assertArrayNotHasKey( 'null_props', $variant );
		}
	}

	protected function operations_input( array $operations ): array {
		return [ 'operations' => $operations ];
	}

	protected function make_ability( ?Global_Classes_Repository $repository = null ): Manage_Classes_Ability {
		if ( null === $repository ) {
			$repository = $this->createMock( Global_Classes_Repository::class );
			$repository->method( 'all_labels' )->willReturn( [] );
			$repository->method( 'get_order' )->willReturn( [] );
		}

		return new class( $repository ) extends Manage_Classes_Ability {
			public function __construct( ?Global_Classes_Repository $repository = null ) {
				parent::__construct( $repository );
			}

			protected function get_active_breakpoint_keys(): array {
				return [ self::DESKTOP_BREAKPOINT, 'mobile', 'tablet' ];
			}

			protected function build_class_item( string $id, string $label, array $css ) {
				return [
					'id'       => $id,
					'label'    => $label,
					'type'     => self::CLASS_TYPE,
					'variants' => [
						[
							'meta'       => [
								'breakpoint' => self::DESKTOP_BREAKPOINT,
								'state'      => null,
							],
							'props'      => $css,
							'custom_css' => null,
						],
					],
				];
			}
		};
	}

	protected function make_ability_with_converter( ?Global_Classes_Repository $repository, Css_Converter $converter ): Manage_Classes_Ability {
		if ( null === $repository ) {
			$repository = $this->createMock( Global_Classes_Repository::class );
			$repository->method( 'all_labels' )->willReturn( [] );
			$repository->method( 'get_order' )->willReturn( [] );
		}

		return new class( $repository, $converter ) extends Manage_Classes_Ability {
			public function __construct( ?Global_Classes_Repository $repository = null, ?Css_Converter $css_converter = null ) {
				parent::__construct( $repository, $css_converter );
			}

			protected function get_active_breakpoint_keys(): array {
				return [ self::DESKTOP_BREAKPOINT, 'mobile', 'tablet' ];
			}

			protected function build_class_item( string $id, string $label, array $css ) {
				return [
					'id'       => $id,
					'label'    => $label,
					'type'     => self::CLASS_TYPE,
					'variants' => [
						[
							'meta'       => [
								'breakpoint' => self::DESKTOP_BREAKPOINT,
								'state'      => null,
							],
							'props'      => $css,
							'custom_css' => null,
						],
					],
				];
			}
		};
	}

	protected function make_ability_with_breakpoints( array $breakpoints, ?Css_Converter $converter = null, ?Global_Classes_Repository $repository = null ): Manage_Classes_Ability {
		if ( null === $repository ) {
			$repository = $this->createMock( Global_Classes_Repository::class );
			$repository->method( 'all_labels' )->willReturn( [] );
			$repository->method( 'get_order' )->willReturn( [] );
		}

		return new class( $repository, $converter, $breakpoints ) extends Manage_Classes_Ability {
			private array $breakpoint_keys;

			public function __construct( ?Global_Classes_Repository $repository, ?Css_Converter $css_converter, array $breakpoint_keys ) {
				parent::__construct( $repository, $css_converter );
				$this->breakpoint_keys = $breakpoint_keys;
			}

			protected function get_active_breakpoint_keys(): array {
				return $this->breakpoint_keys;
			}

			protected function build_class_item( string $id, string $label, array $css ) {
				return [
					'id'       => $id,
					'label'    => $label,
					'type'     => self::CLASS_TYPE,
					'variants' => [
						[
							'meta'       => [
								'breakpoint' => self::DESKTOP_BREAKPOINT,
								'state'      => null,
							],
							'props'      => $css,
							'custom_css' => null,
						],
					],
				];
			}
		};
	}

	protected function make_repository_with_existing_class( string $id, array $variants ): Global_Classes_Repository {
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [ $id => 'test-class' ] );
		$repository->method( 'get_order' )->willReturn( [ $id ] );
		$repository->method( 'get' )->with( $id )->willReturn( [
			'id'       => $id,
			'label'    => 'test-class',
			'type'     => 'class',
			'variants' => $variants,
		] );

		return $repository;
	}
}
