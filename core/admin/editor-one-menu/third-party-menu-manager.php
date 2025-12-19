<?php

namespace Elementor\Core\Admin\EditorOneMenu;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Third_Party_Menu_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Third_Party_Menu_Manager {

	private static ?Third_Party_Menu_Manager $instance = null;

	private array $items = [];

	private array $validation_errors = [];

	const MAX_LENGTH = 50;

	const RESERVED_LABELS = [
		'Settings',
		'Templates',
		'System',
		'Custom Elements',
		'Tools',
		'Home',
		'Editor',
		'Theme Builder',
		'Submissions',
	];

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function register( Third_Party_Menu_Item $item ): bool {
		try {
			$this->validate_item( $item );

			$this->items[ $item->get_id() ] = [
				'item' => $item,
				'registered_at' => time(),
			];

			return true;
		} catch ( \Exception $e ) {
			$this->validation_errors[ $item->get_id() ] = $e->getMessage();

			return false;
		}
	}

	public function unregister( string $id ): void {
		unset( $this->items[ $id ] );
	}

	public function get_all_sorted(): array {
		$items = $this->items;

		uasort( $items, function ( array $a, array $b ): int {
			return $a['registered_at'] <=> $b['registered_at'];
		} );

		return $items;
	}

	public function get( string $id ): ?Third_Party_Menu_Item {
		return $this->items[ $id ]['item'] ?? null;
	}

	public function get_validation_errors(): array {
		return $this->validation_errors;
	}

	public function has_items(): bool {
		return ! empty( $this->items );
	}

	public function register_actions(): void {
		add_action( 'admin_menu', [ $this, 'trigger_registration_hook' ], 5 );
	}

	public function trigger_registration_hook(): void {
		do_action( 'elementor/admin/editor_one_menu/register_third_party', $this );
	}

	private function validate_item( Third_Party_Menu_Item $item ): void {
		$this->validate_id( $item->get_id() );
		$this->validate_label( $item->get_label() );
		$this->validate_capability( $item->get_capability() );
		$this->validate_target_url( $item->get_target_url() );
		$this->validate_owner( $item->get_owner() );
	}

	private function validate_id( string $id ): void {
		if ( empty( $id ) ) {
			throw new \InvalidArgumentException( 'Item ID cannot be empty' );
		}

		if ( isset( $this->items[ $id ] ) ) {
			throw new \InvalidArgumentException( sprintf( 'Item ID "%s" is already registered', esc_html( $id ) ) );
		}

		if ( ! preg_match( '/^[a-z0-9_-]+$/', $id ) ) {
			throw new \InvalidArgumentException( 'Item ID must contain only lowercase letters, numbers, hyphens, and underscores' );
		}

		if ( strlen( $id ) > self::MAX_LENGTH ) {
			throw new \InvalidArgumentException(
				sprintf( 'Item ID must not exceed %d characters', (int) self::MAX_LENGTH )
			);
		}
	}

	private function validate_label( string $label ): void {
		$trimmed_label = trim( $label );

		if ( empty( $trimmed_label ) ) {
			throw new \InvalidArgumentException( 'Label cannot be empty' );
		}

		if ( mb_strlen( $trimmed_label ) > self::MAX_LENGTH ) {
			throw new \InvalidArgumentException(
				sprintf( 'Label exceeds maximum length of %d characters', (int) self::MAX_LENGTH )
			);
		}

		$label_lower = strtolower( $trimmed_label );

		foreach ( self::RESERVED_LABELS as $reserved ) {
			if ( strtolower( $reserved ) === $label_lower ) {
				throw new \InvalidArgumentException(
					sprintf( 'Label "%s" is reserved by Elementor', esc_html( $label ) )
				);
			}
		}
	}

	private function validate_capability( string $capability ): void {
		if ( empty( $capability ) ) {
			throw new \InvalidArgumentException( 'Capability cannot be empty' );
		}
	}

	private function validate_target_url( string $url ): void {
		if ( empty( $url ) ) {
			throw new \InvalidArgumentException( 'Target URL cannot be empty' );
		}
	}

	private function validate_owner( string $owner ): void {
		if ( empty( $owner ) ) {
			throw new \InvalidArgumentException( 'Owner cannot be empty' );
		}

		if ( strlen( $owner ) > 100 ) {
			throw new \InvalidArgumentException( 'Owner must not exceed 100 characters' );
		}
	}
}
