package controllers

import akka.actor._
import akka.stream.Materializer
import de.htwg.se.kniffel.controller.controllerBaseImpl.Controller
import de.htwg.se.kniffel.controller.{ControllerChanged, DiceCupChanged}
import de.htwg.se.kniffel.model.Move
import play.api.libs.json._
import play.api.libs.streams.ActorFlow
import play.api.mvc._

import javax.inject._
import scala.concurrent.duration.DurationInt
import scala.swing.Reactor
/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class KniffelController @Inject()(cc: ControllerComponents) (implicit system: ActorSystem, mat: Materializer) extends AbstractController(cc) {

  private val controller = new Controller()

  private var timerValue: Long = 0

  private var numberOfPlayers: Int = 0

  private var readyCount: Int = 0

  private var players: List[String] = Nil

  private var startGame: Boolean = false
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

  def newGame(players: String): Action[AnyContent] = Action {
    controller.newGame(players.split(",").toList)
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

  def lobbySocket = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef { out =>
      println("Connect received")
      LobbyWebSocketActorFactory.create(out)
    }
  }
  private object KniffelWebSocketActorFactory {
    def create(out: ActorRef) = {
      Props(new KniffelWebSocketActor(out))
    }
  }

  private object LobbyWebSocketActorFactory {
    def create(out: ActorRef) = {
      Props(new LobbyWebSocketActor(out))
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

  private class LobbyWebSocketActor(out: ActorRef) extends Actor with Reactor {
    import context._

    if (timerValue == 0) {
      timerValue = System.currentTimeMillis()
    }
    private var tick: Cancellable = _

    out ! Json.obj("event" -> "updateTime", "time" -> (System.currentTimeMillis() - timerValue)).toString
    tick = context.system.scheduler.scheduleWithFixedDelay(initialDelay = 0.seconds, delay = 1.second, receiver = self, message = "Tick")

    def receive = {
      case msg: String =>
        if (Math.floor((System.currentTimeMillis() - timerValue)/1000.0) >= 60.0) {
          timerValue = System.currentTimeMillis()
          if (numberOfPlayers > 1) {
            startGame = true;
          }
        }
        if (msg.equals("Tick")) {
          out ! Json.obj("event" -> "updateTimeMessageEvent", "time" -> (System.currentTimeMillis() - timerValue), "numberOfPlayers" -> numberOfPlayers, "readyCount" -> readyCount, "startGame" -> startGame).toString
        } else if ((Json.parse(msg) \ "event").as[String].equals("newPlayer")) {
          out ! Json.obj("event" -> "newPlayerMessageEvent", "id" -> numberOfPlayers, "numberOfPlayers" -> (numberOfPlayers + 1), "readyCount" -> readyCount).toString
          numberOfPlayers += 1
          players = players :+ (Json.parse(msg) \ "name").as[String]
          println((Json.parse(msg) \ "name").as[String] + " joined")
        } else if ((Json.parse(msg) \ "event").as[String].equals("ready")) {
          readyCount += 1
          out ! Json.obj("event" -> "readyMessageEvent", "readyCount" -> readyCount).toString
        } else if ((Json.parse(msg) \ "event").as[String].equals("closeConnection")) {
          readyCount = if ((Json.parse(msg) \ "ready").as[Boolean]) (readyCount - 1) else readyCount
          numberOfPlayers -= 1
          /*println(players.toString)
          println((players.zipWithIndex.filter { case (_, index) => index != (Json.parse(msg) \ "playerID").as[Int] }.map(_._1)).toString)
          players = players.zipWithIndex.filter { case (_, index) => index != (Json.parse(msg) \ "playerID").as[Int] }.map(_._1)*/
        } else if ((Json.parse(msg) \ "event").as[String].equals("startGame")) {
          if ((Json.parse(msg) \ "playerID").as[Int] == 0) {
            out ! Json.obj("event" -> "newGameMessageEvent", "players" -> players.mkString(","), "isInitiator" -> true).toString
          } else {
            Thread.sleep(1000)
            out ! Json.obj("event" -> "newGameMessageEvent", "players" -> "", "isInitiator" -> false).toString
          }
        }
      case Terminated =>
        println("Connection Terminated")
        tick.cancel()
        context.stop(self)
      case _ =>
        println("received something!")
    }

    reactions += {
      case _ => println("reacted to something!")
    }
  }
}

