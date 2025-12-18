import { ELGATO_ALT_WHITE } from "../const/elgatoColors";
import {
	SONAR_COLOR_AUX,
	SONAR_COLOR_CHAT,
	SONAR_COLOR_GAME,
	SONAR_COLOR_MASTER,
	SONAR_COLOR_MEDIA,
	SONAR_COLOR_MIC,
} from "../const/sonarColors";
import { createIconEqualizer, iconEqualizer } from "../svg/iconEqualizer";
import { createIconGamepad } from "../svg/iconGamepad";
import { createIconMic } from "../svg/iconMic";
import { createIconPlayBox } from "../svg/iconPlayBox";
import { createIconShapes } from "../svg/iconShapes";
import { createIconVoiceChat } from "../svg/iconVoiceChat";
import { SonarChannel } from "../types/sonarChannel";

const MASTER_WHITE = createIconEqualizer({ fill: ELGATO_ALT_WHITE });
const MASTER_COLORED = createIconEqualizer({ fill: SONAR_COLOR_MASTER });
const GAME_WHITE = createIconGamepad({ fill: ELGATO_ALT_WHITE });
const GAME_COLORED = createIconGamepad({ fill: SONAR_COLOR_GAME });
const CHAT_WHITE = createIconVoiceChat({ fill: ELGATO_ALT_WHITE });
const CHAT_COLORED = createIconVoiceChat({ fill: SONAR_COLOR_CHAT });
const MEDIA_WHITE = createIconPlayBox({ fill: ELGATO_ALT_WHITE });
const MEDIA_COLORED = createIconPlayBox({ fill: SONAR_COLOR_MEDIA });
const AUX_WHITE = createIconShapes({ fill: ELGATO_ALT_WHITE });
const AUX_COLORED = createIconShapes({ fill: SONAR_COLOR_AUX });
const MIC_WHITE = createIconMic({ fill: ELGATO_ALT_WHITE });
const MIC_COLORED = createIconMic({ fill: SONAR_COLOR_MIC });

function get(channel: SonarChannel, colored: boolean): string {
	switch (channel) {
		case "master":
			return colored ? MASTER_COLORED : MASTER_WHITE;
		case "game":
			return colored ? GAME_COLORED : GAME_WHITE;
		case "chat":
			return colored ? CHAT_COLORED : CHAT_WHITE;
		case "media":
			return colored ? MEDIA_COLORED : MEDIA_WHITE;
		case "aux":
			return colored ? AUX_COLORED : AUX_WHITE;
		case "mic":
			return colored ? MIC_COLORED : MIC_WHITE;
	}
}

export function getChannelIcon(
	channel: SonarChannel,
	colored: boolean = true
): string {
	const svg = get(channel, colored);
	return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
