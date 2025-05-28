# Color Themes & Accessibility

Prompt.d now features three carefully designed color schemes with improved contrast ratios and accessibility. Each theme is available in both light and dark modes.

## Available Color Schemes

### 🐙 GitHub Theme (Default)
- **Inspiration**: GitHub's clean and professional interface
- **Best for**: Users who prefer familiar, widely-used color schemes
- **Characteristics**: 
  - High contrast ratios for excellent readability
  - Blue accent colors (#0969da light, #2f81f7 dark)
  - Neutral grays for backgrounds and text
  - Professional appearance suitable for work environments

### 💻 VS Code Theme
- **Inspiration**: Visual Studio Code's developer-friendly colors
- **Best for**: Developers and users who spend long hours coding
- **Characteristics**:
  - Optimized for reduced eye strain during extended use
  - Blue accent colors (#007acc light, #0e639c dark)
  - Warmer background tones
  - Familiar to developers using VS Code

### ✨ Minimal Theme
- **Inspiration**: Modern minimal design principles
- **Best for**: Users who prefer clean, distraction-free interfaces
- **Characteristics**:
  - Subtle color variations for a calm experience
  - Purple accent colors (#667eea light, #7c3aed dark)
  - High contrast while maintaining elegance
  - Perfect for focused work sessions

## Accessibility Features

### Contrast Ratios
All color schemes meet or exceed WCAG 2.1 AA standards:
- **Text on background**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Clear visual distinction

### Color Blindness Support
- All themes use sufficient contrast differences
- Interactive states don't rely solely on color
- Important information is conveyed through multiple visual cues

### Dark Mode Optimization
- Reduced blue light emission for evening use
- Optimized contrast for low-light environments
- Smooth transitions between light and dark modes

## Technical Implementation

### CSS Custom Properties
The color system uses CSS custom properties for dynamic theming:

```css
:root {
  --color-bg: #ffffff;
  --color-text: #24292f;
  --color-accent: #0969da;
  /* ... more properties */
}
```

### Theme Classes
Themes are applied via CSS classes on the document root:
- `.theme-github` (default)
- `.theme-vscode`
- `.theme-minimal`

### Component Integration
All components use the CSS custom properties:

```tsx
<div style={{ 
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)' 
}}>
  Content
</div>
```

## How to Change Themes

1. **Via Sidebar**: Click the "Appearance" button in the sidebar
2. **Settings Panel**: Select your preferred color scheme from the dropdown
3. **Automatic Persistence**: Your choice is saved to localStorage

## Browser Support

The color system is compatible with all modern browsers:
- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 16+

## Future Enhancements

Planned improvements include:
- Additional color schemes (Dracula, Solarized, etc.)
- High contrast mode for accessibility
- Custom theme creation
- System theme detection and auto-switching

## Contributing

To add a new color scheme:

1. Add the color definitions to `tailwind.config.js`
2. Add CSS custom properties in `src/index.css`
3. Update the `ColorScheme` type in `src/context/ThemeContext.tsx`
4. Add the new scheme to the demo component

For questions or suggestions about color themes, please open an issue on GitHub. 