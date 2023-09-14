import { createRouter, createWebHistory } from "vue-router"
import Chat from "../components/Chat.vue"
import Login from "../components/Login.vue"
import Cards from "../components/Cards.vue"
import TestMiki from '../components/Test.vue'
import Vote from "../components/Vote.vue"
import { vModelText } from "vue"


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "login",
      component: Login
    }, {
      path: "/test",
      name: "test",
      component: TestMiki,
      beforeEnter: (to, from, next) => {
        if (from.name === "login") {
          next()
        } else {
          next({ name: "login" })
        }
      }
    }, {
      path: "/chat/",
      name: "chat",
      component: Chat,
      beforeEnter: (to, from, next) => {
        if (from.name === "login") {
          next()
        } else {
          next({ name: "login" })
        }
      }
    }, {
      path: "/cards",
      name: "cards",
      component: Cards,
      // 一旦コンポーネントの動作確認するためにコメントアウト
      beforeEnter: (to, from, next) => {
        if (from.name === "login") {
          next()
        } else {
          next({ name: "login" })
        }
      }
    }, {
      path: "/vote/",
      name: "vote",
      component: Vote,
      //   beforeEnter: (to, from, next) => {
      //     if(from.name === "chat"){
      //       next()
      //     } else {
      //       next({ name:"login" })
      //     }
      //   },
    }
  ]
})

export default router