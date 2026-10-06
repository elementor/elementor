<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Setting {

	const KIND_STRING = 'string';
	const KIND_ENUM = 'enum';
	const KIND_LINK = 'link';

	const LINK_CONTROL_TYPE = 'url';

	const SWITCHER_ON = 'on';
	const SWITCHER_OFF = '';

	private string $control_key;

	private string $kind = self::KIND_STRING;

	private bool $dynamic = false;

	/**
	 * @var string[]
	 */
	private array $enum = [];

	private ?string $default_value = null;

	private function __construct( string $control_key ) {
		$this->control_key = $control_key;
	}

	public static function bind_to( string $control_key ): self {
		return new self( $control_key );
	}

	public function string(): self {
		$this->kind = self::KIND_STRING;

		return $this;
	}

	/**
	 * @param string[] $values
	 */
	public function enum( array $values ): self {
		$this->kind = self::KIND_ENUM;
		$this->enum = $values;

		return $this;
	}

	public function link(): self {
		$this->kind = self::KIND_LINK;

		return $this;
	}

	public function dynamic(): self {
		$this->dynamic = true;

		return $this;
	}

	public function default( string $value ): self {
		$this->default_value = $value;

		return $this;
	}

	public function get_control_key(): string {
		return $this->control_key;
	}

	public function get_kind(): string {
		return $this->kind;
	}

	public function is_dynamic(): bool {
		return $this->dynamic;
	}

	/**
	 * @return array<string, mixed>
	 */
	public function to_schema(): array {
		switch ( $this->kind ) {
			case self::KIND_LINK:
				return self::link_schema();

			case self::KIND_ENUM:
				return $this->enum_schema();

			default:
				return $this->string_schema();
		}
	}

	/**
	 * @return array<string, mixed>
	 */
	private function string_schema(): array {
		$schema = [ 'type' => 'string' ];

		if ( $this->dynamic ) {
			$schema['dynamic'] = true;
		}

		return $schema;
	}

	/**
	 * @return array<string, mixed>
	 */
	private function enum_schema(): array {
		$schema = [
			'type' => 'string',
			'enum' => $this->enum,
		];

		if ( null !== $this->default_value ) {
			$schema['default'] = $this->default_value;
		}

		return $schema;
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function link_schema(): array {
		$switcher = [
			'type' => 'boolean',
			'convert' => [
				'true' => self::SWITCHER_ON,
				'false' => self::SWITCHER_OFF,
			],
		];

		return [
			'type' => 'object',
			'kind' => self::KIND_LINK,
			'properties' => [
				'url' => [ 'type' => 'string' ],
				'is_external' => $switcher,
				'nofollow' => $switcher,
			],
		];
	}
}
