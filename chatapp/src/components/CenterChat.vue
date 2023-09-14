<script setup>
import { inject, provide, ref, reactive, onMounted } from "vue"
import io from "socket.io-client"
import Scroll from "./parts/Scroll.vue"

// #region global state
const userName = inject("userName")
// #endregion

// #region local variable
const socket = io()
// #endregion

// #region reactive variable
const chatContent = ref("")
const chatList = reactive([])

provide("chatList", chatList)

onMounted(() => {
  registerSocketEvent()
  // メッセージ表示イベント（receiveMessageEvent）を受信する
  socket.on("publishEvent", (data) => {
    // 画面上にメッセージを表示
    chatList.unshift(data)
  })
})

// #endregion

// #region browser event handler
// 投稿メッセージをサーバに送信する
const onPublish = () => {
  const sendText = userName.value + 'さん：' + chatContent.value
  console.log(userName.value)

  // 入力欄を初期化
  chatContent.value = ""
  socket.emit("publishEvent",sendText)

}

// 退室メッセージをサーバに送信する
const onExit = () => {
  socket.emit("exitEvent", `${userName.value}さんが退室しました。`)
}

// メモを画面上に表示する
const onMemo = () => {
  // メモの内容を表示
  chatContent.value = userName.value + "さんのメモ：" + chatContent.value
  chatList.push(chatContent.value)

  // 入力欄を初期化
  chatContent.value = ""
}
// #endregion

// #region socket event handler
// サーバから受信した入室メッセージ画面上に表示する
const onReceiveEnter = (data) => {
  chatList.push(data)
}

// サーバから受信した退室メッセージを受け取り画面上に表示する
const onReceiveExit = (data) => {
  chatList.push(data)
}

// イベント登録をまとめる
const registerSocketEvent = () => {
  // 入室イベントを受け取ったら実行
  socket.emit("enterEvent", `${userName.value}さんが入室しました。`)
  socket.on("enterEvent", (data) => {
    // 画面上にメッセージを表示
    onReceiveEnter(data)
  });

  // 退室イベントを受け取ったら実行
  socket.on("exitEvent", (data) => {
    onReceiveExit(data)
  })

  // 投稿イベントを受け取ったら実行
  socket.on("publishEvent", (data) => {
  })
}

// #endregion
</script>

<template>
  <div class="mx-auto my-1 px-4">
    <div class="mt-1">

      <Scroll :style="{width: '600px', height: '350px' }" />

      <div class="mt-5">

        <v-btn 
          type="button" 
          @click="onPublish" 
          class="button-normal">
          発言
        </v-btn>

        <!-- prepend-icon="$vuetify" -->
        <v-textarea
        label="発言を入力してください。Tips:質問は最大の攻撃です"
        v-model="chatContent"
        variant="solo-inverted"
        class="area"
        ></v-textarea>

      </div>


    </div>
  </div>



</template>

<style scoped>
.link {
  text-decoration: none;
}

.area {
  width: 600px;
  margin-top: 8px;
}

.item {
  display: block;
}

.util-ml-8px {
  margin-left: 8px;
}

.button-exit {
  color: #000;
}

</style>