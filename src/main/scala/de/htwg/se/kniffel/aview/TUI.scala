package de.htwg.se.kniffel
package aview

import com.google.inject.Inject
import de.htwg.se.kniffel.controller.IController
import de.htwg.se.kniffel.model.Move
import de.htwg.se.kniffel.util.{Event, Observer}

import scala.io.StdIn.readLine
import scala.swing.Reactor
import scala.util.{Failure, Success, Try}


class TUI @Inject()(controller: IController) extends Reactor {
  private var continue = true

  def run(): Unit = {
    println(controller.getField.toString)
    inputLoop()
  }

  def update(e: Event.Event): Unit =
    e match {
      case Event.Quit => continue = false
      case Event.Save => continue
      case _ => println(controller.getField.toString + "\n" + controller.getDicecup.toString + controller.getGame.getPlayerName + " ist an der Reihe.")
    }

  private def inputLoop(): Unit = {
    analyseInput(readLine) match {
      case None => inputLoop()
      case Some(move) => writeDown(move)
    }
    if (continue) inputLoop()
  }

  private def analyseInput(input: String): Option[Move] = {
    val list = input.split("\\s").toList
    list.head match {
      case "q" => sys.exit(0); None
      case "po" => diceCupPutOut(list.tail.map(_.toInt)); None
      case "pi" => diceCupPutIn(list.tail.map(_.toInt)); None
      case "d" => controller.doAndPublish(controller.dice()); None
      case "u" => controller.undo(); None
      case "r" => controller.redo(); None
      case "s" => controller.save; None
      case "l" => controller.load; None
      case "wd" =>
        invalidInput(list) match {
          case Success(f) => val posAndDesc = list.tail.head
            val index: Option[Int] = controller.getDicecup.indexOfField.get(posAndDesc)
            if (index.isDefined && controller.canWrite(controller.getGame.getPlayerID, index.get)) {
              Some(Move(controller.getDicecup.getResult(index.get).toString, controller.getGame.getPlayerID, index.get))
            } else {
              println("Falsche Eingabe!")
              None
            }
          case Failure(v) => println("Falsche Eingabe"); None
        }
      case _ =>
        println("Falsche Eingabe!"); None
    }
  }

  private def invalidInput(list: List[String]): Try[String] = Try(list.tail.head)

  def writeDown(move: Move): Unit = {
    controller.put(move)
    controller.next()
    controller.doAndPublish(controller.nextRound())
  }

  def diceCupPutIn(pi: List[Int]): Unit = controller.doAndPublish(controller.putIn, pi)

  def diceCupPutOut(po: List[Int]): Unit = controller.doAndPublish(controller.putOut, po)

}