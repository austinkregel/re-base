<template>
  <div>
    {{ currentArt.frames[currentFrame] }}
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  props: ['art', 'timeout'],
  setup() {
    return {
      currentFrame: ref(null),
      arts: [
        {
          name: 'balloon',
          frames: [
            '.',
            'o',
            'O',
            '@',
            '*',
          ],
        },
        {
          name: 'bars',
          frames: [
            '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█', '▇', '▆', '▅', '▄', '▃', '▁',
          ],
        },
        {
          name: 'dots',
          frames: [
            '⠁', '⠂', '⠄', '⡀', '⢀', '⠠', '⠐', '⠈',
          ],
        },
        {
          name: 'eyes',
          frames: [
            '◡◡',
            '⊙⊙',
            '◠◠',
          ],
        }
      ],
      interval: ref(null),
    }
  },
  computed: {
    currentArt() {
      return this.arts.find(art => art.name === this.art);
    }
  },
  mounted () {
    this.interval = setInterval(() => {
      const maxFrames = this.currentArt?.frames?.length
      this.currentFrame = this.currentFrame >= maxFrames - 1 ? 0 : this.currentFrame + 1
    }, this.timeout);
  },
  beforeDestroy () {
    clearInterval(this.interval);
  },
}
</script>