import streamDeck from "@elgato/streamdeck";

import { ChannelDialClassic } from "./actions/channel-dial-classic";
import { ChannelDialStreamer } from "./actions/channel-dial-streamer";
import { ChatmixDial } from "./actions/chatmix-dial";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel("trace");

// Register the increment action.
streamDeck.actions.registerAction(new ChannelDialClassic());
streamDeck.actions.registerAction(new ChannelDialStreamer());
streamDeck.actions.registerAction(new ChatmixDial());

// Finally, connect to the Stream Deck.
streamDeck.connect();
