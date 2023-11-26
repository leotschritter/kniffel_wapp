package controllers

import de.htwg.se.kniffel.controller.controllerBaseImpl.Controller
import de.htwg.se.kniffel.model.Move
import de.htwg.se.kniffel.model.dicecupComponent.IDiceCup
import de.htwg.se.kniffel.model.fieldComponent.{IField, IMatrix}
import de.htwg.se.kniffel.model.gameComponent.IGame
import play.api.mvc._
import play.api.libs.json._

import javax.inject._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class KniffelController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {

  private val controller = new Controller()


  /**
   * Create an Action to render an HTML page.
   *
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def index(): Action[AnyContent] = Action {
    Ok(views.html.index(controller))
  }

  def kniffel(): Action[AnyContent] = Action {
    Ok(views.html.kniffel(controller))
  }

  def about(): Action[AnyContent] = Action {
    Ok(views.html.about(controller))
  }

  def field: Action[AnyContent] = Action {
    Ok(controllerToJson(controller))
  }

  def dice: Action[AnyContent] = Action {
    controller.doAndPublish(controller.dice())
    //    Ok(views.html.kniffel(controller))
    Ok(diceCupToJson(controller.diceCup))
  }

  def putOut(out: String): Action[AnyContent] = Action {
    if (out.nonEmpty) {
      controller.doAndPublish(controller.putOut, out.split(",").toList.map(_.toInt))
      Ok(diceCupToJson(controller.diceCup))
    } else {
      BadRequest("Something went wrong!")
    }
  }

  def putIn(in: String): Action[AnyContent] = Action {
    if (in.nonEmpty) {
      controller.doAndPublish(controller.putIn, in.split(",").toList.map(_.toInt))
      Ok(diceCupToJson(controller.diceCup))
    } else {
      BadRequest("Something went wrong!")
    }
  }

  def redo: Action[AnyContent] = Action {
    controller.redo()
    Ok(controllerToJson(controller))
  }

  def undo: Action[AnyContent] = Action {
    controller.undo()
    Ok(controllerToJson(controller))
  }

  def write(to: String): Action[AnyContent] = Action {
    val index = controller.diceCup.indexOfField.get(to)
    if (index.isDefined && controller.field.getMatrix.isEmpty(controller.getGame.getPlayerID, index.get)) {
      writeDown(Move(controller.getDicecup.getResult(index.get).toString, controller.getGame.getPlayerID, index.get))
      Ok(controllerToJson(controller))
    } else {
      BadRequest("Invalid Input.")
    }
  }

  def save: Action[AnyContent] = Action {
    controller.save
    Ok("")
  }

  def load: Action[AnyContent] = Action {
    controller.load
    Ok(controllerToJson(controller))
  }

  private def writeDown(move: Move): Unit = {
    controller.put(move)
    controller.next()
    controller.doAndPublish(controller.nextRound())
  }

  def newGame(players: Int): Action[AnyContent] = Action {
    controller.newGame(players)
    controller.doAndPublish(controller.diceCup.nextRound())
    Ok(views.html.kniffel(controller))
  }

  def allIn(): Action[AnyContent] = Action {
    controller.doAndPublish(controller.putIn, controller.diceCup.getLocked)
    Ok(diceCupToJson(controller.diceCup))
  }

  def diceCup(): Action[AnyContent] = Action {
    Ok(diceCupToJson(controller.diceCup))
  }
  private def diceCupToJson(diceCup: IDiceCup): JsObject = {
    Json.obj(
      "dicecup" -> Json.obj(
        "stored" -> diceCup.getLocked,
        "incup" -> diceCup.getInCup,
        "remainingDices" -> JsNumber(diceCup.getRemainingDices)
      )
    )
  }

  private def fieldToJson(field: IField): JsObject = {
    Json.obj(
      "field" -> Json.obj(
        "numberOfPlayers" -> JsNumber(field.numberOfPlayers),
        "rows" -> field.getRows
      )
    )
  }
  private def gameToJson(game: IGame): JsObject = {
    Json.obj(
      "game" -> Json.obj(
        "nestedList" -> game.getNestedList.map(_.mkString(",")).mkString(";"),
        "remainingMoves" -> JsNumber(game.getRemainingMoves),
        "currentPlayerID" -> JsNumber(game.getPlayerID),
        "currentPlayerName" -> game.getPlayerName,
        "players" -> Json.toJson(
          Seq(for {
            x <- game.getPlayerTuples
          } yield {
            Json.obj(
              "id" -> JsNumber(x._1),
              "name" -> x._2)
          })
        )
      )
    )
  }

  private def controllerToJson(controller: Controller): JsObject = {
    Json.obj(
      "controller" ->
        diceCupToJson(controller.diceCup)
          .deepMerge(fieldToJson(controller.field))
          .deepMerge(gameToJson(controller.game)))

  }
}

