module.exports = {
	name: 'guildMemberAdd',
	once: false,
	async execute(member, client) {
        const user = await db.connection.query(`SELECT 1 FROM Users WHERE userId = '${messageAuthor}'`);
	},
};
