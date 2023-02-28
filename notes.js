/**
 * Avatar Project
 */
//  DATABASE2=mongodb+srv://sarah:<PASSWORD>@cluster0.d6hnrcu.mongodb.net/classbend
//
// git add -A
// git commit -m "..."
// git push origin master
/**
 * 1) STARTING
 *
 * npm init
 * npm i express
 * npm i nodemon parcel --save-dev
 * npm i eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb eslint-plugin-node eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react --save-dev
 * npm i morgan dotenv slugify jsonwebtoken multer validator (bcrypt or bcryptjs?) nodemailer pug @babel/polyfill axios cookie-parser
 *
 * add em package.json dentro de scripts: "start": "nodemon server.js"
 *
 * create app.js
 *
 * create a file named .prettierrc with this content: { "singleQuote": true }
 * create a file named .eslintrc.json and copy its content from another project
 *
 * create server.js file - there we require 'dotenv'
 *
 * create a file named config.env for the environment variables
 *
 * add em package.json dentro de scripts: "start:prod": "SET NODE_ENV=production&&nodemon server.js"
 *
 * create a remote database hosted in MondoDB Atlas - use this link: https://cloud.mongodb.com/v2/63af11481e2e96267432c3c6#/clusters
 * update config.env file with database settings
 * npm i mongoose
 * require mongoose in server.js and do mongoose.connect()
 *
 * public folder: all data that is available on the client side
 */

/**
 * 2) ERROR HANDLING
 * create a error handiling middleware in file app.json - needs to be the last middleware
 * all errors must be sent there
 * create an AppError class to mark errors as 'operational' and send status to the middleware
 * create catchAsync wrapper to remove try/catch blocks from route handlers
 */

/**
 * 3) PASSWORDS RELATED STUFF
 * password and passwordConfirm must be equal
 * email must be valid and unique - use validator module
 * use bcrypt to hash password with salt length of 12
 */

/**
 * 4) APIFeatures
 * allows advanced querys throught the url: sort, pagination(limit, page, skip), select fields, filter
 * ex.: url...?fields=name,price&sort=price&limit=10&page=3&ratingsAverage[gte]=4
 */

/**
 * 5) PARCEL and FRONT END - RENDER WEBSITE
 * things related to the front end part of our application
 * create the views folder
 * intall parcel bundler
 * create public/js folder for all the front end
 * index.js file is entry file where we select DOM elements and delegate tasks to other modules like leaflet for
 * map rendering, login.js, showAlert, ...
 * add commands to package.json to run parcel
 */

/**
 * POPULATE vs VIRTUAL POPULATE
 *
 * on teacherSchema we reference 'review' docs, reference and 'user' docs (as 'aide')
 * when calling GET findoOne() route handler for a teacher, thats when we want to populate a teacher with his reviews's
 * when GETing all teachers, we do not poputale with reviews (but we always populate with the teachers aide's)
 *
 * the teachers aide's are populated in the teacher Model - in a 'pre' middleware
 * the teachers reviews's are populated in the controller - we attach a .populate() to the Teacher.find()
 */

/**
 * 5) TO-DO
 * Use query.near() instead with the spherical option set to true.
 * search fo teachers near user
 *
 *
 * user tried 3 times to log in and the password was wrong - captcha
 *
 * user add images
 *
 * see if you can make a fn that receives a obj and some strings with fields names and return the filtered obj
 * only with the fields passed - use Object.keys (userController - updateMe)
 *
 * amazon forgotPassword warning div
 *
 * on the rendering part, we want to query teachers using their slug instead of the id(id only in quering in the API)
 * makes the url look nicer
 *
 * what is drawer.css.map that is making GET requests to my routes ?
 */

/**
 * 6) DOCUMENTATION
 *
 * using JSON WEB TOKEN (essa info deve ir no Postman?)
 *
 * o valor 'teacher' ou 'admin' nao é setted no login, pois no login o novo usuario é criado como 'user' por padrao
 * isso pode ser mudado por um admin atravez de um patch ou um admin pode criar uma conta usando a rota create user
 *
 * all users have password 123456
 */

/**
 * 7) truques que aprendi - colocar no arquivo JS tutorial
 * 
 * ALT CTRL setinha p/ baixo ou p/ sima
 * 
 * helmet() nao deixa colocar script com codigo js dentro do pug template, tem que ou colocar todo o codifo dentro 
 * de um arquivo file.js separado e fazer script(src='file.js') ou mudar as opçoes do helmet
 *
 * converter para inteiro: value * 1
 * converter para string: input + ''
 *
 * something about promises that was interesting was dealing with async await in userModel in fn
 * userSchema.methods.verifyPassword
 * and using this fn in authController 'updatePassword' fn
 * 
 * 8) challenge
 * 
 * em userController, fazer isso dar certo: 
 * 
 
exports.updateUser = (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('Please use /updateMyPassword route to change your password',400));
  }
  
  factory.updateOne(User);
};
 *
 * THIS ONE IS REALLY USEFULL AND COOL:
 * 
 * you have an object, inside "errors" you know there will be a field but you dont know the name of it. 
 * In this exemple
 * 
 *  "error": {
      "errors": {
          "bending": {
              "name": "ValidatorError",
              "message": "Path `bending` is required.",
              "properties": {
                  "message": "Path `bending` is required.",
                  "type": "required",
                  "path": "bending"
              },
              "kind": "required",
              "path": "bending"
          }
      },
      "_message": "User validation failed"
  }

 * is "bending", but it could be "password", "role" ... And inside it, there will be the field you want witch is 
 * "name": "ValidatorError",
 * making a har copy like this:
 * 
 * let err = {...error};
 * 
 * will just copy the error, BUT making it like this:
 * 
 * ler err = { error.name, ...error };
 * 
 * will give you this:
 * 
 *  "error": {
 *    "name": "ValidatorError",
      "errors": {
          "bending": {
              "name": "ValidatorError",
              "message": "Path `bending` is required.",
              "properties": {
                  "message": "Path `bending` is required.",
                  "type": "required",
                  "path": "bending"
              },
              "kind": "required",
              "path": "bending"
          }
      },
      "_message": "User validation failed"
  }

 */

/**
 * HTML STUFF:
 *
 * input(type='file' id='photo' name='photo' accept='image/*')
 * label(for='photo') Choose new photo
 *
 * accept only images in all (*) formats
 *
 * for='id_name'
 * When used together with the <label> element, the 'for' attribute specifies which form element a label
 * is bound to. If u click the label u trigger the input
 */
