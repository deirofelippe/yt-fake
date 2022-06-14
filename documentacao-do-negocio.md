# Documentação do negócio

## Linguagem Ubíqua

Channel: seria a representação do usuário/cliente no sistema.
Comment: interações que channels podem fazer em um video.
Subscribers: quando um channel segue outro com o objetivo de acompanhar seu conteúdo.
Channel list: lista de channels que um channel pode criar para organizar seu feed.
Feed: local onde é exibido videos de channels.
Wishlist: lista de items que um channel pode colocar.
Playlist: lista de videos que um channel pode criar.
Video: um channel pode criar.
Cart: local onde o channel
Purchased Items: local onde o channel pode consumir os items comprados.
Item: video ou playlist que pode ser comprado.

## User Stories

- usuario: admin, user

- **principais fluxos**
	- criar playlist ou video pago;
	- adicionar video ou playlist (curso) na sacola; comprar o que esta na sacola;
	- criar lista de canais (channellist); adicionar canais na lista (playlist);

- usuario lista vídeos, categorias dos videos, canais, playlists
- usuario cria canal
	- adiciona nome, descricao
- usuario cria video
	- faz upload
	- adiciona categorias
	- adiciona playlist
	- visibilidade (publico, privado, nao listado)
	- tipo (comum, pago)
- usuario cria playlist
	- adiciona videos
	- tipo da playlist (pago, normal)
	- tipo pago
		- preco
		- visibilidade, se for privado, entao deixa os videos como privado independente da visibilidade especifica do video
		- pode adicionar subcategorias na playlist, como se fosse modulos e adiciona os videos nela
- usuario abre video
	- pode dar like, dislike
	- pode fazer comentario, pode responder alguem
	- pode se inscrever no canal
	- pode adicionar o video em uma playlist
- usuario abre o canal
	- lista as playlists
	- os uploads dos videos
- sacola
	- videos ou playlist que deseja comprar
- usuario abre lista de compras
	- playlist e videos comprados
- usuario lista videos por inscricoes
- usuario criar lista de canais (channellist)
	- adicionar canais
- lista de compras
- wishlist