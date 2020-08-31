<script>
	import { assign } from "svelte/internal";
	import {
		code_theme, fira_code, add_numbers, old_height
	}           from "./stores.js";
	import Core from "./Core.svelte";
	
	const themes = ["twilight_dark", "xonokai", "tomorrow", "ashes_dark", "pojoaque"];

	// ==========================================================================

	function toggleBtn(e) {
		const btn = e.target, content_box = btn.parentNode,
			  toggled = Boolean(+btn.dataset.toggled),
			  wrap = btn.parentNode.children[1];

		if (!toggled) {
			assign(content_box.style, {
				width: "200px", height: "145px"
			}); wrap.style.display = "block";
			btn.style.transform = "rotateZ(45deg)";
			btn.dataset.toggled = 1;
		} else {
			assign(content_box.style, {
				width: "20px", height: "20px"
			}); wrap.style.display = "none";
			btn.style.transform = "rotateZ(0deg)";
			btn.dataset.toggled = 0;
		}
	}
</script>

<style>
	#content-box * { margin: 0; padding: 0; box-sizing: border-box; }
	#content-box {
		font-family: monospace;
		position: fixed; user-select: none; overflow: hidden;
		top: 10px; right: 10px; width: 20px; height: 20px;
		border-radius: 5px; padding: 5px; transition: all .3s ease;
		background: white; box-shadow: 0 0 5px black;
	}
	#box-wrap { margin: 5px; display: none; }
	#toggle-btn {
		position: absolute; top: 5px; right: 5px;
		width: 20px; height: 20px; cursor: pointer;
		line-height: 20px; text-align: center; color: black; text-shadow: none;
		font-size: 24px; transform: rotateZ(0deg); transition: all .3s ease;
	}
	#code-themes { margin-top: 5px; padding: 10px; background: lightgray; }
	#toggle-btn:hover {
		color: aqua; text-shadow: 0 0 5px black; white-space: nowrap;
	}
</style>

<div id="content-box" >
	<div id="toggle-btn" on:click={ toggleBtn }>✜</div>
	<div id="box-wrap">
		<label title={"Если в системе установлен\nэтот шрифт, он будет применён\nк блоку с кодом."}>
			FiraCode      <input type="checkbox" bind:checked={ $fira_code }>
		</label>
		<label title={"Включает нумерацию строк\nв блоке 'code'."}>
			Нумерация     <input type="checkbox" bind:checked={ $add_numbers }>
		</label>
		<label title={"Уменьшает дефолтную высоту\nблока 'code' в два раза."}>
			Высота 'code' <input type="checkbox" bind:checked={ $old_height }>
		</label>
		<!-- svelte-ignore a11y-no-onchange -->
		<div id="code-themes">
			<span style="white-space: nowrap;">Темы для 'code':</span>
			<select bind:value={ $code_theme }>
				{#each themes as theme}
					<option value={ theme }>{ theme }</option>
				{/each}
			</select>
		</div>
	</div>
</div>

<Core />