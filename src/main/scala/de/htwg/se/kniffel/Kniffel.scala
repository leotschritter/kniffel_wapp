package de.htwg.se.kniffel

import com.google.inject.{Guice, Injector}
import de.htwg.se.kniffel.aview.{GUI, TUI}
import de.htwg.se.kniffel.controller.controllerBaseImpl.Controller

object Kniffel {
  private val injector: Injector = Guice.createInjector(new KniffelModule)

  val controller: Controller = injector.getInstance(classOf[Controller])
  private val tui = injector.getInstance(classOf[TUI])
  private val gui = injector.getInstance(classOf[GUI])

  def main(args: Array[String]): Unit = {

    println("Welcome to Kniffel")
    tui.run()
  }
}
