const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');


class MessageService {
  constructor() {
    this.messages = [];
  }
  
  async find() {
    return this.messages;
  }
  
  async create(data) {
    const message = {
      id: this.messages.length,
      text: data.text
    };
    
    this.messages.push(message);
    return message;
  }
};

const app = express(feathers());

app.use(express.json()); //? Middleware that will parse incoming json objects
app.use(express.urlencoded({ extended: true })) //? Middleware that will parse incoming form-data
app.use(express.static(__dirname)); //? static serve-up

app.configure(express.rest()); //? This line of code enables our services to be enabled over REST API
app.configure(socketio()); //?exposes our feathers application over sockets

app.use('/messages', new MessageService());

app.use(express.errorHandler()); //? built-in error handler for express through feathers

app.on('connection', connection => {
  app.channel('everybody').join(connection); //? any time a client connects to our application it puts them into the 'everybody' channel
});//? this gets called any time a client connecrts to our app

app.publish(() => {
  app.channel('everybody'); //? alerts everyone in the 'everybody' channel that a message was published
});

app.listen(3030).on('listening', () => console.log('Feathers server listening on localhost:3030'));

app.service('messages').create({ text: 'Hello world from the server!' });
