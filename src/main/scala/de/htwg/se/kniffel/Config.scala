package de.htwg.se.kniffel

import controller.IController
import controller.controllerBaseImpl.Controller
import model.fileIOComponent.IFileIO
import model.fileIOComponent.fileIOXmlImpl.FileIO
import model.gameComponent.IGame
import model.gameComponent.gameBaseImpl.Game
import model.dicecupComponent.IDiceCup
import model.dicecupComponent.dicecupBaseImpl.DiceCup
import model.fieldComponent.{IField, IMatrix}
import model.fieldComponent.fieldBaseImpl.{Field, Matrix}

object Config {
  val numberOfPLayers = 2
  val field = new Field(numberOfPLayers)
  implicit val IField: IField = field

  val dicecup = new DiceCup()
  implicit val IDiceCup = dicecup

  val game = new Game(numberOfPLayers)
  implicit val IGame = game

  val fileIO = new FileIO
  implicit val IFileIO = fileIO

  val controller = new Controller()
  implicit val IController = controller
}
