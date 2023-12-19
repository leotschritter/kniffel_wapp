package de.htwg.se.kniffel
package controller

import de.htwg.se.kniffel.model.Move
import de.htwg.se.kniffel.model.dicecupComponent.IDiceCup
import de.htwg.se.kniffel.model.fieldComponent.IField
import de.htwg.se.kniffel.model.gameComponent.IGame
import play.api.libs.json.JsObject

import scala.collection.immutable.ListMap
import scala.swing.Publisher

trait IController extends Publisher {
  def undo(): Unit

  def redo(): Unit

  def put(move: Move): Unit

  def quit(): Unit

  def next(): Unit

  def doAndPublish(doThis: List[Int] => IDiceCup, list: List[Int]): Unit

  def putOut(list: List[Int]): IDiceCup

  def putIn(list: List[Int]): IDiceCup

  /*def doAndPublish(doThis: => IDiceCup): Unit*/

  def dice(): Unit

  def nextRound(): Unit

  def toString: String

  def getField: IField

  def getDicecup: IDiceCup

  def getGame: IGame

  def save: Unit

  def load: Unit

  def canWrite(col: Int, row: Int): Boolean
  /*def newGame(numberOfPlayers: Int): Unit*/
  def newGame(players: List[String]): Unit

  def toJson: JsObject

  def getSuggestions: ListMap[Int, Int]
}

import scala.swing.event.Event

case class DiceCupChanged(isDice: Boolean) extends Event

class ControllerChanged extends Event

class KniffelShutdown extends Event