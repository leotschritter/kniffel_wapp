package de.htwg.se.kniffel
package aview

import controller.IController
import model.Move

import scala.util.{Failure, Success, Try}
import scala.io.StdIn.readLine
import util.{Event, Observer}
import Config._


class TUI(implicit controller: IController) extends UI with Observer {
  override def controller: IController = Config.controller
  Config.controller.add(this)
  var continue = true

  override def run(): Unit =
    println(Config.controller.getField.toString)

  inputLoop()

  def update(e: Event.Event): Unit =
    e match {
      case Event.Quit => continue = false
      case Event.Save => continue = true
      case _ => println(Config.controller.getField.toString + "\n" + Config.controller.getDicecup.toString + Config.controller.getGame.getPlayerName + " ist an der Reihe.")
    }


  def inputLoop(): Unit = {
    analyseInput(readLine) match {
      case None => inputLoop()
      case Some(move) => writeDown(move)
    }
    if (continue) inputLoop()
  }

  def analyseInput(input: String): Option[Move] = {
    val list = input.split("\\s").toList
    list.head match {
      case "q" => None
      case "po" => diceCupPutOut(list.tail.map(_.toInt)); None
      case "pi" => diceCupPutIn(list.tail.map(_.toInt)); None
      case "d" => Config.controller.doAndPublish(Config.controller.dice()); None
      case "u" => Config.controller.undo(); None
      case "r" => Config.controller.redo(); None
      case "s" => Config.controller.save; None
      case "l" => Config.controller.load; None
      case "wd" =>
        invalidInput(list) match {
          case Success(f) => val posAndDesc = list.tail.head
            val index: Option[Int] = Config.controller.getDicecup.indexOfField.get(posAndDesc)
            if (index.isDefined && Config.controller.getField.getMatrix.isEmpty(Config.controller.getGame.getPlayerID, index.get))
              Some(Move(Config.controller.getDicecup.getResult(index.get).toString, Config.controller.getGame.getPlayerID, index.get))
            else
              println("Falsche Eingabe!"); None
          case Failure(v) => println("Falsche Eingabe"); None
        }
      case _ =>
        println("Falsche Eingabe!"); None
    }
  }

  def invalidInput(list: List[String]): Try[String] = Try(list.tail.head)

  def getController: IController = Config.controller
}