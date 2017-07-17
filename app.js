// This loads the environment variables from the .env file
require('dotenv-extended').load()

var builder = require('botbuilder')
var restify = require('restify')
var tvmaze = require('tvmaze-api')

// Setup Restify Server
var server = restify.createServer()
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log('%s listening to %s', server.name, server.url)
})

// Create connector and listen for messages
var connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
})
server.post('/api/messages', connector.listen())

var bot = new builder.UniversalBot(connector, function (session) {
  session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text)
})

var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL)
bot.recognizer(recognizer)

bot.dialog('FindTVShow', [
  function (session, args, next) {
    var tvShow = builder.EntityRecognizer.findEntity(args.intent.entities, 'showName')
    if (tvShow) {
      session.sendTyping()
      tvmaze.getByQuery(tvShow, true, [], function (result) {
        session.send('I found: %s', result.id)
      })
    } else {
      builder.Prompts.text(session, 'Please enter your TV-Show name')
    }
  },
  function (session, result) {
    var tvShow = result.response
    session.sendTyping()
    tvmaze.getByQuery(tvShow, true, [], function (result) {
      session.send('I found: %s', result.id)
    })
  }
]).triggerAction({
  matches: 'FindTVShow'
})

bot.dialog('Help', function (session) {
  session.endDialog('Hi! Try asking me things like \'search tv-show\', \'tv-show schedule for today\'.')
}).triggerAction({
  matches: 'Help'
})

bot.dialog('default', function (session) {
  session.endDialog('Try to search tv-show')
})
