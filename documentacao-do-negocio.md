# Documentação do negócio

## Linguagem Ubíqua

Channel: seria a representação do usuário/cliente no sistema.
Comment: interações que channels podem fazer em um video.
Subscribers: quando um channel segue outro com o objetivo de acompanhar seu conteúdo.
Channel Group: lista de channels que um channel pode criar para organizar seu feed.
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

## Objetos

```js
const channel = {
  //zip_code, number, country, city, state
  //id, email, password, address, id_channel
  //id, subscribed to my channel, i'm subscribed, videos, playlists, description, avatar, category
};

const channel_subscribers = {
  id_channel_owner: '',
  id_channel_subscribe: ''
};

const channel_videos = {
  id_channel: '',
  id_video: ''
};

const video = {
  //id, thumbnail, link, description, comments, views, likes, dislikes, visibility, type, tags, title, price
};

const comment = {
  id: '',
  id_author: '',
  id_video: '',
  likes: 0,
  dislikes: 0
};

const category = {
  //id, title
};

const tags = {
  id: '',
  title: ''
};

const video_tags = {
  id_video: '',
  id_tag: ''
};

const channel_group = {
  //id, id_channel_owner, title,
};

const channel_group_item = {
  //id_channel_group, id_chosen_channel
};

const purchased_items = {
  id_item_owner: '',
  id_item: '' //video ou playlist
};

const order = {
  id: '',
  status: '',
  id_channel: ''
};

const order_details = {
  id_order: '',
  id_item: ''
};

const playlist = {
  id: '123',
  id_channel: '1',
  title: 'Curso de Fullcycle Development',
  description: '',
  type: 'REGULAR', //ou BUYABLE
  visibility: 'PUBLIC',
  modules: [
    {
      order: 1,
      title: 'Backend',
      description: '',
      videos: [
        {
          id: '123',
          order: 1
        },
        {
          id: '123',
          order: 2
        }
      ]
    },
    {
      order: 2,
      title: 'DevOps',
      description: '',
      videos: [
        {
          id: '123',
          order: 1
        }
      ]
    }
  ]
};

const playlist_module = {
  //id, id_playlist, order, title, description
};

const playlist_module_video = {
  //id_video, order
};

```