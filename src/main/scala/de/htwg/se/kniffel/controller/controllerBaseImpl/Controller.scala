package de.htwg.se.kniffel
package controller.controllerBaseImpl

import com.google.inject.Inject
import de.htwg.se.kniffel.controller.{DiceCupChanged, FieldChanged, IController, KniffelShutdown}
import de.htwg.se.kniffel.model.Move
import de.htwg.se.kniffel.model.dicecupComponent.IDiceCup
import de.htwg.se.kniffel.model.dicecupComponent.dicecupBaseImpl.DiceCup
import de.htwg.se.kniffel.model.fieldComponent.IField
import de.htwg.se.kniffel.model.fieldComponent.fieldBaseImpl.{Field, Matrix}
import de.htwg.se.kniffel.model.fileIOComponent.IFileIO
import de.htwg.se.kniffel.model.fileIOComponent.fileIOJsonImpl.FileIO
import de.htwg.se.kniffel.model.gameComponent.IGame
import de.htwg.se.kniffel.model.gameComponent.gameBaseImpl.Game
import de.htwg.se.kniffel.util.UndoManager
import play.api.libs.json.{JsObject, Json}

class Controller @Inject()(var field: IField, var diceCup: IDiceCup, var game: IGame, var file: IFileIO) extends IController {

  private val undoManager = new UndoManager[IGame, IField]

  def this() = {
    this(Field(new Matrix[String](2)), new DiceCup(), new Game(2, false), new FileIO())
  }

  def undo(): Unit = {
    diceCup = diceCup.nextRound()
    val r = undoManager.undoStep(game, field)
    game = r._1
    field = r._2
    publish(new FieldChanged)
  }

  def redo(): Unit = {
    diceCup = diceCup.nextRound()
    val r = undoManager.redoStep(game, field)
    game = r._1
    field = r._2
    publish(new FieldChanged)
  }

  def put(move: Move): Unit = {
    diceCup = diceCup.nextRound()
    val r = undoManager.doStep(game, field, new SetCommand(move))
    game = r._1
    field = r._2
  }

  def quit(): Unit = publish(new KniffelShutdown)

  def next(): Unit =
    game = game.next().get

  // doAndPublish for putOut and putIn
  def doAndPublish(doThis: List[Int] => IDiceCup, list: List[Int]): Unit = {
    diceCup = doThis(list)
    publish(new DiceCupChanged)
  }

  def putOut(list: List[Int]): IDiceCup =
    diceCup.putDicesOut(list)

  def putIn(list: List[Int]): IDiceCup =
    diceCup.putDicesIn(list)

  // doAndPublish for nextRound() and dice()
  def doAndPublish(doThis: => IDiceCup): Unit = {
    diceCup = doThis
    publish(new DiceCupChanged)
  }

  def dice(): IDiceCup = diceCup.dice()

  def nextRound(): IDiceCup = diceCup.nextRound()

  def getField: IField = field

  def getDicecup: IDiceCup = diceCup

  def getGame: IGame = game

  def save: Unit = {
    file.saveGame(game)
    file.saveField(field, field.getMatrix)
    file.saveDiceCup(diceCup)
    publish(new FieldChanged)
    publish(new DiceCupChanged)
  }

  def load: Unit = {
    field = file.loadField
    game = file.loadGame
    diceCup = file.loadDiceCup
    publish(new FieldChanged)
    publish(new DiceCupChanged)
  }

  def canWrite(col: Int, row: Int): Boolean = field.getMatrix.isEmpty(col, row)

  override def toString: String = field.toString

  def newGame(numberOfPlayers: Int): Unit = {
    field = new Field(numberOfPlayers)
    diceCup = new DiceCup()
    game = new Game(numberOfPlayers, true)
  }

  override def toJson: JsObject = {
    Json.obj(
      "controller" ->
        this.getDicecup.toJson
          .deepMerge(this.getField.toJson)
          .deepMerge(this.getGame.toJson))
  }
}