package controllers

import de.htwg.se.kniffel.controller.controllerBaseImpl.Controller
import de.htwg.se.kniffel.model.Move
import play.api.mvc._

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
  def index(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.index(controller))
  }

  def kniffel(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.kniffel(controller))
  }

  def about(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.about())
  }

  def field: Action[AnyContent] = Action {
    Ok(views.html.kniffel(controller))
  }

  def dice: Action[AnyContent] = Action {
    controller.doAndPublish(controller.dice())
    Ok(views.html.kniffel(controller))
  }

  def putOut(out: String): Action[AnyContent] = Action {
    if (!out.isEmpty) {
      controller.doAndPublish(controller.putOut, out.split(",").toList.map(_.toInt))
      Ok(views.html.kniffel(controller))
    } else {
      BadRequest("Something went wrong!")
    }
  }

  def putIn(in: String): Action[AnyContent] = Action {
    if (!in.isEmpty) {
      controller.doAndPublish(controller.putIn, in.split(",").toList.map(_.toInt))
      Ok(views.html.kniffel(controller))
    } else {
      BadRequest("Something went wrong!")
    }
  }

  def redo: Action[AnyContent] = Action {
    controller.redo()
    Ok(views.html.kniffel(controller))
  }

  def undo: Action[AnyContent] = Action {
    controller.undo()
    Ok(views.html.kniffel(controller))
  }

  def write(to: String): Action[AnyContent] = Action {
    val index = controller.diceCup.indexOfField.get(to)
    if (index.isDefined && controller.field.getMatrix.isEmpty(controller.getGame.getPlayerID, index.get)) {
      writeDown(Move(controller.getDicecup.getResult(index.get).toString, controller.getGame.getPlayerID, index.get))
      Ok(views.html.kniffel(controller))
    } else {
      BadRequest("Invalid Input.")
    }
  }

  def save: Action[AnyContent] = Action {
    controller.save
    Ok(views.html.kniffel(controller))
  }

  def load: Action[AnyContent] = Action {
    controller.load
    Ok(views.html.kniffel(controller))
  }

  private def gameAsText = String.format("%s \n%s%s ist an der Reihe.",
    controller.field.toString, controller.diceCup.toString, controller.getGame.getPlayerName)

  private def writeDown(move: Move): Unit = {
    controller.put(move)
    controller.next()
    controller.doAndPublish(controller.nextRound())
  }

  def newGame(players: Int): Action[AnyContent] = Action {
    controller.newGame(players)
    Ok(views.html.kniffel(controller))
  }
}
