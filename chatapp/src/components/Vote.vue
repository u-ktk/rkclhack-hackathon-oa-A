<script setup>
import { inject, ref } from "vue"
import io from "socket.io-client"
const userName = inject("userName");
const whoWolf = inject("whoWolf");
const theme = inject("theme");
const wolftheme = ref("");
const humantheme = ref("");
const wolf_name = ref("");

const socket = io();

const showModal = inject("showModal");
const voteList = inject("voteList");

socket.on("submitMyName",(myName) => {
	voteList.push(myName)
	if (voteList.length == 3) {
		showModal.value = true;
	}
});

let voted = false;

// 投票した名前を送信
const clickName = (voteName) => {
	if (voted == false){
		socket.emit("submitVote", voteName);
		voted = true;
		let divContents = document.getElementById("contents");
		let divWaiting = document.getElementById("waiting");
		divContents.setAttribute("hidden","");
		divWaiting.removeAttribute("hidden")
	}
};

const wolfInfo = () => {
	wolf_name.value = userName.value
	socket.emit("imwolf", userName.value);
	socket.emit("submitWolftheme", theme.value);
		wolftheme.value = theme.value;
	socket.on("receiveHumantheme", (data) => {
		humantheme.value = data;
	})
};

const humanInfo = () => {
	socket.emit("submitHumantheme", theme.value);
	socket.on("receiveWolftheme", (data) => {
		wolftheme.value = data;
		humantheme.value = theme.value;
	});
};

let player1 = 0;
let player2 = 0;
let player3 = 0;
let player4 = 0;
let total_count = 0;
let selectedList = [];
let selectedName;

// 投票数集計
socket.on("countVote", (voteName) => {
	if (voteName == userName.value){
		player1++;
	}else if (voteName == voteList[0]){
		player2++;
	}else if (voteName == voteList[1]){
		player3++;
	}else if (voteName == voteList[2]){
		player4++;
	}

	// 投票者が四人になったら続ける
	total_count = player1 + player2 + player3 + player4;
	if (total_count == 4) {
		const playerCounts = [player1, player2, player3, player4];
		const maxCount = Math.max(...playerCounts);
		for (let i = 0; i < 4; i++) {
			if (playerCounts[i] === maxCount) {
				selectedList.push(i);
			}
		}

		// もし最多投票数を持つプレイヤーが一人ならば
		if (selectedList.length === 1) {
			const indexOfMax = selectedList[0];
			let mostPlayer;
			switch (indexOfMax) {
			case 0:
				mostPlayer = userName.value;
				break;
			case 1:
				mostPlayer = voteList[0];
				break;
			case 2:
				mostPlayer = voteList[1];
				break;
			case 3:
				mostPlayer = voteList[2];
				break;
			default:
				mostPlayert = "エラー回避";
			}
			selectedName = mostPlayer
			// もし自分が狼だったら名前とテーマを送る
			if (whoWolf.value == "me") {
				wolfInfo();
				// 狼と当てられていた場合負け、そうでなければ勝ち
				if (selectedName == userName.value) {
					showModal.value = false;
					let resultWolfLose = document.getElementById("result_wolflose");
					resultWolfLose.removeAttribute("hidden");
				} else {
					showModal.value = false;
					let resultWolfWin = document.getElementById("result_wolfwin");
					resultWolfWin.removeAttribute("hidden");
				}
			// 自分が狼ではなかったら
			} else {
				humanInfo();
				socket.on("submitWolf", (wolfName) => {
					wolf_name.value = wolfName;
					// 狼を当てられていたら勝ちの画面にする
					if (wolfName == mostPlayer) {
						showModal.value = false;
						let resultWin = document.getElementById("result_win");
						resultWin.removeAttribute("hidden");
					// 狼ではない人だったら負けの画面にする
					} else {
						showModal.value = false;
						let resultLose = document.getElementById("result_lose");
						resultLose.removeAttribute("hidden");
					}
				});
			}
		} else {
			if (whoWolf.value == "me") {
				wolfInfo();
				showModal.value = false;
				let resultImEscape = document.getElementById("result_imescape");
				resultImEscape.removeAttribute("hidden");
			} else {
				// 最多投票数を持つプレイヤーが複数いた場合逃げられた（勝負は負け）の画面にする
				humanInfo();
				socket.on("submitWolf", (wolfName) => {
					wolf_name.value = wolfName;
					showModal.value = false;
					let resultEscape = document.getElementById("result_escape");
					resultEscape.removeAttribute("hidden");
				});
			}
		}
	}
});

</script>

