<script>
  import { fade } from "svelte/transition";
  import Button from "./Button.svelte";
</script>

<div
  transition:fade
  class="flex flex-col gap-3 items-center bg-[#213744] text-[#bbcad4] justify-center md:text-4xl h-screen w-screen text-3xl"
>
  <span class="mx-1">You've gone bankrupt.</span>
  <div class="relative w-fit mt-4 mx-3">
    <div class="absolute w-full mx-3 h-full bg-[#2baf3d] rounded-lg">
      <Button onclick={() => location.reload()} text="Try Again" mode="ACTION"
      ></Button>
    </div>
  </div>
</div>
