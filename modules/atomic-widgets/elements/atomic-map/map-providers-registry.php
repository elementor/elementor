<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Map_Providers_Registry {
	private static ?self $instance = null;

	/** @var array<string, Map_Provider_Base> */
	private array $providers = [];

	private bool $initialized = false;

	public static function instance(): self {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public static function reset(): void {
		self::$instance = null;
	}

	public function register( Map_Provider_Base $provider ): self {
		$this->providers[ $provider->get_key() ] = $provider;

		return $this;
	}

	public function get( string $key ): ?Map_Provider_Base {
		$this->init();

		return $this->providers[ $key ] ?? null;
	}

	/**
	 * @return array<string, Map_Provider_Base>
	 */
	public function all(): array {
		$this->init();

		return $this->providers;
	}

	private function init(): void {
		if ( $this->initialized ) {
			return;
		}

		$this->initialized = true;

		do_action( 'elementor/atomic-widgets/map-providers/register', $this );
	}
}
