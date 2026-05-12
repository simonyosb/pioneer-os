import { runWorker } from "@ardonex/plugin-sdk";
import plugin from "./plugin.js";

export default plugin;
runWorker(plugin, import.meta.url);
