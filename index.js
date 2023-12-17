const { Client, Collection, MessageEmbed, MessageActionRow, MessageButton, DiscordAPIError, TextInputComponent, Modal} = require("discord.js");
const { token } = require('./config.json');
const fs = require('fs');

const client = new Client({intents: 32767});
client.commands = new Collection()

const modules = fs.readdirSync(process.cwd() +  `/comandos`).map(category => category)
let commands = [];

modules.forEach((x) => {
	const props = require(`./comandos/${x}`);
	client.commands.set(props.data.name, props)
	commands.push(props)
});


client.on("ready", async bot => {
	for(const comandos of commands) { client.application.commands.create(comandos.data.toJSON()) }
	bot.user.setActivity(`CORE`, {type: 'LISTENING'})
	console.log('Cabolouso gay.')
})

client.on("interactionCreate", async (interaction) => {
	if(interaction.isCommand()) {
		let comando = client.commands.get(interaction.commandName)
        comando.execute(client, interaction)
    }
	if(interaction.customId === 'pedir') {
		console.log('pegou o modal')
		const modal = new Modal()
			.setCustomId('pedirset')
			.setTitle('Pedir Set');

        const qra = new TextInputComponent()
            .setCustomId('qra')
            .setLabel("Insira seu QRA.")
            .setStyle('SHORT');

		const iddomesmo = new TextInputComponent()
			.setCustomId('idmesmo')
			.setLabel("Insira seu ID")
			.setStyle('SHORT')
		
		const cargo = new TextInputComponent()
			.setCustomId('cargo')
			.setLabel("Insira o cargo desejado. (Ex: Estagiario)")
			.setStyle('SHORT')

		const recrutador = new TextInputComponent()
			.setCustomId('idrec')
			.setLabel("Insira o ID do recrutador.")
			.setStyle('SHORT')
		
        const firstActionRow = new MessageActionRow().addComponents(qra)
		const secondActionRow = new MessageActionRow().addComponents(iddomesmo)
		const thirdActionRow = new MessageActionRow().addComponents(cargo)
		const fourthActionRow = new MessageActionRow().addComponents(recrutador)
            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow)

        await interaction.showModal(modal)
            const filter2 = i => i.customId == 'pedirset'
            interaction
                .awaitModalSubmit({filter2, time: 600000})
                .then((modal) => {
                    const qra = modal.fields.getTextInputValue('qra')
					const iddomesmo = modal.fields.getTextInputValue('idmesmo')
					const cargo = modal.fields.getTextInputValue('cargo')
					const recrutador = modal.fields.getTextInputValue('idrec')


					let getrecrutador = interaction.guild.members.cache.find(m => {
						const apelido = m.displayName.split('|')[1] || '00000'
						const compressed = apelido.replaceAll(' ', '')
						if(compressed == recrutador) return m
					})

					if(recrutador === '310') getrecrutador = interaction.guild.members.cache.get('978379772306538496')
					if(recrutador === '000') getrecrutador = interaction.guild.members.cache.get('501564587725029386')

					const canalconfirmar = interaction.guild.channels.cache.find(c => c.name == '『📃』set-confirm')
					const embed2 = new MessageEmbed()
                            .setTitle('CONFIRMAR SET')
                            .setFields([
                                {
                                    name: 'QRA:',
                                    value: `${qra}`  
                                },
                                {
                                    name: 'ID:',
                                    value: `${iddomesmo}`
                                },
                                {
                                    name: 'Cargo:',
                                    value: `${cargo}`
                                },
                                {
                                    name: 'Autorização:',
                                    value: `${getrecrutador}`
                                }
                            ])
                            .setFooter('CORE - CIDADE ALTA RJ')
                            .setColor('BLACK')
							.setThumbnail(interaction.user.displayAvatarURL({dynamic: true, format: 'png', size: 4096}))
					const rowconfirmar = new MessageActionRow()
						.addComponents([
							new MessageButton()
								.setCustomId('botaoconfirmar')
								.setEmoji('✅')
								.setStyle('SUCCESS'),
							new MessageButton()
								.setCustomId('descartar')
								.setLabel('Descartar')
								.setStyle('DANGER')
						])
					
					canalconfirmar.send({content: `${getrecrutador}`, embeds: [embed2], components: [rowconfirmar]}).then(msg => {
						const filter3 = i => i.user.id === getrecrutador.id
						const collector = msg.createMessageComponentCollector({filter3, time: 600000})
						collector.on('collect', b => {
							switch (b.customId) {
								case 'botaoconfirmar':
									if(b.user.id === getrecrutador.id) {
										const cargoestag = interaction.guild.roles.cache.find(c => c.name =='❯ Estagiário | CORE')
										const cargocursop = interaction.guild.roles.cache.find(c => c.name =='⚠️ | Cursos Pendentes')
										const cargocore = interaction.guild.roles.cache.find(c => c.name =='👮🏻‍♂️ | C.O.R.E')
										interaction.member.roles.set([cargoestag, cargocursop, cargocore])
								
										interaction.member.setNickname(`[EST] ${qra} | ${iddomesmo}`)
									} else {
										b.reply({content: 'Você não é o recrutador.', ephemeral: true})
									}
									b.reply({content: 'Set confirmado.', ephemeral: true})
									const canalrelatorio = interaction.guild.channels.cache.find(c => c.name == '『📃』relatórios')
									canalrelatorio.send({embeds: [embed2.setTitle('**RELATÓRIO REC**')], components: []})
									msg.delete()
								break;
								case 'descartar':
									if(b.user.id === getrecrutador.id) {
										msg.delete()
									}
								break;
							}
							
						})
					})
					modal.reply({content: `Aguarde seu set ser confirmado!`, ephemeral: true})
				})
	}
})


client.login(token)
