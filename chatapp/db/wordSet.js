import sqlite3 from 'sqlite3';
import { promises as fs } from 'fs';

// データベースを開く
let db = new sqlite3.Database('../wordwolf.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('sqliteに接続しました');
});

// サンプルデータが格納されたファイルを読み込む関数
function read_file(file_name) {
    fs.readFile(file_name, 'utf8')
        .then(data => {
            const lines = data.split('\n');
            lines.forEach(line => {
                const words = line.split(',').map(word => word.trim());

                // word_wolf, word_normalに分けて保存
                db.run(`INSERT INTO Card (word_wolf, word_normal, category_id) VALUES (?, ?, ?)`, [words[0], words[1], words[2]], (err) => {
                    if (err) {
                        console.error(err.message);
                    }
                });
            });

            // すべての処理が終わった後にデータベースの接続を閉じる
            db.close((err) => {
                if (err) {
                    console.error(err.message);
                }
                console.log('Closed the database connection.');
            });
        })
        .catch(err => {
            console.error(err.message);
        });
}

// 使用例
read_file('word_wolf.txt')
