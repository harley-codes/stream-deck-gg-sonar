import { Channel } from "steelseries-sonar-js";
import { SonarChannel } from "../types/sonarChannel";

export function sonarGetChannelFromSdk(channel: SonarChannel): Channel {
	switch (channel) {
		case "master":
			return "master";
		case "game":
			return "game";
		case "chat":
			return "chatRender";
		case "media":
			return "media";
		case "aux":
			return "aux";
		case "mic":
			return "chatCapture";
	}
}
