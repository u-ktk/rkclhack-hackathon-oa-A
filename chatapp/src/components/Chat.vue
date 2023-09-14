<!-- このファイルは使用しません -->
<script setup>
import { inject, ref, reactive, onMounted } from "vue"
import { useRouter } from "vue-router"
import io from "socket.io-client"

// #region global state
const userName = inject("userName")
// #endregion

// #region local variable
const socket = io()
// #endregion

// #region reactive variable
const chatContent = ref("")
const chatList = reactive([])
// #endregion

// #region lifecycle
// onMounted(() => {
//   registerSocketEvent()
// })

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
  socket.emit("publishEvent", sendText)


}

// 退室メッセージをサーバに送信する
const onExit = () => {
  socket.emit("exitEvent", `${userName.value}さんが退室しました。`)

}

// メモを画面上に表示する
const onMemo = () => {
  // メモの内容を表示
  chatContent.value = userName.value + "さんのメモ：" + chatContent.value
  chatList.unshift(chatContent.value)

  // 入力欄を初期化
  chatContent.value = ""
}
// #endregion

// #region socket event handler
// サーバから受信した入室メッセージ画面上に表示する
const onReceiveEnter = (data) => {
  chatList.unshift(data)
}

// サーバから受信した退室メッセージを受け取り画面上に表示する
const onReceiveExit = (data) => {
  chatList.unshift(data)
}

// サーバから受信した投稿メッセージを画面上に表示する
// const onReceivePublish = (data) => {
//   socket.on('')
//   chatList.push()
// }
// #endregion

// #region local methods
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
  // ーーーーーーーーーーーーーーーーーーーーーここからーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
  const voteList = inject("voteList");
  const showModal = inject("showModal");
  let voted = false;
  const router = useRouter()

  // Timerのcompleteの動作
  const complete = () => {
    // 時間終了後自分の名前を送信
    voted = true;
    socket.emit("finishDiscussion2", userName.value);
    console.log('vote')
    // (最後にボタンを押した人用)
    // if ((voteList.length == 3) && (voted == true)) {
      showModal.value = true;
      router.push({ name: "vote" })
      console.log("あ",showModal.value)
    // }
  }

  // 投票された名前を受け取る
  socket.on("finish",(data) => {
    complete()
  });


  // 投票された名前を受け取る
  socket.on("submitMyName",(myName) => {
    voteList.push(myName)
    console.log(voteList,voteList.length)
    // もし他の人が投票し終わった、かつ、名前を送り終えていたら
    if ((voteList.length == 3) && (voted == true)) {
      showModal.value = true;
      router.push({ name: "vote" })
      console.log("あ",showModal.value)
    }
  });
  
// #endregion
</script>

<template>
  <div class="mx-auto my-5 px-4">
    <h1 class="text-h3 font-weight-medium">Vue.js Chat チャットルーム</h1>
    <div class="mt-10">
      <p>ログインユーザ：{{ userName }}さん</p>
      <textarea v-model="chatContent" variant="outlined" placeholder="投稿文を入力してください" rows="4" class="area"></textarea>
      <div class="mt-5">
        <button type="button" @click="onPublish" class="button-normal">投稿</button>
        <button @click="onMemo" class="button-normal util-ml-8px">メモ</button>
      </div>
      <div class="mt-5" v-if="chatList.length !== 0">
        <ul>
          <li class="item mt-4" v-for="(chat, i) in chatList" :key="i">{{ chat }}</li>
        </ul>
      </div>
    </div>
    <router-link to="/" class="link">
      <button type="button" class="button-normal button-exit" @click="onExit">退室する</button>
    </router-link>
  </div>

  <button type="button" @click="complete" class="button-normal">コンプリート</button>

</template>

<style scoped>
.link {
  text-decoration: none;
}

.area {
  width: 500px;
  border: 1px solid #000;
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
  margin-top: 8px;
}
</style>