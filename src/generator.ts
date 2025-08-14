// Version: $Id:  $
// 
// 

// Commentary:
// 
// 

// Changelog:
// 
// 

// 
// Code starts here
// /////////////////////////////////////////////////////////////////////////////

import * as fs from 'fs';
import * as path from 'path';

interface RGB {
    r: number;
    g: number;
    b: number;
}

interface HSL {
    h: number;
    s: number;
    l: number;
}

interface ThemeVariables {
    // Fixed UI colors
    '--vscodet-background': string;
    '--vscodet-background-alternate': string;
    '--vscodet-border': string;
    '--vscodet-foreground': string;
    '--vscodet-foreground-alternate': string;
    '--vscodet-accent': string;
    '--vscodet-accent-hovered': string;
    '--vscodet-accent-background': string;
    '--vscodet-undefined': string;
    '--vscodet-transparent': string;

    // Predefined semantic colors
    '--vscodet-rosewater': string;
    '--vscodet-flamingo': string;
    '--vscodet-pink': string;
    '--vscodet-mauve': string;
    '--vscodet-red': string;
    '--vscodet-maroon': string;
    '--vscodet-peach': string;
    '--vscodet-yellow': string;
    '--vscodet-green': string;
    '--vscodet-teal': string;
    '--vscodet-sky': string;
    '--vscodet-sapphire': string;
    '--vscodet-blue': string;
    '--vscodet-lavender': string;

    // Core face system
    '--vscodet-face-default': string;     // Regular information (foreground)
    '--vscodet-face-strong': string;      // Structural information (bold foreground)
    '--vscodet-face-faded': string;       // Less important information (muted foreground)  
    '--vscodet-face-salient': string;     // Important information (accent color)
    '--vscodet-face-popout': string;      // Attention-grabbing information (distinct hue)
    '--vscodet-face-subtle': string;      // Background highlighting (light background)

    // Bracket pair colorization - accent color interpolated by saturation/depth
    '--vscodet-bracket-1': string;        // Outermost brackets (most saturated)
    '--vscodet-bracket-2': string;        // Second level
    '--vscodet-bracket-3': string;        // Third level
    '--vscodet-bracket-4': string;        // Fourth level
    '--vscodet-bracket-5': string;        // Fifth level
    '--vscodet-bracket-6': string;        // Innermost brackets (least saturated)
}

export class ThemeGenerator {
    private templatePath: string;
    private outputDir: string;

    constructor(templatePath: string, outputDir: string) {
        this.templatePath = templatePath;
        this.outputDir = outputDir;
    }

