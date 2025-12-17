export function getChannelDisplayName(channel: string): string {
	switch (channel) {
		case "master":
			return "Master";
		case "game":
			return "Game";
		case "chat":
			return "Chat";
		case "media":
			return "Media";
		case "aux":
			return "AUX";
		case "mic":
			return "Microphone";
		default:
			return "Unknown";
	}
}
