import {
	action,
	DialAction,
	DialRotateEvent,
	DidReceiveSettingsEvent,
	FeedbackPayload,
	SingletonAction,
	WillAppearEvent,
	WillDisappearEvent,
} from "@elgato/streamdeck";

import { SONAR_COLOR_CHAT, SONAR_COLOR_GAME } from "../const/sonarColors";
import { getChatmixIcon } from "../functions/getChatmixIcon";
import { ELGATO_ALT_WHITE, ELGATO_GREY } from "../const/elgatoColors";
import {
	AudioChannel,
	getAppEndpoint,
	getChannelProfiles,
	getChatMixState,
	getSelectedProfiles,
	getSonarEndpointCached,
	ProfileChannel,
	ProfileOption,
	setChatMixBalance,
	setSelectedProfile,
} from "steelseries-sonar-sdk";
import { textToImageDataUrl } from "../functions/textToImageUrl";

type ActionSettings = {
	channel?: ProfileChannel;
	useFavorites?: boolean;
	useSonarColors?: boolean;
	pollingSpeed?: number;
	selectedProfileId?: string;
	profiles?: ProfileOption[];
};

@action({ UUID: "com.harleycodes.steelseries-gg-sonar.profile-selector-dial" })
export class ProfileSelectorDial extends SingletonAction<ActionSettings> {
	private intervalId: NodeJS.Timeout | null = null;
	static appEndpoint: string | null = null;

	static async getEndpoint(): Promise<string | null> {
		try {
			if (!ProfileSelectorDial.appEndpoint) {
				ProfileSelectorDial.appEndpoint = await getAppEndpoint();
			}
			return await getSonarEndpointCached(
				ProfileSelectorDial.appEndpoint,
			);
		} catch (err) {
			console.error("Error getting Sonar endpoint:", err);
			return null;
		}
	}
	override async onWillAppear(
		ev: WillAppearEvent<ActionSettings>,
	): Promise<void> {
		try {
			if (!ev.action.isDial()) return;

			const settings = cleanActionSettings(ev.payload.settings);

			const endpoint = await ProfileSelectorDial.getEndpoint();
			if (!endpoint) {
				return ev.action.setFeedback(
					createFeedbackSonarNotReady(settings),
				);
			}

			const activeProfiles = await getSelectedProfiles(endpoint);
			const activeProfile = activeProfiles.find(
				(p) => p.channel === settings.channel,
			);

			let channelProfiles = await getChannelProfiles(
				endpoint,
				settings.channel,
				settings.useFavorites,
			);
			if (settings.useFavorites) {
				channelProfiles = channelProfiles?.filter((x) => x.isFavorite);
			}

			const selectedProfile =
				activeProfile ??
				channelProfiles.find((x) => x.name === "Default") ??
				channelProfiles[0];

			settings.selectedProfileId = selectedProfile?.id;
			settings.profiles = channelProfiles ?? [];

			ev.action.setSettings(settings);

			ev.action.setFeedback({
				...(await createFeedbackGeneral(settings)),
			});

			this.intervalId = setInterval(
				this.updateDisplay,
				settings.pollingSpeed,
				ev.action,
			);
		} catch (error) {
			console.error("Error in onWillAppear:", error);
		}
	}

	override onWillDisappear(
		ev: WillDisappearEvent<ActionSettings>,
	): Promise<void> | void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	override async onDidReceiveSettings(
		ev: DidReceiveSettingsEvent<ActionSettings>,
	): Promise<void> {
		try {
			if (!ev.action.isDial()) return;
			const settings = cleanActionSettings(ev.payload.settings);

			const endpoint = await ProfileSelectorDial.getEndpoint();
			if (!endpoint) {
				return ev.action.setFeedback(
					createFeedbackSonarNotReady(settings),
				);
			}

			const activeProfiles = await getSelectedProfiles(endpoint);
			const activeProfile = activeProfiles.find(
				(p) => p.channel === settings.channel,
			);

			let channelProfiles = await getChannelProfiles(
				endpoint,
				settings.channel,
				settings.useFavorites,
			);
			if (settings.useFavorites) {
				channelProfiles = channelProfiles?.filter((x) => x.isFavorite);
			}

			const selectedProfile =
				activeProfile ??
				channelProfiles.find((x) => x.name === "Default") ??
				channelProfiles[0];

			settings.selectedProfileId = selectedProfile?.id;
			settings.profiles = channelProfiles ?? [];

			ev.action.setSettings(settings);

			ev.action.setFeedback(await createFeedbackGeneral(settings));
		} catch (error) {
			console.error("Error in onDidReceiveSettings:", error);
		}
	}

