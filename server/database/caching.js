const db = require("./db");

class cachedGuild {
	
	constructor(guildData) {
		this.info = null;
		this.config = null;
	}

	async getOrSet(client, guild) {
		await this.getGuildInfo(client, guild);
		await this.getGuildConfig(client, guild);
	}

	async getGuildConfig(client, guild) {
		try {
			const { rows } = await client.db.query(`SELECT * FROM guild_config WHERE guild_id = '${guild.id}'`);
			if(rows.length === 0) {
				const { rows } = await client.db.query(`INSERT INTO guild_config(guild_id) values($1) RETURNING *`, [`${guild.id}`])
				this.config = rows[0];
			} else {
				this.config = rows[0];
			}

		} catch(err) {
			console.log(err);
		}
		return this;
	}

	async getGuildInfo(client, guild) {
		try {

			const { rows } = await client.db.query(`SELECT * FROM Guilds WHERE guild_id = '${guild.id}'`);

			if(rows.length === 0) {
				const { rows } = await client.db.query(`INSERT INTO Guilds(guild_id, guild_owner_id) values($1, $2) RETURNING *`, [`${guild.id}`, `${guild.ownerId}`])
                console.log('insert guild', rows);
				this.info = rows[0];
			} else {
				
				this.info = rows[0];
			}
		} catch(err) {
			console.log(err);
		}
		return this;
	}

	save () {
		const fields = [];
		const fields2 = [];
		Object.keys(this.info).forEach((key) => {
			fields.push(this.info[key]);
		})

        Object.keys(this.config).forEach((key) => {
			fields2.push(this.config[key]);
		})
		return this;
	}

}

class cachedUser{
	constructor() {
		this.data = null
	}

	async getUser(client, member) {
		try {
			const { rows } = await client.db.query(`SELECT * FROM users WHERE user_id = '${member.id}'`);


            // if no rows found create new user entry
			if(rows.length === 0) {
				const economy = {
					balance: 0
				}
                
                const stats = {
                    experience: 0,
                    timesGambled: 0,
				}

                const cooldowns = {
                    dailyCooldown:0,
					chatCooldown: 0,
                    commandCooldown: 0
				}
				
				const { rows } = await client.db.query(
                `INSERT INTO users(user_id, stats, economy, cooldowns) values($1, $2, $3, $4) RETURNING *`, [
                    `${member.id}`,
                    JSON.stringify(stats),
                    JSON.stringify(economy),
                    JSON.stringify(cooldowns)
                ]);
				
				this.data = rows[0];
	
			} else {
				this.data = rows[0];
			} 
		} catch(err) {
			console.log(err)
		}
	}

	async save (client) {
		const fields = [];

        const operation = 'UPDATE';
        const table = 'users';
        const where = `WHERE user_id = '${this.data.user_id}'`;
        const values = [];

        let iteration = 1;
        
        for(const key of Object.keys(this.data)) {
            
            if(key.includes('id')) continue;

            // check if object then turn object into JSON string
			if(typeof this.data[key] == 'object') {

                values.push(JSON.stringify(this.data[key]))
                const t = [key, '=', '$' + iteration];
                fields.push(t);
            } else {
                values.push(this.data[key])
                const t = [key, '=', '$' + iteration];
                fields.push(t);
            }

            iteration++;
        }

        iteration = fields.length;

        let fieldsToUpdate = '';
        for(const field of fields) {
            // let teg = 
            const tes = field.join(' ')  + (--iteration ? ', ' : ' ');
            fieldsToUpdate += tes;
        }
        console.log(fieldsToUpdate)

        const query = `${operation} ${table} SET ${fieldsToUpdate}${where}`;
        console.log(query);

        await client.db.query(query, values);
		return this;
	}

}

module.exports = {cachedGuild, cachedUser}