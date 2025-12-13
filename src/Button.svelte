<script>
	import { play } from "./soundManager.svelte";
	let {
		mode = "",
		text,
		disabled = false,
		onclick,
		gray = false,
		iconDesc = "",
	} = $props();

</script>

<div
	class="{mode === 'ACTION'
		? 'relative w-full mt-4'
		: 'relative w-full'}{gray && 'pointer-events-none opacity-50'}"
>
	<div
		class={mode === "ACTION"
			? "absolute w-full h-full bg-[#2baf3d] rounded-lg"
			: "absolute w-full h-full bg-[#2e4c7d] rounded-lg"}
	></div>
	<button
		onmousedown={() => play("OMD")}
		onmouseup={() => play("OMU")}
		{disabled}
		{onclick}
		class={mode === "ACTION"
			? "py-2.5 px-2 flex border border-[#2baf3d] w-full flex-row cursor-pointer -translate-y-0.75 active:translate-0 transition-transform bg-[#0f8f20] rounded-lg"
			: "py-2.5 px-2 flex w-full border border-[#2e4c7d] flex-row justify-between items-center cursor-pointer -translate-y-0.75 active:translate-0 transition-transform bg-[#2f4553] rounded-lg"}
	>
		<div class={mode === "ACTION" ? "text-center w-full font-bold" : ""}>
			{text}
		</div>

		{#if iconDesc === "TAKE"}
			<svg
				class="w-7 h-7"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				><title>cards-playing-outline</title><path
					fill="#bbcad4"
					d="M11.19,2.25C11.97,2.26 12.71,2.73 13,3.5L18,15.45C18.09,15.71 18.14,16 18.13,16.25C18.11,17 17.65,17.74 16.9,18.05L9.53,21.1C9.27,21.22 9,21.25 8.74,21.25C7.97,21.23 7.24,20.77 6.93,20L1.97,8.05C1.55,7.04 2.04,5.87 3.06,5.45L10.42,12.4C10.67,2.31 10.93,2.25 11.19,2.25M14.67,2.25H16.12A2,2 0 0,1 18.12,4.25V10.6L14.67,2.25M20.13,3.79L21.47,4.36C22.5,4.78 22.97,5.94 22.56,6.96L20.13,12.82V3.79M11.19,4.22L3.8,7.29L8.77,19.3L16.17,16.24L11.19,4.22M8.65,8.54L11.88,10.95L11.44,14.96L8.21,12.54L8.65,8.54Z"
				/></svg
			>
		{:else if iconDesc === "STAY"}
			<svg
				class="w-7 h-7"
				xmlns="http://www.w3.org/2000/svg"
				height="24px"
				viewBox="0 -960 960 960"
				width="24px"
				fill="#bbcad4"
				><path
					d="M507-40q-93 0-171.5-47.5T209-215L60-463l20-20q16-16 38-17.5t40 11.5l122 90v-411q0-12 8.5-21t21.5-9q12 0 21 9t9 21v528L161-414l98 164q38 69 104 109.5T507-100q113 0 193-78t80-190v-402q0-12 8.5-21t21.5-9q12 0 21 9t9 21v402q0 137-97.5 232.5T507-40Zm-60-450v-400q0-12 9-21t21-9q13 0 21.5 9t8.5 21v400h-60Zm167 0v-360q0-12 8.5-21t21.5-9q12 0 21 9t9 21v360h-60ZM471-295Z"
				/></svg
			>
		{:else if iconDesc === "SPLIT"}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="28px"
				viewBox="0 -960 960 960"
				width="24px"
				fill="#bbcad4"
				><path
					d="M200-160q-33 0-56.5-23.5T120-240v-480q0-33 23.5-56.5T200-800h160v80H200v480h160v80H200Zm240 80v-800h80v80h240q33 0 56.5 23.5T840-720v480q0 33-23.5 56.5T760-160H520v80h-80Zm80-160h240v-480H520v480Zm-320 0v-480 480Zm560 0v-480 480Z"
				/></svg
			>
		{:else if iconDesc === "DOUBLEDOWN"}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="28px"
				viewBox="0 -960 960 960"
				width="24px"
				fill="#bbcad4"
				><path
					d="M200-280v-160q0-33 23.5-56.5T280-520h80v-80H200v-80h160q33 0 56.5 23.5T440-600v80q0 33-23.5 56.5T360-440h-80v80h160v80H200Zm280 0 120-200-120-200h80l80 133 80-133h80L680-480l120 200h-80l-80-133-80 133h-80Z"
				/></svg
			>
		{:else}
			<!-- If nothing is specified, than no icon is rendered -->
		{/if}
	</button>
</div>
<!-- !isStarted ||
                !roundStarted ||
                takeDisabled -->
