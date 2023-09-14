<script setup>
import { ref, inject, onMounted } from "vue";
import io from "socket.io-client";

const userName = inject("userName");
const userList = ref([]);
const socket = io();

let activeUserList = inject("activeUserList")

// 接続したときユーザー名を送信
onMounted(() => {
    socket.emit("userList", userName.value);
    // 更新されたユーザーリストを受信
    socket.on("updateUserList", (users) => {
        userList.value = users;
        console.log(userList.value);
    });
});



</script>

<template>
    <div v-if="userList" class="user_list">
        <div class="user_name">ユーザ一覧</div>
        <ul class='users'>
            <li v-for="(user, index) in activeUserList" :key="index">
                {{ user }}
            </li>
        </ul>
    </div>
</template>

<style scoped>
.user_list {
    background-color: #455A64;
    margin-top: 10px;
    margin-left: 5rem;
    border-radius: 5%;
    padding: 24px;
    position: relative;
    width: 15rem;
    height: 15rem;
    color: white;
}

.user_name {
    color: white;
    font-size: 18px;
    position: absolute;
    top: 18px;
    left: 24px;
}

.users {
    color: white;
    font-size: 18px;
    margin-top: 36px;
    margin-left: 36px;
}
</style>

