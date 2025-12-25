<?php

namespace Elementor\Modules\AtomicConverters\Css;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Converter_Registry {
	private array $converters = [];
	private static ?self $instance = null;

	public function __construct() {
		$this->auto_discover_converters();
	}

	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function auto_discover_converters(): void {
		$converters_dir = __DIR__ . '/converters';

		if ( ! is_dir( $converters_dir ) ) {
			return;
		}

		$files = glob( $converters_dir . '/*.php' );

		foreach ( $files as $file ) {
			$class_name = $this->get_class_name_from_file( $file );
			if ( null === $class_name ) {
				continue;
			}

			if ( ! class_exists( $class_name ) ) {
				require_once $file;
			}

			if ( ! class_exists( $class_name ) ) {
				continue;
			}

			$reflection = new \ReflectionClass( $class_name );

			if ( ! $reflection->implementsInterface( Property_Converter_Interface::class ) ) {
				continue;
			}

			if ( $reflection->isAbstract() || $reflection->isInterface() ) {
				continue;
			}

			$converter = new $class_name();
			$this->register_converter( $converter );
		}
	}

	private function get_class_name_from_file( string $file ): ?string {
		$filesystem = $this->get_filesystem();
		$content = $filesystem->get_contents( $file );
		if ( false === $content ) {
			return null;
		}

		if ( ! preg_match( '/namespace\s+([^;]+);/', $content, $namespace_match ) ) {
			return null;
		}

		if ( ! preg_match( '/class\s+(\w+)/', $content, $class_match ) ) {
			return null;
		}

		return $namespace_match[1] . '\\' . $class_match[1];
	}

	private function register_converter( Property_Converter_Interface $converter ): void {
		foreach ( $converter->get_supported_properties() as $property ) {
			$this->converters[ $property ] = $converter;
		}
	}

	public function register( Property_Converter_Interface $converter ): void {
		$this->register_converter( $converter );
	}

	public function resolve( string $property ): ?Property_Converter_Interface {
		return $this->converters[ $property ] ?? null;
	}

	public function get_all_converters(): array {
		return $this->converters;
	}

	public function get_supported_properties(): array {
		return array_keys( $this->converters );
	}

	public function supports_property( string $property ): bool {
		return isset( $this->converters[ $property ] );
	}

	public function get_converter_count(): int {
		return count( array_unique( $this->converters ) );
	}

	public function get_statistics(): array {
		return [
			'total_converters' => $this->get_converter_count(),
			'supported_properties' => count( $this->converters ),
		];
	}

	public static function reset_instance(): void {
		self::$instance = null;
	}

	private function get_filesystem(): \WP_Filesystem_Base {
		global $wp_filesystem;

		if ( empty( $wp_filesystem ) ) {
			require_once ABSPATH . '/wp-admin/includes/file.php';
			WP_Filesystem();
		}

		return $wp_filesystem;
	}
}

