# Code:T

A bichromatic VS Code theme with semantic highlighting.

## Features

- **Semantic Face System**: Based on a 6-face design for maximum consistency across languages [1]
- **Bichromatic Philosophy**: Uses foreground variations and a single accent color for syntax highlighting
- **Comprehensive Fallback**: Includes both semantic highlighting and traditional tokenColors for universal language support
- **Parametrizable Accent**: Easily change the accent color and regenerate themes
- **Light & Dark Variants**: Automatically generates both light and dark theme variants
- **Readability Focus**: Carefully designed face system for optimal code readability

## Design Philosophy

This theme uses **6 core faces** that define all syntax highlighting:

### Core Faces

- **`default`**: Regular information (normal foreground color)
- **`strong`**: Structural information (bold weight, same color as default)
- **`faded`**: Less important information (muted/lighter foreground)
- **`salient`**: Important information (accent color for prominence)
- **`popout`**: Attention-grabbing information (complementary color to accent)
- **`critical`**: Critical information (high contrast, typically red for errors)
- **`subtle`**: Background highlighting (very light background tint)

### Face Mapping

- **Classes, Functions, Namespaces** → `strong` (structural elements)
- **Keywords, Types, Interfaces** → `salient` (important language constructs)
- **Strings, Literals** → `popout` (content that should stand out)
- **Variables, Parameters, Properties** → `default` (regular code elements)
- **Comments, Documentation** → `faded` (secondary information)
- **Errors, Deprecated items** → `critical` (problems requiring attention)

### Bichromatic Enhancement

The theme generates these faces from just two base colors:
- **Foreground color**: Provides the monochromatic foundation (default, strong, faded, subtle)
- **Accent color**: Provides the chromatic highlights (salient, popout, critical)

## Benefits

* `+` **Consistency across languages**: Semantic highlighting provides uniform
  coloring based on actual code meaning rather than syntax patterns

* `+` **More accurate representation**: Traditional syntax highlighting can be
  misleading, while semantic highlighting reflects true semantic roles

* `+` **Future-proof**: As more language servers adopt semantic tokenization, 
  the theme becomes more valuable

* `+` **Fallback support**: Comprehensive tokenColors provide traditional syntax
  highlighting when LSP servers are unavailable

* `-` **Language server dependency**: Optimal experience requires LSP support,
  though fallback tokenColors ensure basic highlighting always works

## Installation

1. Install the extension from the VS Code marketplace
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) to open the command palette
3. Search for "Color Theme" and select "Preferences: Color Theme"
4. Choose either "Code:T Light" or "Code:T Dark"

## Customization

### Changing the Accent Color

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. Search for "Code:T: Regenerate Themes with New Accent Color"
3. Enter a new hex color (e.g., `#FF6B6B`)
4. Choose to reload VS Code when prompted

Alternatively, you can set the accent color in your settings:

```json
{
  "codet.accent": "#FF6B6B"
}
```

Then run the regenerate command to apply the changes.

## Theme Structure

- `src/extension.ts` - Main extension file with commands
- `src/generator.ts` - Color interpolation and theme generation logic
- `themes/vscodet.json.in` - Template file for theme generation
- `themes/vscodet-light.json` - Generated light theme
- `themes/vscodet-dark.json` - Generated dark theme

## Development

```bash
npm install
npm run compile
npm run watch
node out/generator.js [accent-color]
```

## References

1. https://github.com/rougier/nano-emacs

## License

MIT © [jwintz](https://github.com/jwintz)
