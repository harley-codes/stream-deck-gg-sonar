import * as PureImage from "pureimage";
import { Buffer } from "node:buffer"; // node.js built-in (or use buffer polyfill in browser)
import { Writable } from "node:stream";

interface TextToImageOptions {
	width?: number;
	height?: number;
	backgroundColor?: string;
	textColor?: string;
	fontSize?: number;
	fontFamily?: string;
	fontWeight?: string;
	padding?: number;
}

/**
 * Converts text to an image and returns it as a base64 data URL (png)
 */
export async function textToImageDataUrl(
	text: string,
	options: TextToImageOptions = {},
): Promise<string> {
	try {
		// Default options
		const {
			width = 800,
			height = 200,
			backgroundColor = "#ffffff",
			textColor = "#000000",
			fontSize = 64,
			fontFamily = "Balsamiq Sans",
			fontWeight = "bold",
			padding = 40,
		} = options;

		// Create canvas
		const img = PureImage.make(width, height);
		const ctx = img.getContext("2d");

		// Background
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, width, height);

		// Register & load font (pureimage needs fonts registered)
		// Using built-in font fallback or you can register a .ttf font
		const font = PureImage.registerFont(
			"C:/Dev/Repos/harley-codes/stream-deck-gg-sonar/src/fonts/BalsamiqSans-Bold.ttf",
			"Balsamiq Sans",
		);
		try {
			await font.load();
		} catch (error) {
			console.warn("Failed to load font, using fallback:", error);
		}

		// If you don't have a font file, pureimage falls back to a very basic font
		// You can also skip registration and use: ctx.font = `${fontSize}px sans-serif`

		// For better results, register a real font if possible:
		// await font.loadPromise;   ← uncomment if you registered a real .ttf font

		// Text settings
		ctx.fillStyle = textColor;
		ctx.font = `${fontSize}px ${fontFamily}`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		// --- Text Wrapping Logic ---
		function wrapText(ctx: any, text: string, maxWidth: number): string[] {
			const words = text.split(" ");
			const lines: string[] = [];
			let currentLine = words[0];
			for (let i = 1; i < words.length; i++) {
				const word = words[i];
				const width = ctx.measureText(currentLine + " " + word).width;
				if (width < maxWidth) {
					currentLine += " " + word;
				} else {
					lines.push(currentLine);
					currentLine = word;
				}
			}
			lines.push(currentLine);
			return lines;
		}

		const maxTextWidth = width - padding * 2;
		let lines = wrapText(ctx, text, maxTextWidth);

		// If any line is too wide, scale font size down
		let adjustedFontSize = fontSize;
		let longestLineWidth = Math.max(
			...lines.map((line) => ctx.measureText(line).width),
		);
		if (longestLineWidth > maxTextWidth) {
			const scale = maxTextWidth / longestLineWidth;
			adjustedFontSize = Math.floor(fontSize * scale * 0.95);
			ctx.font = `${adjustedFontSize}px ${fontFamily}`;
			// Re-wrap with new font size
			lines = wrapText(ctx, text, maxTextWidth);
		}

		// Calculate vertical positioning
		const lineHeight = adjustedFontSize * 1.2;
		const totalTextHeight = lines.length * lineHeight;
		let y = height / 2 - totalTextHeight / 2 + lineHeight / 2;
		const x = width / 2;

		for (const line of lines) {
			ctx.fillText(line, x, y);
			y += lineHeight;
		}

		const chunks: Buffer[] = [];

		const memoryStream = new Writable({
			write(chunk, encoding, callback) {
				chunks.push(
					Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
				);
				callback();
			},
		});

		await PureImage.encodePNGToStream(img, memoryStream, {
			// optional: compressionLevel: 6,
		});

		const pngBuffer = Buffer.concat(chunks.map((b) => b as Uint8Array));
		const base64 = pngBuffer.toString("base64");

		return `data:image/png;base64,${base64}`;
	} catch (error) {
		console.error("Error generating image:", error);
		return "";
	}
}
