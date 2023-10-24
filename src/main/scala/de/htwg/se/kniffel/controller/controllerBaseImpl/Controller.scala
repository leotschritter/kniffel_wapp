package de.htwg.se.kniffel
package controller.controllerBaseImpl

import com.google.inject.Inject
import controller.IController
import model.Move
import model.dicecupComponent.IDiceCup
import model.fieldComponent.IField
import model.gameComponent.IGame
import util.{Event, Observable, UndoManager}
import de.htwg.se.kniffel.model.dicecupComponent.dicecupBaseImpl.DiceCup
import de.htwg.se.kniffel.model.fieldComponent.fieldBaseImpl.{Field, Matrix}
import de.htwg.se.kniffel.model.fileIOComponent.fileIOJsonImpl.FileIO
import de.htwg.se.kniffel.model.gameComponent.gameBaseImpl.Game
import model.fileIOComponent.IFileIO

class Controller @Inject()(var field: IField, var diceCup: IDiceCup, var game: IGame, var file: IFileIO) extends IController {

  val undoManager = new UndoManager[IGame, IField]

  def this() = {
    this(Field(new Matrix[String](2)), new DiceCup(), new Game(2), new FileIO())
  }

  def undo(): Unit = {
    diceCup = diceCup.nextRound()
    val r = undoManager.undoStep(game, field)
    game = r._1
    field = r._2
    notifyObservers(Event.Move)
  }

  def redo(): Unit = {
    diceCup = diceCup.nextRound()
    val r = undoManager.redoStep(game, field)
    game = r._1
    field = r._2
    notifyObservers(Event.Move)
  }

  def put(move: Move): Unit = {
    diceCup = diceCup.nextRound()
    val r = undoManager.doStep(game, field, new SetCommand(move))
    game = r._1
    field = r._2
  }

  def quit(): Unit = notifyObservers(Event.Quit)

  def next(): Unit =
    game = game.next().get

  // doAndPublish for putOut and putIn
  def doAndPublish(doThis: List[Int] => IDiceCup, list: List[Int]): Unit = {
    diceCup = doThis(list)
    notifyObservers(Event.Move)
  }

  def putOut(list: List[Int]): IDiceCup =
    diceCup.putDicesOut(list)

  def putIn(list: List[Int]): IDiceCup =
    diceCup.putDicesIn(list)

  // doAndPublish for nextRound() and dice()
  def doAndPublish(doThis: => IDiceCup): Unit = {
    diceCup = doThis
    notifyObservers(Event.Move)
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
    notifyObservers(Event.Save)
  }

  def load: Unit = {
    field = file.loadField
    game = file.loadGame
    diceCup = file.loadDiceCup
    notifyObservers(Event.Load)
  }

  def canWrite(col: Int, row: Int): Boolean = field.getMatrix.isEmpty(col, row)

  override def toString: String = field.toString

  def newGame(numberOfPlayers: Int): Unit = {
    field = new Field(numberOfPlayers)
    diceCup = new DiceCup()
    game = new Game(numberOfPlayers)
  }}