<?php

namespace Elementor\Modules\Sdk\V4;

interface Element_Def_Context {
    function name(string $name): self;
    function title(string $title): self;
    function atomic(): self;
    function property(string $name): Property_Def_Context;
    function twig(string $twig_file): self;
    function css(string $css_file): self;
}

