package de.htwg.se.kniffel
package controller.controllerBaseImpl

import com.google.inject.Inject
import controller.{ControllerChanged, DiceCupChanged, IController, KniffelShutdown}
import model.Move
import model.dicecupComponent.IDiceCup
import model.dicecupComponent.dicecupBaseImpl.DiceCup
import model.fieldComponent.IField
import model.fieldComponent.fieldBaseImpl.{Field, Matrix}
import model.fileIOComponent.IFileIO
import model.fileIOComponent.fileIOJsonImpl.FileIO
import model.gameComponent.IGame
import model.gameComponent.gameBaseImpl.{Game, Player}
import util.UndoManager
import play.api.libs.json.{JsObject, Json}

class Controller @Inject()(var field: IField, var diceCup: IDiceCup, var game: IGame, var file: IFileIO) extends IController {

  private val undoManager = new UndoManager[IGame, IField]
  private val playersList: List[Player] = List(Player(0, "Player 1"), Player(0, "Player 2"))

  def this() = {
    this(Field(new Matrix[String](2)), new DiceCup(), new Game(List("Player 1", "Player 2")), new FileIO())
  }

  def undo(): Unit = {
    diceCup = diceCup.nextRound()
    val r = undoManager.undoStep(game, field)
    game = r._1
    field = r._2
    publish(new ControllerChanged)
  }

  def redo(): Unit = {
    diceCup = diceCup.nextRound()
    val r = undoManager.redoStep(game, field)
    game = r._1
    field = r._2
    publish(new ControllerChanged)
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
    publish(new DiceCupChanged(false))
  }

  def putOut(list: List[Int]): IDiceCup =
    diceCup.putDicesOut(list)

  def putIn(list: List[Int]): IDiceCup =
    diceCup.putDicesIn(list)

  // doAndPublish for nextRound() and dice()
  /* def doAndPublish(doThis: => IDiceCup): Unit = {
    diceCup = doThis
  }*/

  def dice(): Unit = {
    diceCup = diceCup.dice()
    publish(new DiceCupChanged(true))
  }

  def nextRound(): Unit = {
    diceCup = diceCup.nextRound()
    publish(new DiceCupChanged(false))
  }

  def getField: IField = field

  def getDicecup: IDiceCup = diceCup

  def getGame: IGame = game

  def save: Unit = {
    file.saveGame(game)
    file.saveField(field, field.getMatrix)
    file.saveDiceCup(diceCup)
  }

  def load: Unit = {
    field = file.loadField
    game = file.loadGame
    diceCup = file.loadDiceCup
    publish(new ControllerChanged)
  }

  def canWrite(col: Int, row: Int): Boolean = field.getMatrix.isEmpty(col, row)

  override def toString: String = field.toString

  /*def newGame(numberOfPlayers: Int): Unit = {
    field = new Field(numberOfPlayers)
    diceCup = new DiceCup()
    game = new Game(numberOfPlayers, true)
  }*/

  def newGame(players: List[String]): Unit = {
    field = new Field(players.length)
    diceCup = new DiceCup()
    game = new Game(players)
  }

  override def toJson: JsObject = {
    Json.obj(
      "controller" ->
        this.getDicecup.toJson
          .deepMerge(this.getField.toJson)
          .deepMerge(this.getGame.toJson))
  }
}