import { writable } from "svelte/store";

const __config = JSON.parse(GM_getValue("config", JSON.stringify({
    style: {
        code: {
			theme: "tomorrow", fira_code: false, add_numbers: false,
			use_old_height: false
        }
    }
})));

function fira_code_config() {
	const { subscribe, set } = writable(__config.style.code.fira_code);

	return {
		subscribe,
		set: (v) => { __config.style.code.fira_code = v; set(v) }
	};
}

function code_theme_config() {
	const { subscribe, set } = writable(__config.style.code.theme);

	return {
		subscribe,
		set: (v) => { __config.style.code.theme = v; set(v) }
	};
}

function numbers_config() {
	const { subscribe, set } = writable(__config.style.code.add_numbers || false);

	return {
		subscribe,
		set: (v) => { __config.style.code.add_numbers = v; set(v) }
	};
}

function old_height_config() {
	const { subscribe, set } = writable(__config.style.code.use_old_height || false);

	return {
		subscribe,
		set: (v) => { __config.style.code.use_old_height = v; set(v) }
	};
}

export const code_theme  = code_theme_config();
export const fira_code   = fira_code_config();
export const add_numbers = numbers_config();
export const old_height  = old_height_config();

window.addEventListener("beforeunload", () => { GM_setValue("config", JSON.stringify(__config)); });

