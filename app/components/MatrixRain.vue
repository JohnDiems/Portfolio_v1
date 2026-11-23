<script setup lang="ts">
const canvas = ref<HTMLCanvasElement>()
let frame = 0
let columns: number[] = []
let width = 0
let height = 0
let last = 0
let preference: MediaQueryList
const symbols = 'アイウエオカキクケコサシスセソ0123456789ABCDEF'

function size() {
  const element = canvas.value
  if (!element) return
  width = element.clientWidth
  height = element.clientHeight
  const ratio = Math.min(devicePixelRatio, 2)
  element.width = width * ratio
  element.height = height * ratio
  element.getContext('2d')?.setTransform(ratio, 0, 0, ratio, 0, 0)
  columns = Array.from({ length: Math.ceil(width / 20) }, () => -Math.random() * height)
}

function draw(time: number) {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return
  if (time - last > 55) {
    last = time
    ctx.fillStyle = 'rgba(12, 20, 25, .16)'
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = '#81ddab'
    ctx.font = '14px monospace'
    columns.forEach((y, index) => {
      ctx.fillText(symbols.charAt(Math.random() * symbols.length), index * 20, y)
      columns[index] = y > height && Math.random() > .96 ? 0 : y + 18
    })
  }
  frame = requestAnimationFrame(draw)
}

function update() {
  cancelAnimationFrame(frame)
  size()
  if (!preference.matches) frame = requestAnimationFrame(draw)
}

onMounted(() => {
  preference = matchMedia('(prefers-reduced-motion: reduce)')
  preference.addEventListener('change', update)
  window.addEventListener('resize', size)
  update()
})

onBeforeUnmount(() => {
  preference?.removeEventListener('change', update)
  window.removeEventListener('resize', size)
  cancelAnimationFrame(frame)
})
</script>

<template><canvas ref="canvas" class="matrix" aria-hidden="true" /></template>