	override async onDialRotate(
		ev: DialRotateEvent<ActionSettings>,
	): Promise<void> {
		try {
			const settings = cleanActionSettings(ev.payload.settings);

			if (settings.profiles.length === 0) return;

			if (settings.selectedProfileId) {
				const currentIndex = settings.profiles.findIndex(
					(p) => p.id === settings.selectedProfileId,
				);
				let directionPositive = ev.payload.ticks > 0;
				if (directionPositive) {
					const nextIndex =
						(currentIndex + 1) % settings.profiles.length;
					settings.selectedProfileId =
						settings.profiles[nextIndex].id;
				} else {
					const nextIndex =
						(currentIndex - 1 + settings.profiles.length) %
						settings.profiles.length;
					settings.selectedProfileId =
						settings.profiles[nextIndex].id;
				}
			} else {
				settings.selectedProfileId =
					settings.profiles.find((x) => x.name === "Default")?.id ??
					settings.profiles[0]?.id;
			}

			if (settings.selectedProfileId) {
				const endpoint = await ProfileSelectorDial.getEndpoint();
				if (!endpoint) {
					return ev.action.setFeedback(
						createFeedbackSonarNotReady(settings),
					);
				}
				const response = await setSelectedProfile(
					endpoint,
					settings.selectedProfileId,
				);
				settings.selectedProfileId = response.id;
			}

			ev.action.setSettings(settings);
			ev.action.setFeedback(await createFeedbackGeneral(settings));
		} catch (error) {
			console.error("Error in onDialRotate:", error);
		}
	}

	private async updateDisplay(action: DialAction<ActionSettings>) {
		try {
			if (!action.isDial()) return;
			var settings = await action.getSettings();
			if (!settings.channel) return;
			const endpoint = await ProfileSelectorDial.getEndpoint();
			if (!endpoint) {
				return action.setFeedback(
					createFeedbackSonarNotReady(settings),
				);
			}
			const activeProfiles = await getSelectedProfiles(endpoint);
			const activeProfile = activeProfiles.find(
				(p) => p.channel === settings.channel,
			);
			if (
				activeProfile &&
				activeProfile.id !== settings.selectedProfileId
			) {
				settings.selectedProfileId = activeProfile.id;
				action.setSettings(settings);
			}
			action.setFeedback(await createFeedbackGeneral(settings));
		} catch (error) {
			console.error("Error in onUpdateDisplay:", error);
		}
	}
}

type CleanedActionSettings = Omit<
	ActionSettings,
	"channel" | "useFavorites" | "useSonarColors" | "pollingSpeed" | "profiles"
> & {
	channel: ProfileChannel;
	useFavorites: boolean;
	useSonarColors: boolean;
	pollingSpeed: number;
	profiles: ProfileOption[];
};

function cleanActionSettings(settings: ActionSettings): CleanedActionSettings {
	return {
		...settings,
		channel: settings.channel ?? ProfileChannel.Game,
		useFavorites: settings.useFavorites ?? false,
		useSonarColors: settings.useSonarColors ?? true,
		pollingSpeed: settings.pollingSpeed ?? 1500,
		profiles: settings.profiles ?? [],
	};
}

function getTitle(channel?: ProfileChannel): string {
	return `${channel ?? "Channel"}: Profiles`;
}

function createFeedbackSonarNotReady(
	settings: ActionSettings,
): FeedbackPayload {
	return {
		value: {
			value: "Sonar Not Ready",
			color: "#a83264", // make const
		},
		title: getTitle(settings.channel),
	};
}

async function createFeedbackGeneral(
	settings: ActionSettings,
): Promise<FeedbackPayload> {
	const selectedProfile: ProfileOption | undefined = settings.profiles?.find(
		(p) => p.id === settings.selectedProfileId,
	);
	const titleText = getTitle(settings.channel);

	if (selectedProfile) {
		return {
			// value: {
			// 	value: selectedProfile.name,
			// 	color: ELGATO_ALT_WHITE,
			// },
			// title: titleText,
			// icon: {
			// 	...({
			// 		rect: [0, 0, 0, 0],
			// 	} as unknown as any),
			// },
			"full-canvas": await textToImageDataUrl(selectedProfile.name, {
				width: 200,
				height: 100,
				backgroundColor: "#0392d4",
				textColor: "#ec0000",
				fontSize: 24,
				padding: 2,
				fontWeight: "bold",
			}),
		};
	} else {
		return {
			// value: {
			// 	value: "No Profile Selected",
			// 	color: "#a83264", // make const,
			// },
			// title: titleText,
			// icon: {
			// 	...({
			// 		rect: [0, 0, 0, 0],
			// 	} as unknown as any),
			// },
			"full-canvas": await textToImageDataUrl("HELLO WORLD", {
				width: 200,
				height: 100,
				backgroundColor: "#619372",
				textColor: "#ec0000",
				fontSize: 1,
				padding: 2,
			}),
		};
	}
}
