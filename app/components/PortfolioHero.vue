<script setup lang="ts">
const nodes = [
  { name: 'Nuxt', icon: 'nuxt.png', tone: '#007957', x: 27, y: 21, mobile: [15, 12] },
  { name: 'JavaScript', icon: 'js.png', tone: '#786010', x: 13, y: 17, mobile: [37, 17] },
  { name: 'React', icon: 'react.svg', tone: '#26718b', x: 10, y: 45, mobile: [62, 11] },
  { name: 'React Native', icon: 'react-native.svg', tone: '#285c91', x: 14, y: 73, mobile: [86, 16] },
  { name: 'Tailwind CSS', icon: 'tailwindcss.png', tone: '#27738b', x: 29, y: 80, mobile: [18, 78] },
  { name: 'Laravel', icon: 'laravel.png', tone: '#b34234', x: 76, y: 22, mobile: [34, 87] },
  { name: 'MySQL', icon: 'mysql.svg', tone: '#87561b', x: 89, y: 39, mobile: [51, 77] },
  { name: 'Docker', icon: 'docker.svg', tone: '#225d91', x: 84, y: 69, mobile: [68, 87] },
  { name: 'Git', icon: 'git.png', tone: '#ae482f', x: 70, y: 82, mobile: [86, 78] },
]
const connections = [[0, 1], [1, 2], [2, 3], [3, 4], [5, 6], [6, 7], [7, 8]] as const
const positions = (compact = false) => nodes.map((node) => ({
  x: compact ? node.mobile[0]! : node.x,
  y: compact ? node.mobile[1]! : node.y,
}))
const points = ref(positions())
let compact: MediaQueryList
const hoveredNode = ref<number>()
const headline = 'Web systems for real work.'

function updateLayout() {
  points.value = positions(compact.matches)
}

onMounted(() => {
  compact = window.matchMedia('(max-width: 56rem)')
  compact.addEventListener('change', updateLayout)
  updateLayout()
})

onBeforeUnmount(() => compact?.removeEventListener('change', updateLayout))
</script>

<template>
  <section id="home" class="hero">
    <div class="hero-copy">
      <p class="role"><span class="status-dot" /> John Diems · Web developer</p>
      <h1>{{ headline }}</h1>
      <p class="lead">I build public services and business apps with Nuxt frontends and Laravel APIs.</p>
      <div class="actions">
        <a class="button primary" href="#projects">Explore projects</a>
        <a class="button" href="/assets/images/resume/johnResume.pdf" download>Download résumé</a>
      </div>
    </div>
    <div class="network" aria-label="Tools I work with">
      <svg class="connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line
          v-for="([from, to], index) in connections" :key="index"
          :class="{ 'line-active': hoveredNode === from || hoveredNode === to }"
          :x1="points[from]?.x" :y1="points[from]?.y"
          :x2="points[to]?.x" :y2="points[to]?.y"
          vector-effect="non-scaling-stroke"
        />
      </svg>
      <div
        v-for="(node, index) in nodes" :key="node.name" class="network-node"
        :class="{ 'node-highlighted': hoveredNode === index }"
        :style="{ left: points[index]?.x + '%', top: points[index]?.y + '%', '--delay': (index * 45) + 'ms', '--node-color': node.tone }"
        @pointerenter="hoveredNode = index" @pointerleave="hoveredNode = undefined"
      >
        <span class="node-icon" aria-hidden="true">
          <img :src="'/assets/images/' + node.icon" alt="" width="33" height="33">
        </span>
        <span class="node-name">{{ node.name }}</span>
      </div>
    </div>
  </section>
</template>