    private hexToRgb(hex: string): RGB {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) {
            throw new Error(`Invalid hex color: ${hex}`);
        }
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        };
    }

    private rgbToHsl(rgb: RGB): HSL {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    private hslToRgb(hsl: HSL): RGB {
        const h = hsl.h / 360;
        const s = hsl.s / 100;
        const l = hsl.l / 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    private rgbToHex(rgb: RGB): string {
        const toHex = (c: number) => {
            const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
    }

    private interpolateHsl(color1: string, color2: string, factor: number): string {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        const hsl1 = this.rgbToHsl(rgb1);
        const hsl2 = this.rgbToHsl(rgb2);

        let hDiff = hsl2.h - hsl1.h;
        if (hDiff > 180) hDiff -= 360;
        if (hDiff < -180) hDiff += 360;

        const interpolatedHsl: HSL = {
            h: (hsl1.h + hDiff * factor) % 360,
            s: hsl1.s + (hsl2.s - hsl1.s) * factor,
            l: hsl1.l + (hsl2.l - hsl1.l) * factor
        };

        if (interpolatedHsl.h < 0) interpolatedHsl.h += 360;

        const interpolatedRgb = this.hslToRgb(interpolatedHsl);
        return this.rgbToHex(interpolatedRgb);
    }

    private adjustLightness(color: string, amount: number): string {
        const rgb = this.hexToRgb(color);
        const hsl = this.rgbToHsl(rgb);
        const newHsl: HSL = { ...hsl, l: Math.max(0, Math.min(100, hsl.l + amount)) };
        const newRgb = this.hslToRgb(newHsl);
        return this.rgbToHex(newRgb);
    }

    public generateThemeVariables(accentColor: string, isLight: boolean): ThemeVariables {

        const vscodet_dark_background = '#1e1e1e';
        const vscodet_dark_background_alternate = '#262626';
        const vscodet_dark_foreground = '#ffffff';
        const vscodet_dark_foreground_alternate = '#cecece';
        const vscodet_dark_border = '#363636';

        const vscodet_light_background = '#ffffff';
        const vscodet_light_background_alternate = '#efefef';
        const vscodet_light_foreground = '#000000';
        const vscodet_light_foreground_alternate = '#1e1e1e';
        const vscodet_light_border = '#e0e0e0';

        const vscodet_undefined = '#ff0000';
        const vscodet_transparent = '#00000000';

        const vscodet_rosewater = '#f5e0dc';
        const vscodet_flamingo = '#f2cdcd';
        const vscodet_pink = '#f5c2e7';
        const vscodet_mauve = '#cba6f7';
        const vscodet_red = '#f38ba8';
        const vscodet_maroon = '#eba0ac';
        const vscodet_peach = '#fab387';
        const vscodet_yellow = '#f9e2af';
        const vscodet_green = '#a6e3a1';
        const vscodet_teal = '#94e2d5';
        const vscodet_sky = '#89dceb';
        const vscodet_sapphire = '#74c7ec';
        const vscodet_blue = '#89b4fa';
        const vscodet_lavender = '#b4befe';

        const foreground = isLight ? vscodet_light_foreground : vscodet_dark_foreground;
        const foregroundAlternate = isLight ? vscodet_light_foreground_alternate : vscodet_dark_foreground_alternate;
        const background = isLight ? vscodet_light_background : vscodet_dark_background;
        const backgroundAlternate = isLight ? vscodet_light_background_alternate : vscodet_dark_background_alternate;
        const border = isLight ? vscodet_light_border : vscodet_dark_border;

        const accentHovered = this.adjustLightness(accentColor, isLight ? -5 : 5);

        const accentBgRgb = this.hexToRgb(accentColor);
        const accentBgHsl = this.rgbToHsl(accentBgRgb);
        const accentBackground = this.rgbToHex(this.hslToRgb({
            h: accentBgHsl.h,
            s: accentBgHsl.s * 0.3,
            l: isLight ? Math.min(80, accentBgHsl.l * 1.5) : Math.max(20, accentBgHsl.l * 0.3)
        }));

        const faceDefault = foreground;
        const faceStrong = foreground;

        const faceFaded = this.adjustLightness(foreground, isLight ? 50 : -50);

        const accentRgb = this.hexToRgb(accentColor);
        const accentHsl = this.rgbToHsl(accentRgb);
        const faceSalient = this.rgbToHex(this.hslToRgb({
            h: accentHsl.h,
            s: Math.max(20, accentHsl.s * 0.8),
            l: isLight ? Math.max(15, accentHsl.l * 0.4) : Math.min(90, accentHsl.l * 1.8)
        }));

        const facePopout = this.rgbToHex(this.hslToRgb({
            h: accentHsl.h,
            s: Math.max(25, accentHsl.s * 0.85),
            l: isLight ? Math.max(10, accentHsl.l * 0.3) : Math.min(95, accentHsl.l * 2.0)
        }));

        const faceSubtle = this.adjustLightness(background, isLight ? -2 : 2);

        const bracketColors: string[] = [];
        for (let i = 0; i < 6; i++) {
            const interpolationFactor = i * 0.08; // 0%, 8%, 16%, 24%, 32%, 40% toward foreground
            bracketColors.push(this.interpolateHsl(accentColor, foreground, interpolationFactor));
        }

        return {
            // Fixed UI colors
            '--vscodet-background': background,
            '--vscodet-background-alternate': backgroundAlternate,
            '--vscodet-border': border,
            '--vscodet-foreground': foreground,
            '--vscodet-foreground-alternate': foregroundAlternate,
            '--vscodet-accent': accentColor,
            '--vscodet-accent-hovered': accentHovered,
            '--vscodet-accent-background': accentBackground,
            '--vscodet-undefined': vscodet_undefined,
            '--vscodet-transparent': vscodet_transparent,

            // Predefined semantic colors
            '--vscodet-rosewater': vscodet_rosewater,
            '--vscodet-flamingo': vscodet_flamingo,
            '--vscodet-pink': vscodet_pink,
            '--vscodet-mauve': vscodet_mauve,
            '--vscodet-red': vscodet_red,
            '--vscodet-maroon': vscodet_maroon,
            '--vscodet-peach': vscodet_peach,
            '--vscodet-yellow': vscodet_yellow,
            '--vscodet-green': vscodet_green,
            '--vscodet-teal': vscodet_teal,
            '--vscodet-sky': vscodet_sky,
            '--vscodet-sapphire': vscodet_sapphire,
            '--vscodet-blue': vscodet_blue,
            '--vscodet-lavender': vscodet_lavender,

            // Core face system
            '--vscodet-face-default': faceDefault,
            '--vscodet-face-strong': faceStrong,
            '--vscodet-face-faded': faceFaded,
            '--vscodet-face-salient': faceSalient,
            '--vscodet-face-popout': facePopout,
            '--vscodet-face-subtle': faceSubtle,

            // Bracket pair colorization
            '--vscodet-bracket-1': bracketColors[0],
            '--vscodet-bracket-2': bracketColors[1],
            '--vscodet-bracket-3': bracketColors[2],
            '--vscodet-bracket-4': bracketColors[3],
            '--vscodet-bracket-5': bracketColors[4],
            '--vscodet-bracket-6': bracketColors[5]
        };
    }

    private replaceTemplateVariables(content: string, variables: ThemeVariables, name: string, type: string): string {
        let result = content;

        result = result.replace(/\{\{name\}\}/g, name);
        result = result.replace(/\{\{type\}\}/g, type);

        for (const [key, value] of Object.entries(variables)) {
            const placeholder = `{{${key}}}`;
            result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
        }

        return result;
    }

    public generateThemes(accentColor: string = '#A68AF9'): void {

        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        const templateContent = fs.readFileSync(this.templatePath, 'utf8');

        const lightVariables = this.generateThemeVariables(accentColor, true);
        const lightContent = this.replaceTemplateVariables(
            templateContent,
            lightVariables,
            'Code:T Light',
            'light'
        );
        fs.writeFileSync(path.join(this.outputDir, 'vscodet-light.json'), lightContent);

        const darkVariables = this.generateThemeVariables(accentColor, false);
        const darkContent = this.replaceTemplateVariables(
            templateContent,
            darkVariables,
            'Code:T Dark',
            'dark'
        );
        fs.writeFileSync(path.join(this.outputDir, 'vscodet-dark.json'), darkContent);

        console.log(`Generated themes with accent color: ${accentColor}`);
    }
}

export function generateThemes(accentColor?: string): void {
    const templatePath = path.join(__dirname, '..', 'themes', 'vscodet.json.in');
    const outputDir = path.join(__dirname, '..', 'themes');

    const generator = new ThemeGenerator(templatePath, outputDir);
    generator.generateThemes(accentColor);
}

if (require.main === module) {
    const accentColor = process.argv[2] || '#A68AF9';
    generateThemes(accentColor);
}

// /////////////////////////////////////////////////////////////////////////////
// Code ends here
