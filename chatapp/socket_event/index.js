import createCard from "../db/index.js";

export default (io, socket) => {
  // 入室メッセージをクライアントに送信する
  socket.on("enterEvent", (data) => {
    socket.broadcast.emit("enterEvent", data)
  })

  // 退室メッセージをクライアントに送信する
  socket.on("exitEvent", (data) => {
    socket.broadcast.emit("exitEvent", data)
  })

  // 投稿メッセージを送信する
  socket.on("publishEvent", (data) => {
    io.sockets.emit("publishEvent", data)
  })

  // *********************
  // Timerイベント
  //スタートボタンが押された
  socket.on("start", (data) => {
    console.log(data);
    if (!data) {
      return;
    }
    socket.broadcast.emit("start", data);
  });

  //ストップボタンが押された
  socket.on("stop", (data) => {
    console.log(data);
    if (!data) {
      return;
    }
    socket.broadcast.emit("stop", data);
  });

  //1分追加ボタンが押された
  socket.on("add", (data) => {
    console.log(data);
    if (!data) {
      return;
    }
    socket.broadcast.emit("add", data);
  });
  //1分追加ボタンが押された
  socket.on("subtract", (data) => {
    console.log(data);
    if (!data) {
      return;
    }
    socket.broadcast.emit("subtract", data);
  });
  // 0:00の時名前を送る
  socket.on("finishDiscussion", (myName) => {
    socket.broadcast.emit("submitMyName", myName);
  })

  //終了ボタンを誰かが押したら
  socket.on("endButtonSubmit", (myName) => {
    console.log(myName);
    if (!myName) {
      return;
    }
    // 他の人を終了させ、ボタンを押した人の名前を送る
    socket.broadcast.emit("finish", myName);
  });

  // 投票を行ったら他クライアントへ投票した名前を送信
  socket.on("submitVote", (voteName) => {
    io.sockets.emit("countVote", voteName);
  })

  socket.on("imwolf", (wolfName) => {
    socket.broadcast.emit("submitWolf", wolfName);
  });

  socket.on("submitWolftheme", (wolf) => {
    console.log("receiveWolftheme 動いてます！")
    socket.broadcast.emit("receiveWolftheme", wolf);
  });

  socket.on("submitHumantheme", (human) => {
    console.log("piyopiyo")
    socket.broadcast.emit("receiveHumantheme", human);
  });

  // カードを配る
  let players = [];
  let themes = [];
  let userList = [];



  //　Cardテーブルの一列目を多数派、二列目を少数派、三列目をcategory_idとして取得
  io.on('connection', (socket) => {
    // なぜかクライアント側で何回も接続が起こっている。それを防ぐために1ユーザーあたりのjoinの回数を制限
    if (!socket.listeners('join').length) {


      // ユーザーリストにユーザーを追加
      /* ここから */

      socket.on("userList", (userName) => {
        // ユーザー名異なる場合は追加
        if (userName && !userList.includes(userName)) {
          userList.push(userName);
          socket.userName = userName;
          io.emit('updateUserList', userList);
        }
      })


      socket.on("userListBeforeLogin", () => {
        io.emit('updateUserList', userList);
        console.log(userList);
      })


      /* ここまで */


      socket.on('join', () => {


        // とりあえずデフォルト4人でスタート
        players.push(socket);
        console.log(players.length)
        console.log(`Client connected: ${socket.id}`);

        if (players.length === 4) {
          createCard()
            .then((fetchedThemes) => {
              themes = fetchedThemes;

              //テーマを選ぶ
              const selectedTheme = shuffle(themes)[0];
              console.log(selectedTheme);

              // ウルフを選ぶ
              const wolfPlayer = shuffle(players)[0];
              console.log(wolfPlayer.id)

              // ウルフにはウルフのテーマ(word_wolf)を、それ以外には普通のテーマ(word_normal)を送る
              players.forEach(player => {
                if (player === wolfPlayer) {
                  player.emit('receive-theme', selectedTheme[1]);
                  player.emit('receive-category', selectedTheme[2]);
                  player.emit("wolfNotice", "wolf");

                } else {
                  player.emit('receive-theme', selectedTheme[0]);
                  player.emit('receive-category', selectedTheme[2]);
                  player.emit("wolfNotice", "human");
                }

              });

              players = [];
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });

    }



    socket.on('disconnect', () => {
      const index = players.indexOf(socket);
      console.log(`Client disconnected: ${socket.id}`);
      if (index > -1) {
        players.splice(index, 1);
      }

      // ユーザーリストからユーザー削除
      if (socket.userName && userList.includes(socket.userName)) {
        userList = userList.filter(user => user !== socket.userName);
      }

      io.emit('updateUserList', userList);
    });
  });


  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }


}