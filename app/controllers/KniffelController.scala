package controllers

import akka.actor._
import akka.stream.Materializer
import de.htwg.se.kniffel.controller.controllerBaseImpl.Controller
import de.htwg.se.kniffel.controller.{ControllerChanged, DiceCupChanged, FieldChanged, GameChanged}
import de.htwg.se.kniffel.model.Move
import play.api.libs.json._
import play.api.libs.streams.ActorFlow
import play.api.mvc._

import javax.inject._
import scala.swing.Reactor
/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class KniffelController @Inject()(cc: ControllerComponents) (implicit system: ActorSystem, mat: Materializer) extends AbstractController(cc) {

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
    Ok(controller.toJson)
  }

  def dice: Action[AnyContent] = Action {
    controller.dice()
    // Ok(views.html.kniffel(controller))
    Ok(controller.diceCup.toJson)
  }

  def putOut(out: String): Action[AnyContent] = Action {
    if (out.nonEmpty) {
      controller.doAndPublish(controller.putOut, out.split(",").toList.map(_.toInt))
      Ok(controller.diceCup.toJson)
    } else {
      BadRequest("Something went wrong!")
    }
  }

  def putIn(in: String): Action[AnyContent] = Action {
    if (in.nonEmpty) {
      controller.doAndPublish(controller.putIn, in.split(",").toList.map(_.toInt))
      Ok(controller.diceCup.toJson)
    } else {
      BadRequest("Something went wrong!")
    }
  }

  def redo: Action[AnyContent] = Action {
    controller.redo()
    Ok(controller.toJson)
  }

  def undo: Action[AnyContent] = Action {
    controller.undo()
    Ok(controller.toJson)
  }

  def write(to: String): Action[AnyContent] = Action {
    val index = controller.diceCup.indexOfField.get(to)
    if (index.isDefined && controller.field.getMatrix.isEmpty(controller.getGame.getPlayerID, index.get)) {
      writeDown(Move(controller.getDicecup.getResult(index.get).toString, controller.getGame.getPlayerID, index.get))
      Ok(controller.toJson)
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
    Ok(controller.toJson)
  }

  private def writeDown(move: Move): Unit = {
    controller.put(move)
    controller.next()
    controller.nextRound()
  }

  def newGame(players: Int): Action[AnyContent] = Action {
    controller.newGame(players)
    controller.diceCup.nextRound()
    Ok(views.html.kniffel(controller))
  }

  def allIn(): Action[AnyContent] = Action {
    controller.doAndPublish(controller.putIn, controller.diceCup.getLocked)
    Ok(controller.diceCup.toJson)
  }

  def diceCup(): Action[AnyContent] = Action {
    Ok(controller.diceCup.toJson)
  }

  def isRunning: Action[AnyContent] = Action {
    Ok(Json.obj("isRunning" -> controller.getGame.isRunning));
  }

  def socket = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef { out =>
      println("Connect received")
      KniffelWebSocketActorFactory.create(out)
    }
  }
  private object KniffelWebSocketActorFactory {
    def create(out: ActorRef) = {
      Props(new KniffelWebSocketActor(out))
    }
  }
  private class KniffelWebSocketActor(out: ActorRef) extends Actor with Reactor {
    listenTo(controller)

    def receive = {
      case msg: String =>
        out ! (controller.toJson.toString)
        println("Sent Json to Client "+ msg)
      case _ =>
        println("received something!")
    }

    reactions += {
      case event: DiceCupChanged => sendDiceCupJsonToClient(event.isDice)
      case event: ControllerChanged => sendControllerJsonToClient
      case _ => println("reacted to something!")
    }

    def sendControllerJsonToClient = {
      out ! (controller.toJson.toString)
    }
    def sendDiceCupJsonToClient(isDice: Boolean) = {
      out ! (Json.obj("isDice" -> isDice).deepMerge(controller.getDicecup.toJson).toString())
    }
  }

}

