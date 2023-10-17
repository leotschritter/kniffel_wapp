package controllers

import javax.inject._
import play.api._
import play.api.mvc._

import de.htwg.se.kniffel.Config.controller

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class KniffelController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {

  /**
   * Create an Action to render an HTML page.
   *
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def index() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.index())
  }

  println(controller.getField.toString())
  def kniffelAsText =  controller.getField.toString()

  /*def about= Action {
    Ok(views.html.index())
  }*/

  def kniffel = Action {
    Ok(kniffelAsText)
  }
}
