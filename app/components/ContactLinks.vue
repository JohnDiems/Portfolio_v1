<script setup lang="ts">
defineProps<{ email: string }>()
</script>

<template>
  <dl>
    <div><dt>Email</dt><dd><a :href="'mailto:' + email">{{ email }}</a></dd></div>
    <div><dt>Location</dt><dd>Davao City, Philippines</dd></div>
    <div>
      <dt>Profiles</dt>
      <dd>
        <a href="https://github.com/JohnDiems">GitHub</a>
        <a href="https://www.onlinejobs.ph/jobseekers/info/3957419">OnlineJobs.ph</a>
      </dd>
    </div>
  </dl>
</template>
