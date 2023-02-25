<template>
  <div class="xterm" />
</template>
<script>
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { Unicode11Addon } from 'xterm-addon-unicode11'
import { AttachAddon } from 'xterm-addon-attach';
export default {
  mounted() {
    this.$term = new Terminal({
      allowProposedApi: true,
    })
    this.$fitAddon = new FitAddon()
    // this.$attachAddon = new AttachAddon(this.$store.getters.socket);
    this.$term.loadAddon(this.$fitAddon)
    this.$term.loadAddon(new WebLinksAddon())
    // We should just use our own way to handle terminals not this plugin

    // this.$term.loadAddon(this.$attachAddon);
    this.$term.loadAddon(new Unicode11Addon())
    this.$term.unicode.activeVersion = '11'
    this.$term.open(this.$el)
    this.$fitAddon.fit()
    // this.$attachAddon.activate(this.$term);
    this.$term.onTitleChange((title) => this.$emit('title-change', title))

    this.$store.getters.socket.on('terminal:data', (data) => {
      this.$term.write(data, (...args) => console.log('[!] Log of data', args));
    })
  },

  methods: {
    fit() {
      this.$fitAddon.fit()
    },
    focus() {
      this.$term.focus()
    },
    blur() {
      this.$term.blur()
    },
    paste(data){
      this.$term.paste(data)
    },
    createSession(node) {

    }
  }
}
</script>
<style scoped>
.xterm {
  height: 100%;
  width: 100%;
}
</style>