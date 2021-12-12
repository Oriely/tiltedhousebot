// const db = require('../database/db');

// class Bank {
//     costructor(db) {

//     }

//     async add(userId, amount) {
//         return new Promise((resolve, reject) => {
//             db.connection.query(`
//                     UPDATE Users SET balance = balance + ${amount}
//                     WHERE userId = '${userId}'
//                 `, (err, res) => {
//                     if(err) reject(err);

//                 });
//         }) 
//     }

//     async subtract(userId, amount){
//         return new Promise( async (resolve, reject) => {
//             const currentBalance = await this.balance(userId);
//             if(currentBalance - amount < 0) reject('Not enough balance'); 
//             db.connection.query(`UPDATE Users SET balance = balance - ${amount} WHERE userId = '${userId}'`, (err, res) => {
//                 if(err) {
//                     return reject(err);
//                 }
//                 return res.ro
//             })
            
//         });
//     }

//     async balance(userId) { 
//         return new Promise(async (resolve, reject) => {
//             db.connection.query(`SELECT balance FROM Users WHERE userId = '${userId}'`, (err, res) => {
//                 if(err) {
//                     console.log(err);
//                     return 0;
//                 }
                
//             })
//         });
//     }

//     checkIfUserExists() {
//         return new Promise( async (resolve, reject) => {
//             db.connection.query(`SELECT balance FROM Users WHERE userId = '${userId}'`, (err, res) => {
//                 if(err) throw new Error(err);
                
//             })
         
//         })
//     }
// }

// module.exports = new Economy(db);