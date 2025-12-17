export function getDefaultColor(channel?: string): string {
	switch (channel) {
		case "master":
			return "#5a72ff";
		case "game":
			return "#16e7c4";
		case "chat":
			return "#33bfff";
		case "media":
			return "#ff5cbf";
		case "aux":
			return "#9c59ff";
		case "mic":
			return "#f4ac35";
		default:
			return "#ffffffff";
	}
}
