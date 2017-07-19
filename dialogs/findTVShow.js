const tvmaze = require('tvmaze-api')

module.exports = function (bot, builder) {
  bot.dialog('FindTVShow', [
    (session, args, _) => {
      if (args) {
        const tvShow = builder.EntityRecognizer.findEntity(args.intent.entities, 'showName')
        session.sendTyping()
        tvmaze.getByQuery(tvShow.entity, false, [], (result) => {
          let cards = []
          result.forEach(object => {
            let name = object.show.name + '. Started at: ' + object.show.premiered + ' .'
            let card = builder.CardAction.imBack(session, object.show.id.toString(), name)
            cards.push(card)
          })
          let message =
            new builder.Message(session)
                       .text('Choose TV-Show')
                       .suggestedActions(
                         builder.SuggestedActions.create(
                           session, cards
                         )
                       )
          session.send(message)
        })
      } else {
        builder.Prompts.text(session, 'Please enter your TV-Show name')
      }
    },
    (session, result) => {
      const tvShow = result.response

      session.sendTyping()
      tvmaze.getByQuery(tvShow, false, [], (result) => {
        let cards = []
        result.forEach(object => {
          let name = object.show.name + '. Started at: ' + object.show.premiered + ' .'
          let card = builder.CardAction.imBack(session, object.show.id.toString(), name)
          cards.push(card)
        })
        let message =
          new builder.Message(session)
                     .text('Choose TV-Show')
                     .suggestedActions(
                       builder.SuggestedActions.create(
                         session, cards
                       )
                     )
        session.send(message)
      })
    },
    (session, result) => {
      console.log(result)
    }
  ]).triggerAction({
    matches: 'FindTVShow'
  })
}
