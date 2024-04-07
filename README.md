<h1 align="center">
  <br>
  <a href="https://github.com/Polabiel/Zanoni-bot"><img src="https://github.com/Polabiel/zanoni-bot/assets/40695127/687a5bc8-3684-4057-b92f-2e3673ad5308" alt="Zanoni — Whatsapp Bot"></a>
  <br>

  Z — Bot
  <br>  
</h1>

<h4 align="center">Música, Moderação, Diversão and Modulavel.</h4>

<p align="center">
  <a href="#visão-geral">Visão Geral</a>
  •
  <a href="#installation">Instalação</a>
  •
  <a href="#plugins">Plugins</a>
  •
  <a href="#comunidade">Comunidade</a>
  •
  <a href="#licença">Licença</a>
</p>

# Visão Geral

O Z é um bot totalmente modular - o que significa que todos os recursos e comandos podem ser ativados/desativados para o seu
gostar, tornando-o totalmente personalizável.

[Instalação](#Instalação) é fácil, e você **NÃO** precisa saber nada sobre codificação! Aparte
desde a instalação e atualização, todas as partes do bot podem ser controladas no Whatsapp.

# Instalação

A instalação requer **node.LTS**

**O que significa que você pode baixar** *as seguintes plataformas que suportam Node.LTS:*

- [Windows](https://nodejs.org/pt-br/download/)
- [Termux — Android](#termux)
- [Linux](https://nodejs.org/pt-br/download/)
- [MacOS](https://nodejs.org/pt-br/download/)

Se depois de ler o guia você ainda tiver problemas, sinta-se à vontade para se juntar ao
[Servidor oficial do Discord](https://discord.gg/BgQrmc6TnC) e peça ajuda no canal **#Suporte**.

# Comunidade

**Z** está em desenvolvimento contínuo e é apoiado por uma comunidade ativa que produz novos conteúdo (funções/plugins) para que todos possam desfrutar. Novos recursos são adicionados constantemente. A gente se encotrar bem [aqui](https://discord.gg/BgQrmc6TnC) com a comunidade do meu discord

# Termux

Para aqueles que tem dificil para mexer no Termux, tem aqui um Tutorial bem básico

1. Instale o aplicativo F-Droid

O F-Droid é uma biblioteca de aplicativos Android, similar a Play Store. A diferença é que o F-Droid é exclusivo para aplicativos open-source.

- [Site Oficial do fdroid](fdroid.org)

<a href="https://fdroid.org"><img src="https://content.invisioncic.com/v310067/monthly_2022_07/f-droid.png.9c45eb46593f3eb4276b56b7e5534118.png" alt="O que é F-droid" width=300px></a>

Como se trata de um aplicativo fora da Play Store, pode ser necessário liberar algumas permissões durante o processo de instalação.

2. Instale o Termux

Abra o F-Droid, pesquise por Termux e clique em instalar. O Termux é um poderoso emulador de terminal e ambiente Linux para Android. Ele permite a instalação de diversos pacotes (como o Node.js) usando as bibliotecas apt e pkg.

3. Instale o Node.js

Abra o Termux. Usaremos a lib apt para instalar o Node.js. Mas antes, é necessário atualizar a lib. Digite os seguintes comandos:

```bash
apt update
apt upgrade
```

Caso haja alguma solicitação durante a instalação, apenas pressione a tecla Enter.

Para instalar o Node.js, digite o comando:

```bash
apt install nodejs
```

<a href=""><img src="https://content.invisioncic.com/v310067/monthly_2022_07/apt-nodejs.png.94906a380be23e14fc1f8e13c89820cb.png" alt="Terminal do Termux" width=300px></a>

Após a instalação, podemos rodar o Node em nosso dispositivo Android.

<a href=""><img src="https://content.invisioncic.com/v310067/monthly_2022_07/node-running.png.4a758f1bb384e6c748c9ca14af7458ae.png" alt="Terminal do Termux" width=300px></a>

Após isso basta iniciar digitando o comando 
```bash
npm i && npm run build && npm run start
```

- [Creditos](https://forum.casadodesenvolvedor.com.br/topic/44722-como-emular-um-terminal-linux-e-instalar-o-nodejs-no-android/)

## Licença

A criação do [Z-bot](https://github.com/Polabiel/zanoni-bot/) foi feito pelo [Gabriel Oliveira](https://github.com/Polabiel/), caso queira utilizar o projeto, por favor deixe os créditos.
[MIT](https://github.com/guiireal/sky-bot/blob/main/LICENSE)
