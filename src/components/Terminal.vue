<script setup lang="ts">
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { invoke } from "@tauri-apps/api";
// Make the terminal fit all the window size
async function fitTerminal(fitAddon, term) {
  fitAddon.fit();
  void invoke<string>("async_resize_pty", {
    rows: term.rows,
    cols: term.cols,
  });
}

// Write data from pty into the terminal
function writeToTerminal(data: string, term) {
  return new Promise<void>((r) => {
    term.write(data, () => r());
  });
}

// Write data from the terminal to the pty
function writeToPty(data: string) {
  void invoke("async_write_to_pty", {
    data,
  });
}
function initShell() {
  invoke("async_create_shell").catch((error) => {
    // on linux it seem to to "Operation not permitted (os error 1)" but it still works because echo $SHELL give /bin/bash
    console.error("Error creating shell:", error);
  });
}



async function readFromPty(term) {
  const data = await invoke<string>("async_read_from_pty");

  if (data) {
    await writeToTerminal(data, term);
  }

  window.requestAnimationFrame(async () => await readFromPty(term));
}

  setTimeout(async () => {
    const terminalElement = document.getElementById("terminal") as HTMLElement;

    const fitAddon = new FitAddon();
    const term = new Terminal({
      fontFamily: "Ubuntu Mono",
      theme: {
        background: "rgb(47, 47, 47)",
      },
    });

    term.loadAddon(fitAddon, term);
    term.open(terminalElement);

    await initShell(term);
    term.onData(writeToPty);
    addEventListener("resize", async() => await  fitTerminal(fitAddon, term));
    await fitTerminal(fitAddon, term);
    window.requestAnimationFrame(async () => await readFromPty(term));
  }, 400)
</script>

<template>
  <div>
    <div id="terminal"></div>
  </div>
</template>
