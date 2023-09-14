import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('wordwolf.db');

//　Cardテーブルの一列目を多数派、二列目を少数派、三列目をcategory_idとして取得
//その後、category_idからcategory_nameを取得する

function createCard() {
    return new Promise((resolve, reject) => {
        let fetchedThemes = [];

        db.all('SELECT * FROM Card', (err, cardRows) => {
            if (err) {
                reject(err);
                return;
            }

            let promises = [];

            cardRows.forEach(row => {
                let category_id = row.category_id;

                // Categoryテーブルからcategory_nameを取得する
                promises.push(new Promise((resolve, reject) => {
                    let category_name;
                    db.get('SELECT * FROM Category WHERE id = ?', [category_id], (err, categoryRow) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        if (categoryRow) {
                            category_name = categoryRow.name;
                            fetchedThemes.push([row.word_normal, row.word_wolf, category_name]);
                        }
                        resolve();
                    });
                }));
            });

            Promise.all(promises)
                .then(() => {
                    // console.log(fetchedThemes);
                    resolve(fetchedThemes);
                })
                .catch(reject);
        });
    });
}

createCard();
export default createCard;