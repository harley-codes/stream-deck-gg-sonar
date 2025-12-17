export function getChannelImagePath(channel: string): string {
	function getFile() {
		switch (channel) {
			case "master":
				return "channel-icon-master.svg";
			case "game":
				return "channel-icon-game.svg";
			case "chat":
				return "channel-icon-chat.svg";
			case "media":
				return "channel-icon-media.svg";
			case "aux":
				return "channel-icon-aux.svg";
			case "mic":
				return "channel-icon-mic.svg";
			default:
				return "";
		}
	}

	const fileName = getFile();
	return fileName ? `imgs/actions/dial/${fileName}` : "";
}
