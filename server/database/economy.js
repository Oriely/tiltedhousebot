const db = require('../database/db');

class Economy {
    costructor(db) {

    }

    async add(userId, amount) {
        return new Promise((resolve, reject) => {
            db.connection.query(`
                    UPDATE Users SET balance = balance + ${amount}
                    WHERE userId = '${userId}'
                `)
            .then(resolve(true))
            .catch((err) => {
                reject(err);
            });
        }) 
    }

    async subtract(userId, amount){
        return new Promise( async (resolve, reject) => {
            const currentBalance = await this.balance(userId);
            if(currentBalance - amount < 0) reject(false); 
            db.connection.query(`UPDATE Users SET balance = balance - ${amount} WHERE userId = '${userId}'`)
            .then(() => {
                resolve(true);
            })
            .catch((err) => {
                reject(err)
            });
        });
    }

    async balance(userId) {
        return new Promise(async (resolve, reject) => {
            try{
                const currentBalance = await db.connection.query(`SELECT balance FROM Users WHERE userId = '${userId}'`);
                if(!currentBalance.rows.length === 0) reject(false);
                resolve(currentBalance.rows[0].balance);
            } catch(error) {
                reject(error);
            }
        });
    }
}

module.exports = new Economy(db);