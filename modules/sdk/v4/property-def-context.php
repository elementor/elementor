<?php

namespace Elementor\Modules\Sdk\V4;

interface Property_Def_Context {
    function section(string $section): self;
    function kind(string $kind): self;
    function label(string $label): self;
    function default(mixed $default): self;
    function placeholder(string $placeholder): self;
    function options(array $options): self;
}