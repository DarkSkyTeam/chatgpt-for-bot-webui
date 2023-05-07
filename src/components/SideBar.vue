<template>
  <div class="sidebar">
    <ul class="sidebar-nav">
      <li v-for="(nav, index) in navList" :key="index" @click="toggleIndex(index)">
        <router-link :to="nav.path">
          <div class="sidebar-nav-item">
            <div class="sidebar-nav-icon">
              <i :class="nav.icon"></i>
            </div>
            <div class="sidebar-nav-text">{{ nav.text }}</div>
            <div class="sidebar-nav-dropdown">
              <i :class="[nav.children ? 'el-icon-arrow-down' : '']"></i>
            </div>
          </div>
        </router-link>

        <!-- nested sidebar -->
        <!-- <ul v-if="nav.children" :class="{ 'sidebar-nav-child': true, 'collapse-transition': collapse }" :style="{ height: `${height}px` }">
          <li v-for="(child, childIndex) in nav.children" :key="childIndex" @click="onSelect(child.path)" :class="{ 'sidebar-nav-sub-item': true, 'is-active': child.path === currentPath }">
            <router-link :to="child.path">
              <div class="sidebar-nav-sub-item-text">{{ child.text }}</div>
            </router-link>
          </li>
        </ul> -->
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { reactive, toRefs, computed, onMounted, PropType } from 'vue';
export interface Nav {
  text: string,
  icon: string,
  path: string,
  children?: Nav[]
}
const state = reactive({
  currentPath: '/',
  collapse: false,
  height: 0,
});
const props = defineProps<{
  navList: Nav[]
}>()

const toggleIndex = (index: number) => {
  if (props.navList[index].children) {
    state.collapse = !state.collapse;
  }
};
const onSelect = (path: string) => {
  state.currentPath = path;
};
const setHeight = () => {
  state.height = document.getElementsByClassName('sidebar-nav-child')[0].clientHeight;
};
onMounted(() => {
  // setHeight();
  // window.addEventListener('resize', setHeight);
});

</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--vt-c-gray);
  box-shadow: rgba(255, 255, 255, 0.4) 0 4px 12px;
  margin: 0;
  /* padding: 20px 0; */
}

.sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  height: 50px;
  /* padding: 0 20px; */
}

.sidebar-nav-icon {
  font-size: 20px;
  margin-right: 10px;
}

.sidebar-nav-dropdown {
  font-size: 20px;
}

.sidebar-nav-text {
  font-size: 16px;
}

.sidebar-nav-child {
  list-style: none;
  margin: 0;
  padding: 0;
  background: var(--vt-c-gray);
  overflow: hidden;
  transition: height 0.5s;
}

.sidebar-nav-sub-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 50px;
  padding: 0 40px;
  transition: background-color 0.3s ease;
}

.sidebar-nav-sub-item-text {
  font-size: 16px;
}

.sidebar-nav-sub-item:hover,
.sidebar-nav-sub-item.is-active {
  background-color: #f5f5f5;
}

/* You mentioned the primary color was blue, so I styled the elements below with a shade of blue */
.sidebar-nav-icon {
  color: #1a78c2;
}

.sidebar-nav-text {
  color: #1a78c2;
  font-weight: bold;
}

.sidebar-nav-dropdown {
  color: #1a78c2;
}

.sidebar-nav-sub-item-text {
  color: #1a78c2;
}</style>