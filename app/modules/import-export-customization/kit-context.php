<?php

namespace Elementor\App\Modules\ImportExportCustomization;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Kit_Context {
	public const GROUP_POSTS = 'posts';
	public const GROUP_TERMS = 'terms';
	public const GROUP_USERS = 'users';
	public const GROUP_GLOBAL_CLASSES = 'global-classes';
	public const GROUP_GLOBAL_VARIABLES = 'global-variables';

	private const REPLACEMENT_GROUP_MAP = [
		self::GROUP_POSTS => 'post_ids',
		self::GROUP_TERMS => 'term_ids',
		self::GROUP_USERS => 'user_ids',
		self::GROUP_GLOBAL_CLASSES => 'class_ids',
	];

	private array $groups = [];

	public function group( string $name ): Kit_Context_Group {
		return new Kit_Context_Group( $this, $name );
	}

	public function to_array(): array {
		return $this->groups;
	}

	public static function from_array( array $data ): self {
		$context = new self();

		foreach ( $data as $group_name => $group_values ) {
			if ( ! is_string( $group_name ) || ! is_array( $group_values ) ) {
				continue;
			}

			$context->groups[ $group_name ] = $group_values;
		}

		return $context;
	}

	public function to_replacements(): array {
		$replacements = [];

		foreach ( self::REPLACEMENT_GROUP_MAP as $group_name => $replacement_key ) {
			$values = $this->group( $group_name )->as_array();

			if ( ! empty( $values ) ) {
				$replacements[ $replacement_key ] = $values;
			}
		}

		return $replacements;
	}

	public function put_in_group( string $group_name, $key, $value ): void {
		if ( ! isset( $this->groups[ $group_name ] ) || ! is_array( $this->groups[ $group_name ] ) ) {
			$this->groups[ $group_name ] = [];
		}

		$this->groups[ $group_name ][ (string) $key ] = $value;
	}

	public function has_in_group( string $group_name, $key ): bool {
		return isset( $this->groups[ $group_name ] )
			&& is_array( $this->groups[ $group_name ] )
			&& array_key_exists( (string) $key, $this->groups[ $group_name ] );
	}

	public function value_in_group( string $group_name, $key ) {
		if ( ! $this->has_in_group( $group_name, $key ) ) {
			return null;
		}

		return $this->groups[ $group_name ][ (string) $key ];
	}

	public function group_as_array( string $group_name ): array {
		return isset( $this->groups[ $group_name ] ) && is_array( $this->groups[ $group_name ] )
			? $this->groups[ $group_name ]
			: [];
	}
}

final class Kit_Context_Group {
	private Kit_Context $context;
	private string $name;

	public function __construct( Kit_Context $context, string $name ) {
		$this->context = $context;
		$this->name = $name;
	}

	public function put( $key, $value ): void {
		$this->context->put_in_group( $this->name, $key, $value );
	}

	public function value_of( $key ) {
		return $this->context->value_in_group( $this->name, $key );
	}

	public function has( $key ): bool {
		return $this->context->has_in_group( $this->name, $key );
	}

	public function as_array(): array {
		return $this->context->group_as_array( $this->name );
	}
}
