package de.htwg.se.kniffel

import com.google.inject.AbstractModule
import de.htwg.se.kniffel.controller.IController
import de.htwg.se.kniffel.controller.controllerBaseImpl.Controller
import de.htwg.se.kniffel.model.dicecupComponent.IDiceCup
import de.htwg.se.kniffel.model.dicecupComponent.dicecupBaseImpl.DiceCup
import de.htwg.se.kniffel.model.fieldComponent.{IField, IMatrix}
import de.htwg.se.kniffel.model.fieldComponent.fieldBaseImpl.{Field, Matrix}
import de.htwg.se.kniffel.model.fileIOComponent.IFileIO
import de.htwg.se.kniffel.model.fileIOComponent.fileIOJsonImpl.FileIO
import de.htwg.se.kniffel.model.gameComponent.IGame
import de.htwg.se.kniffel.model.gameComponent.gameBaseImpl.Game
import net.codingwell.scalaguice.ScalaModule

class KniffelModule extends AbstractModule with ScalaModule {

  val numberOfPlayers: Int = 2

  override def configure(): Unit = {

    bind[IMatrix].toInstance(new Matrix[String](numberOfPlayers))
    bind[IField].toInstance(new Field(numberOfPlayers))
    bind[IGame].toInstance(new Game(numberOfPlayers, false))
    bind[IDiceCup].toInstance(new DiceCup())
    bind[IFileIO].toInstance(new FileIO())
    bind[IController].toInstance(new Controller())
  }

}
