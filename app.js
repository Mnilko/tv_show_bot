const dotenv = require('dotenv-extended')
const builder = require('botbuilder')
const restify = require('restify')
const tvmaze = require('tvmaze-api')

// This loads the environment variables from the .env file
dotenv.load()

// Setup Restify Server
const server = restify.createServer()
server.listen(
  process.env.port || process.env.PORT || 3978,
  () => {
    console.log('%s listening to %s', server.name, server.url)
  }
)

// Create connector and listen for messages
const connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
})
server.post('/api/messages', connector.listen())

const bot = new builder.UniversalBot(
  connector,
  (session) => {
    const message = 'Sorry, I did not understand \'%s\'. ' +
                    'Type \'help\' if you need assistance.'

    session.send(message, session.message.text)
  }
)

const recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL)
bot.recognizer(recognizer)

bot.dialog('FindTVShow', [
  (session, args, _) => {
    const tvShow =
      builder.EntityRecognizer.findEntity(args.intent.entities, 'showName')

    if (tvShow) {
      session.sendTyping()
      tvmaze.getByQuery(tvShow, true, [], (result) => {
        session.send('I found: %s', result.id)
      })
    } else {
      builder.Prompts.text(session, 'Please enter your TV-Show name')
    }
  },
  (session, result) => {
    const tvShow = result.response

    session.sendTyping()
    tvmaze.getByQuery(tvShow, true, [], (result) => {
      session.send('I found: %s', result.id)
    })
  }
]).triggerAction({
  matches: 'FindTVShow'
})

bot.dialog('Help', (session) => {
  const message = 'Hi! Try asking me things like \'search tv-show\', ' +
                  '\'tv-show schedule for today\'.'

  session.endDialog(message)
}).triggerAction({
  matches: 'Help'
})

bot.dialog('default', (session) => {
  session.endDialog('Try to search tv-show')
})
