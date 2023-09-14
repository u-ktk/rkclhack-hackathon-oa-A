<script setup>
import { inject, ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import io from "socket.io-client"



// #region global state
let userName = inject("userName")
let activeUserList = inject("activeUserList")
// #endregion

// #region local variable
const router = useRouter()
const socket = io()
// #endregion

// #region reactive variable
const inputUserName = ref("")
// #endregion

const userList = ref([]);

// const myPlayerName = inject("myPlayerName")
onMounted(() => {
  socket.emit("userListBeforeLogin")
  socket.on("updateUserList", (users) => {
    userList.value = users;
    console.log(userList.value);
    // UserList.vueにactiveUserを渡す
    activeUserList.value = userList.value
  });
})

// 入室メッセージをクライアントに送信する
const onEnter = () => {
  // userListに入力されたユーザー名が含まれているか確認
  socket.emit("userList", inputUserName.value)

  // ユーザー名が入力されているかチェック
  if (inputUserName.value.trim() === "") {
    alert('ユーザー名を入力してください。')
    return;
  }
  if (userList.value.includes(inputUserName.value)) {
    alert('そのユーザー名は既に使用されています。')
    return;
  }
  // 入室メッセージを送信
  else {
    // 全体で使用するnameに入力されたユーザー名を格納
    userName.value = inputUserName.value

    // チャット画面へ遷移
    // router.push({ name: "chat" })
    router.push({ name: "test" })


    socket.emit("enterMyselfEvent", "あなたが接続しました。")
    socket.emit("enterOtherEvent", "他のクライアントが接続しました。")

    // socket.emit("addVoteName", userName.value)
    // socket.on("sendPlayerName", (playerName) => {
    //   myPlayerName.value = playerName
    //   console.log(`あなたのプレイヤー名は ${playerName} です。`)
    //   console.log(myPlayerName.value)
    // })

    // チャット画面へ遷移
    // router.push({ name: "chat" })

  }
}
// #endregion
</script>

<template>
  <div style="display: flex; align-items: center; justify-content: center; height: 50vh;">
    <div style="width: 300px; text-align: center;">

      <v-text-field 
        label="ユーザ名"
        v-model="inputUserName"
        variant="solo-inverted"
        @keydown.enter="onEnter"
      ></v-text-field>
      
      <v-btn 
        type="button" 
        @click="onEnter"
      >

        入室する
      </v-btn>
    </div>
  </div>
</template>


<style scoped></style>
