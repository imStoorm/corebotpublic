const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
const SimplDB = require('simpl.db');
const db = new SimplDB();

module.exports = {
    data: new SlashCommandBuilder()
            .setName('cronograma')
            .setDescription('Marque o um curso usando este comando.')
            .addRoleOption(option =>
                option.setName('curso')
                    .setDescription('Informe o curso.')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('data')
                .setDescription('Informe a data do curso. (10/12/2024)')
                .setRequired(true))
            .addStringOption(option =>
                option.setName('horario')
                .setDescription('Informe o horário. (17:00)')
                .setRequired(true))
            .addUserOption(option =>
                option.setName('auxiliar')
                .setDescription('Adicione um auxiliar.')
                .setRequired(false)),
    async execute(client, interaction) {
        const curso = interaction.options.getRole('curso')
        const regex = /\[Tático\]|\[AeroCurso\]|\[AeroTático\]/;
        if(!regex.test(curso.name)) {
            return interaction.reply({content: 'Por favor, insira um CURSO.', ephemeral: true})
        }

        const data = interaction.options.getString('data')
        const horario = interaction.options.getString('horario')
        const auxiliar = interaction.options.getUser('auxiliar')
        
        const canal = interaction.guild.channels.cache.find(c => c.name == "『📒』cronograma")

        const row = new Discord.MessageActionRow()
            .addComponents([
            new Discord.MessageButton()
                .setCustomId('enter')
                .setLabel('Entrar')
                .setStyle('SUCCESS'),
            new Discord.MessageButton()
                .setCustomId('sair')
                .setLabel('Sair')
                .setStyle('SECONDARY'),
            new Discord.MessageButton()
                .setCustomId('fechar')
                .setLabel('Fechar Curso')
                .setStyle('DANGER'),
            new Discord.MessageButton()
                .setCustomId('concluir')
                .setLabel('Concluir')
                .setStyle('SECONDARY'),
            new Discord.MessageButton()
                .setCustomId('remover')
                .setLabel('Remover Membro')
                .setStyle('DANGER')
            ])
        
        const row2 = new Discord.MessageActionRow()
            .addComponents([
            new Discord.MessageButton()
                .setCustomId('concluir')
                .setLabel('Concluir')
                .setStyle('SECONDARY'),
            new Discord.MessageButton()
                .setCustomId('remover')
                .setLabel('Remover Membro')
                .setStyle('DANGER'),
            new Discord.MessageButton()
                .setCustomId('cancelarcurso')
                .setLabel('Cancelar Curso')
                .setStyle('DANGER')
        ])


        

        const embed = new Discord.MessageEmbed()
            .setTitle('CRONOGRAMA DE CURSO')
            .setFields([
                {
                  name: 'Curso:',
                  value: `${curso}`  
                },
                {
                  name: 'Instrutor:',
                  value: `${interaction.user}`
                },
                {
                  name: 'Data:',
                  value: data
                },
                {
                  name: 'Horário:',
                  value: horario
                },
                {
                  name: 'Participantes:',
                  value: '\`Não há participantes.\`'
                }
            ])
            .setFooter('CORE - CIDADE ALTA RJ')
            .setColor('BLACK')
        
        if(auxiliar) {
            embed.addFields([{name: 'Auxiliar:', value: `${auxiliar}`}])
        }

       
        interaction.reply({content: 'Cronograma enviado com sucesso.', ephemeral: true})

        db.set(interaction.user.id, [])
        canal.send({embeds: [embed], components: [row]}).then(async msg => {
            const filter = i => i
            const collector = msg.createMessageComponentCollector({filter})
            collector.on('collect', async b => {

                switch (b.customId) {
                    case 'enter':
                        if(db.get(interaction.user.id).includes(b.user.id)) return b.reply({content: 'Você já está nesse curso.', ephemeral: true})

                        db.push(interaction.user.id, b.user.id)

                        const apelidos = []

                        let ids = db.get(interaction.user.id)
                        for(const id of ids) {
                            const member = interaction.guild.members.cache.get(id)
                            const apelido = member.displayName 
                            apelidos.push(apelido)
                        }

                        console.log(apelidos)

                        const stringFormatada = apelidos.map((apelido, index) => `- ${apelido}`).join('\n');
                        msg.embeds[0].fields.find(f => f.name === "Participantes:").value = `\`${stringFormatada}\``;
                        msg.edit({embeds: [msg.embeds[0]]})
                        b.reply({content: 'Presença marcada.', ephemeral: true})
                    break;
                    case 'sair':
                        const member = b.member.id
                        if(!db.get(interaction.user.id).includes(b.member.id)) return b.reply({content: 'Você nem está nesse curso.', ephemeral: true})

                        db.pull(interaction.user.id, member)
                        const newapelidos = []
                        let listaids = db.get(interaction.user.id)
                        for(const id of listaids) {
                            const member = interaction.guild.members.cache.get(id)
                            const apelido = member.displayName 
                            newapelidos.push(apelido)
                        }

                        const stringApelidos = newapelidos.map((apelido, index) => `- ${apelido}`).join('\n');
                        if(listaids[0]) {
                            msg.embeds[0].fields.find(f => f.name === "Participantes:").value = `\`${stringApelidos}\``;
                        } else {
                            msg.embeds[0].fields.find(f => f.name === "Participantes:").value = `\`Não há participantes.\``;
                        }
                        msg.edit({embeds: [msg.embeds[0]]})

                        b.reply({content: 'Você saiu do curso.', ephemeral: true})
                    break;
                    case 'fechar':
                        if(b.user.id == interaction.user.id) {
                            b.reply({content: 'Curso fechado.', ephemeral: true })
                            msg.edit({embeds: [msg.embeds[0]], components: [row2]})
                        } else {
                            b.reply({content: 'Você não é o instrutor desse curso.', ephemeral: true})
                        }

                        
                    break;
                    case 'concluir':
                        if(interaction.user.id !== b.user.id) return b.reply({content: 'Você não é o instrutor desse curso.', ephemeral: true})
                        let listaid = db.get(interaction.user.id)
                        const newapelidoss = []
                        for(const id of listaid) {
                            const member = interaction.guild.members.cache.get(id)
                            member.roles.add(curso)
                            const apelido = member.displayName 
                            newapelidoss.push(apelido)
                        }
                        const stringf = newapelidoss.map((apelido, index) => `- ${apelido}`).join('\n');
                        b.reply({content: 'Curso concluído com sucesso.', ephemeral: true})
                        const canalrelatorio = interaction.guild.channels.cache.find(c => c.name == '『📝』relatórios-cursos')
                        const embed2 = new Discord.MessageEmbed()
                            .setTitle('RELATÓRIO DE CURSO')
                            .setFields([
                                {
                                    name: 'Curso:',
                                    value: `${curso}`  
                                },
                                {
                                    name: 'Instrutor:',
                                    value: `${interaction.user}`
                                },
                                {
                                    name: 'Data:',
                                    value: data
                                },
                                {
                                    name: 'Horário:',
                                    value: horario
                                },
                                {
                                    name: 'Aprovados:',
                                    value: listaid[0] ? `\`${stringf}\`` : `\`Não houve participantes.\``
                                }
                            ])
                            .setFooter('CORE - CIDADE ALTA RJ')
                            .setColor('BLACK')
                        canalrelatorio.send({embeds: [embed2]})
                        msg.delete()
                        db.delete(interaction.user.id)
                    break;
                    case 'remover':
                        if(b.user.id !== interaction.user.id) return b.reply({content: 'Você não é o instrutor desse curso.', ephemeral: true})
                        const modal = new Discord.Modal()
			                .setCustomId('remover')
			                .setTitle('Remover Membro');

                        const id = new Discord.TextInputComponent()
                            .setCustomId('id')
                            .setLabel("Insira o ID do mesmo.")
                            .setStyle('SHORT');

                        const firstActionRow = new Discord.MessageActionRow().addComponents(id)
                        modal.addComponents(firstActionRow)

                        await b.showModal(modal)
                        const filter2 = i => i.customId == 'id'
                        b
                            .awaitModalSubmit({filter2, time: 500000})
                            .then((modal) => {
                                const idfield = modal.fields.getTextInputValue('id')
                                const dbids = db.get(interaction.user.id)
                                for(const id of dbids) {
                                    const member = interaction.guild.members.cache.get(id)
                                    const splitted = member.displayName.split('|')
                                    const idselect = splitted[1]
                                    const compressed = idselect.replaceAll(' ', '')
                                    if(compressed == idfield) {
                                        db.pull(interaction.user.id, id)

                                        const newapelidos = []
                                        let listaids = db.get(interaction.user.id)
                                        for(const id of listaids) {
                                            const member = interaction.guild.members.cache.get(id)
                                            const apelido = member.displayName 
                                            newapelidos.push(apelido)
                                        }

                                        const stringApelidos = newapelidos.map((apelido, index) => `- ${apelido}`).join('\n');
                                        if(listaids[0]) {
                                            msg.embeds[0].fields.find(f => f.name === "Participantes:").value = `\`${stringApelidos}\``;
                                        } else {
                                            msg.embeds[0].fields.find(f => f.name === "Participantes:").value = `\`Não há participantes.\``;
                                        }
                                        
                                        msg.edit({embeds: [msg.embeds[0]]})
                                        modal.reply({content: `Você removeu o membro: ${member.displayName}`, ephemeral: true})
                                    }
                                }
                            })
                    break;
                    case 'cancelarcurso':
                        if(b.user.id !== interaction.user.id) return b.reply({content: 'Você não é o instrutor desse curso.', ephemeral: true})
                        const cancrelatorio = interaction.guild.channels.cache.find(c => c.name == '『📝』relatórios-cursos')
                        const embed3 = new Discord.MessageEmbed()
                            .setTitle('RELATÓRIO DE CURSO')
                            .setFields([
                                {
                                    name: 'Curso:',
                                    value: `${curso}`  
                                },
                                {
                                    name: 'Instrutor:',
                                    value: `${interaction.user}`
                                },
                                {
                                    name: 'Data:',
                                    value: data
                                },
                                {
                                    name: 'Horário:',
                                    value: horario
                                },
                                {
                                    name: '❌CURSO CANCELADO❌',
                                    value: `O curso foi cancelado pelo instrutor!`
                                }
                            ])
                            .setFooter('CORE - CIDADE ALTA RJ')
                            .setColor('RED')
                        cancrelatorio.send({embeds: [embed3]})
                        msg.delete()
                    break;
                }
            })
        })
    }
}
