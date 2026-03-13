<?php

namespace Elementor\App\Modules\E_Onboarding\Storage\Entities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class User_Choices {

	private ?string $building_for = null;
	private array $site_about = [];
	private ?string $experience_level = null;
	private ?string $theme_selection = null;
	private array $site_features = [];

	public static function from_array( array $data ): self {
		$instance = new self();

		$instance->building_for = $data['building_for'] ?? null;
		$instance->site_about = $data['site_about'] ?? [];
		$instance->experience_level = $data['experience_level'] ?? null;
		$instance->theme_selection = $data['theme_selection'] ?? null;
		$instance->site_features = $data['site_features'] ?? [];

		return $instance;
	}

	public function to_array(): array {
		return [
			'building_for' => $this->building_for,
			'site_about' => $this->site_about,
			'experience_level' => $this->experience_level,
			'theme_selection' => $this->theme_selection,
			'site_features' => $this->site_features,
		];
	}

	public function get_building_for(): ?string {
		return $this->building_for;
	}

	public function set_building_for( ?string $value ): void {
		$this->building_for = $value;
	}

	public function get_site_about(): array {
		return $this->site_about;
	}

	public function set_site_about( array $value ): void {
		$this->site_about = $value;
	}

	public function get_experience_level(): ?string {
		return $this->experience_level;
	}

	public function set_experience_level( ?string $value ): void {
		$this->experience_level = $value;
	}

	public function get_theme_selection(): ?string {
		return $this->theme_selection;
	}

	public function set_theme_selection( ?string $value ): void {
		$this->theme_selection = $value;
	}

	public function get_site_features(): array {
		return $this->site_features;
	}

	public function set_site_features( array $value ): void {
		$this->site_features = $value;
	}
}
