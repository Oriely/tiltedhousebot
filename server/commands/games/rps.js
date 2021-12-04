const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment,  MessageEmbed} = require('discord.js');
const {registerFont, createCanvas, loadImage} = require('canvas');


registerFont(`./assets/fonts/Roboto-Regular.ttf`, {family: 'Roboto'});

const rps = new Map([
    ['rock', 'paper'],
    ['paper', 'scissors'],
    ['scissors', 'rock'],
])

async function playerImage(player, hand, left) {
    return new Promise(async (resolve) => {
        const canvas = createCanvas(250,250);
        const ctx = canvas.getContext('2d');
        
        const centerX = canvas.width / 2;
        const centerY = canvas.width / 2;
    
        const avatar = await loadImage(player.displayAvatarURL({format: 'jpg'}));
        const avatarSize = 128;
        const avatarRadius = avatarSize / 2;

        const handImage = await loadImage(`./assets/images/games/rpc/${hand}.png`);
    
        ctx.font = '25px Roboto';
        ctx.textAlign = 'center'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(player.username, 125, 40);
        ctx.save();
        ctx.beginPath();
        ctx.arc(125, 125, avatarRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, centerX - avatarRadius, centerY - avatarRadius, avatarSize, avatarSize);
        ctx.restore();
        
        
        ctx.save();
        ctx.beginPath();
        if(left) {
            ctx.scale(-1, 1);
            ctx.drawImage(handImage, -210, 150, 70, 60);
            ctx.restore();
        } else {
            ctx.drawImage(handImage, 35, 150, 70, 60);
            ctx.restore();
        }

        const image = await canvas.toBuffer();
        resolve(canvas);
    });
}

async function battleImage(playerImage, player1, player2,) {

    const canvas = createCanvas(750,250);   
    const context = canvas.getContext('2d'); 
    const left = await playerImage(player1.user,  player1.choice, true);
    const right = await playerImage(player2.user,  player2.choice);

    console.log(left, right);
    context.drawImage(left, 0, 0, 250, 250);
    context.drawImage(right, 500, 0, 250, 250);

    context.font = '20px Roboto';
    context.textAlign = 'center';
    context.fillStyle = '#ffffff'
    context.fillText('vs', 375, 40);

    return await canvas.toBuffer();
}

function player(user, choice) {
    return {
        user: user,
        choice: choice
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rps')
		.setDescription('Challenge users to rock, paper scissors. ')
        .addMentionableOption(option => option.setName('user').setDescription('User to challenge.').setRequired(true))
        .addIntegerOption(option => option.setName('bet').setDescription('Amount to bet.').setRequired(true))
        .addStringOption(option => option.setName('hand').setDescription('Rock, paper, scissors').setRequired(true)),
	async execute(interaction, client) {

        const bet = interaction.options.getInteger('bet');
        const player1 = player(interaction.user, interaction.options.getString('hand'));
        const player2 = player(interaction.options.getMentionable('user').user, null);
        let challengeAccepted = false;

        const player1Balance = await economy.balance(player1.user.id);

        if(player1.user.id == player2.user.id) return interaction.reply('You cannot challenge yourself!');
        if(bet <= 0) return interaction.reply('You cannot bet nothing.');
        if(player1Balance - bet < 0) return interaction.reply('You do not have enough balance to bet that amount.');
        if(player2.bot) return interaction.reply('You cannot challenge a bot!');
        if(!rps.has(player1.choice)) return interaction.reply('That is not a hand, choose between rock, paper and scissors');

        await interaction.reply(`<@${player2.user.id}> You got challenged to rock, paper scissors with ${bet} on the line. Do you accept yes/no?`)
            .then(async  (challengeMessage) => {

                const filter = response => {
                    if(response.author.id === player2.user.id && response.content === 'yes' || response.author.id === player2.user.id && response.content === 'no') return true;
                    return false;
                }

                await interaction.channel.awaitMessages({
                    filter, max: 1, time: 15000, errors: ['time']
                })
                    .then(async collected => {

                        if(collected.first().content == 'yes') { 

                            const player2Balance = await economy.balance(player2.user.id);
                            if(player2Balance - bet < 0) return interaction.followUp(`You <@${player2.user.id}> do not have enough balance to bet that amount.`)

                            challengeAccepted = true
                            await interaction.followUp(`<@${player2.user.id}> accepted.`)
                            .then(msg => msg.delete({timeout:2000}));
                        
                        } else {
                            await interaction.followUp(`<@${player2.user.id}> did not accept.`)
                            .then(msg => msg.delete({timeout:2000}));
                        }

                    })
                    .catch(() => {
                        interaction.followUp(`<@${player2.user.id}> did not repsond in time.`);
                    });
            });

            if(challengeAccepted) {
                interaction.channel.send('Choose rock, paper or scissors')
                .then((prompt) => {
                    const filter = async response => {
                        console.log(response);
                        return rps.has(response.content) && player2.user.id == response.author.id;
                    }
                    interaction.channel.awaitMessages({
                        filter, max: 1, time: 10000, errors: ['time']
                    })
                    .then( async collected => {
                        prompt.delete();
                        player2.choice = collected.first().content;


                        collected.first().delete();

                        // economy.subtract(player1.user.id, bet);
                        // economy.subtract(player2.user.id, bet);

                        if(rps.get(player1.choice) == player2.choice) {
                            // economy.add(player2.user.id, bet * 2);
                            interaction.channel.send(`<@${player2.user.id}> wins`);

                        } else if (player1.choice == player2.choice){
                            interaction.channel.send(`Its a tie.`);
                            // economy.add(player1.user.id, bet);
                            // economy.add(player2.user.id, bet);
                        } else {
                            economy.add(player1.user.id, bet * 2);
                            interaction.channel.send(`<@${player1.user.id}> wins`);
                        }
                        
                        const battleImg = await battleImage(playerImage, player1, player2)

                
                        const attachment = new MessageAttachment(battleImg, 'rpc-game.png');
                
                        interaction.channel.send({files:[attachment]});

                    })
                    
                    .catch(() => {
                        interaction.followUp(`<@${player2.id}> choose hand in time.`);
                    });
                })
            } else {
                console.log('notaccepted')
            }



    },
};
