export function getChannelDisplayName(channel?: string): string {
	switch (channel) {
		case "master":
			return "MASTER";
		case "game":
			return "GAME";
		case "chat":
			return "CHAT";
		case "media":
			return "MEDIA";
		case "aux":
			return "AUX";
		case "mic":
			return "MIC";
		default:
			return "???";
	}
}