<template>
	<div class="ma-10">
		<div class="box"></div>
		<div hidden id="result_win" class="block, heading-034">
			<h2>選ばれたのは…</h2>
			<h1>{{ selectedName }}さんでした。</h1>
			<h2>あなたは見事狼を当てました！</h2>
			<br>
			<h4>狼のテーマ：{{ wolftheme }}　他の人のテーマ：{{ humantheme }}<br>狼：{{ wolf_name }}さん</h4>
		</div>

		<div hidden id="result_lose" class="block, heading-034">
			<h2>選ばれたのは…</h2>
			<h1>{{ selectedName }}さんでした。</h1>
			<h2>ですが狼ではなかったようです…</h2>
			<br>
			<h4>狼のテーマ：{{ wolftheme }}　他の人のテーマ：{{ humantheme }}<br>狼：{{ wolf_name }}さん</h4>
		</div>

		<div hidden id="result_wolfwin" class="block, heading-034">
			<h2>選ばれたのは…</h2>
			<h1>{{ selectedName }}さんでした。</h1>
			<h2>あなたは狼でした、そして逃げ切りました</h2>
			<br>
			<h4>狼のテーマ：{{ wolftheme }}　他の人のテーマ：{{ humantheme }}<br>狼：{{ wolf_name }}さん</h4>
		</div>

		<div hidden id="result_wolflose" class="block, heading-034">
			<h2>選ばれたのは…</h2>
			<h1>{{ selectedName }}さんでした。</h1>
			<h2>あなたは狼でした、そしてバレました</h2>
			<br>
			<h4>狼のテーマ：{{ wolftheme }}　他の人のテーマ：{{ humantheme }}<br>狼：{{ wolf_name }}さん</h4>
		</div>

		<div hidden id="result_imescape" class="block, heading-034">
			<h2>投票数が同じだったようです</h2>
			<h2>見事あなたは逃げきりました</h2>
			<br>
			<h4>狼のテーマ：{{ wolftheme }}　他の人のテーマ：{{ humantheme }}<br>狼：{{ wolf_name }}さん</h4>
		</div>

		<div hidden id="result_escape" class="block, heading-034">
			<h2>狼に逃げられてしまいました...</h2>
			<h2>投票数が同じになってしまったようです</h2>
			<br>
			<h4>狼のテーマ：{{ wolftheme }}　他の人のテーマ：{{ humantheme }}<br>狼：{{ wolf_name }}さん</h4>
		</div>
		
		<div v-if="showModal" id="overlay">
			<div id="waiting" class="contents" hidden>
				<h3>あなたは怪しい人を指名しました。</h3>
				<h3>票が集まるまで待ちましょう。</h3>
			</div>
			<div id="contents" class="contents">
				<h2 class="heading-031">誰がワードウルフ？</h2>
				<!-- <img src="../images/question.png" alt="question" class="question"> -->
				<br>
				<div class="button-container">
					<button v-for="name in voteList" :key="name" @click="clickName(name)">{{ name }}</button>
				</div>
			</div>
		</div>
	</div>
</template>
<style scoped>
.button-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
}

.button-container button {
	margin: 30px 50px 0px 0px;
	border: none;
	border-radius: 5px;
	cursor: pointer;

	display: inline-block;
	padding: 10px 40px;
	text-decoration: none;
	color: #FFF;
	background-image: linear-gradient(#6795fd 0%, #67ceff 100%);
	transition: .4s;
	font-size: 17px;
	font-weight: bold;
}
.button-container button:hover{
	background-image: linear-gradient(#6795fd 0%, #67ceff 70%);
}

#overlay{
	z-index:1;
	position:fixed;
	top:0;
	left:0;
	width:100%;
	height:100%;
	background-color:rgba(0,0,0,0.5);
	display: flex;
	align-items: center;
	justify-content: center;
}

.contents {
	z-index: 2;
	width: 752px;
	padding: 40px;
	background: #2b2b2b;
	text-align: center;
	color: #fff;
}
.question {
	position: absolute;
	z-index: -1; /* h3の下に配置 */
	top: 260px;
	left: 425px;
	width: 576px;
}

.heading-031 {
    position: relative;
    padding: .3em 0 .2em 1em;
    border-bottom: 3px solid #2589d0;
    color: #ffffff;
    width: 300px;
    margin-left: 30%;
}

.heading-031::before {
    position: absolute;
    top: 0;
    left: .3em;
    transform: rotate(55deg);
    height: 11px;
    width: 12px;
    background: #2589d0;
    content: '';
}

.heading-031::after {
    position: absolute;
    transform: rotate(15deg);
    top: .6em;
    left: 0;
    height: 8px;
    width: 8px;
    background: #2589d0;
    content: '';
}

.box{
	height: 50px;
}
.block{
	position: absolute;
	top: 100px;
	left: calc(50% - 450px / 2);
}
.heading-034 {
    position: relative;
    margin: 0 0 25px calc(50% - 500px / 2);
    padding: .5em .8em;
    background-color: rgb(251, 192, 45);
    color: #fff;
    width: 40%;
}

.heading-034::before {
    position: absolute;
    top: 0;
    left: -9px;
    z-index: 1;
    width: 5px;
    height: 135%;
    border-radius: 3px;
    background-color: #600;
    content: '';
}

.heading-034 h1::before,
.heading-034 h1::after {
    position: absolute;
    left: -9px;
    width: 20px;
    height: 3px;
    border-radius: 3px;
    background-color: #c99;
    content: '';
}

.heading-034 h1::before {
    top: 44%;
    transform: rotate(-25deg);
}

.heading-034 h1::after {
    top: 54%;
    transform: rotate(25deg);
}
</style>