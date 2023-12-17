const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
            .setName('pedirset')
            .setDescription('Enviar mensagem do pedir set'),
    async execute(client, interaction) {
        const servidor = interaction.guild
        const canal = servidor.channels.cache.find(c => c.name == '『👮🏻』pedir-set')
        const embed = new Discord.MessageEmbed()
            .setTitle('PEDIR SET')
            .setDescription(`Para pedir o seu set: Clique no botão abaixo, insira as informações necessárias e clique em enviar.\nCaso você seja advogado, coloque a autorização no ID 310.\n Caso você seja resp. polícia, coloque a autorização no ID 000.`)
            .setFooter('CORE - CIDADE ALTA RJ')
            .setThumbnail(servidor.iconURL({dynamic: true, format: 'png', size: 4096}))
            .setColor('BLACK')

        const row = new Discord.MessageActionRow()
            .addComponents([
                new Discord.MessageButton()
                    .setLabel('Pedir Set')
                    .setCustomId('pedir')
                    .setStyle('SUCCESS')
            ])
        
        canal.send({embeds: [embed], components: [row]})
        interaction.reply({ephemeral: true, content: 'a'})
    }
}
