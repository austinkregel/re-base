module.exports = {
  apps : [{
    script: './mesh.js',
    cwd: './agent',
    watch: './agent'
  }, {
    script: "npm",
    args: "run dev",
    watch: ['./rebase-ui'],
    cwd: "./rebase-ui",
  }, {
    script: './sockend.js',
    cwd: './rebase-ui/',
    watch: ['./rebase-ui']
  }],
};
