<template>
  <div id="app">
    <div id="nav">
      <el-menu mode="horizontal" :default-active="$route.path" text-color="#aaa" active-text-color="#fff" style="background-color: rgb(84, 92, 100);" router>
        <el-menu-item index="/" >k线涨跌幅统计</el-menu-item>
        <el-menu-item index="/difference">期货涨跌幅</el-menu-item>
      </el-menu>
    </div>
    <main>
      <router-view/>
    </main>
  </div>
</template>

<script>
export default {
  data () {
    return {};
  },
  methods: {
  }
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#nav a {
  font-weight: bold;
  color: #fff;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
#app > main {
  padding: 20px;
}
</style>
