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
  def index(): Action[AnyContent] = Action {
    Ok(views.html.index(controller))
  }

  def kniffel(): Action[AnyContent] = Action {
    Ok(views.html.kniffel(controller, false))
  }

  def about(): Action[AnyContent] = Action {
    Ok(views.html.about())
  }

  def field: Action[AnyContent] = Action {
    Ok(views.html.kniffel(controller, false))
  }

  def dice: Action[AnyContent] = Action {
    controller.doAndPublish(controller.dice())
    Ok(views.html.kniffel(controller, true))
  }

  def putOut(out: String): Action[AnyContent] = Action {
    if (out.nonEmpty) {
      controller.doAndPublish(controller.putOut, out.split(",").toList.map(_.toInt))
      Ok(views.html.kniffel(controller, false))
    } else {
      BadRequest("Something went wrong!")
    }
  }

  def putIn(in: String): Action[AnyContent] = Action {
    if (in.nonEmpty) {
      controller.doAndPublish(controller.putIn, in.split(",").toList.map(_.toInt))
      Ok(views.html.kniffel(controller, false))
    } else {
      BadRequest("Something went wrong!")
    }
  }

  def redo: Action[AnyContent] = Action {
    controller.redo()
    Ok(views.html.kniffel(controller, false))
  }

  def undo: Action[AnyContent] = Action {
    controller.undo()
    Ok(views.html.kniffel(controller, false))
  }

  def write(to: String): Action[AnyContent] = Action {
    val index = controller.diceCup.indexOfField.get(to)
    if (index.isDefined && controller.field.getMatrix.isEmpty(controller.getGame.getPlayerID, index.get)) {
      writeDown(Move(controller.getDicecup.getResult(index.get).toString, controller.getGame.getPlayerID, index.get))
      Ok(views.html.kniffel(controller, false))
    } else {
      BadRequest("Invalid Input.")
    }
  }

  def save: Action[AnyContent] = Action {
    controller.save
    Ok(views.html.kniffel(controller, false))
  }

  def load: Action[AnyContent] = Action {
    controller.load
    Ok(views.html.kniffel(controller, false))
  }

  private def writeDown(move: Move): Unit = {
    controller.put(move)
    controller.next()
    controller.doAndPublish(controller.nextRound())
  }

  def newGame(players: Int): Action[AnyContent] = Action {
    controller.newGame(players)
    controller.doAndPublish(controller.diceCup.nextRound())
    Ok(views.html.kniffel(controller, false))
  }
}
