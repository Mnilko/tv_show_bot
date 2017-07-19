const dotenv = require('dotenv-extended')
const builder = require('botbuilder')
const restify = require('restify')

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

const bot = new builder.UniversalBot(connector, [
  (session) => {
    session.send("You said: '%s'. Try asking for 'help' or say 'goodbye' to quit", session.message.text)
  }
])

const recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL)
bot.recognizer(recognizer)

require('./dialogs/FindTVShow.js')(bot, builder)

bot.dialog('Hello', (session) => {
  session.send('Hi :)')
  session.beginDialog('FindTVShow')
}).triggerAction({
  matches: 'Hello'
})

bot.dialog('Help', (session) => {
  const mes = 'Hi! Try asking me things like \'search tv-show\', ' +
                  '\'tv-show schedule for today\'.'
  let message =
    new builder.Message(session)
               .text(mes)
               .suggestedActions(
                 builder.SuggestedActions.create(
                   session, [
                     builder.CardAction.imBack(session, 'Find TV-Show', 'Help me find a tv-show')
                   ]
                 )
               )

  session.endDialog(message)
}).triggerAction({
  matches: 'Help'
})

bot.endConversationAction('GoodByeAction', 'Ok... See you later.', { matches: 'GoodByeAction' })
