// Express docs: http://expressjs.com/en/api.html
const express = require("express");
// Passport docs: http://www.passportjs.org/docs/
const passport = require("passport");

// pull in Mongoose model for examples
const Example = require("../models/admin");

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require("../../lib/custom_errors");

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404;
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership;

const requireOwnershipBool = customErrors.requireOwnershipBool;

// this is middleware that will remove blank fields from `req.body`, e.g.
const removeBlanks = require("../../lib/remove_blank_fields");
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate("bearer", { session: false });

// instantiate a router (mini app that only handles routes)
const router = express.Router();

// INDEX
// GET /examples
router.get("/examples", requireToken, async (req, res, next) => {
  try {
    const examples = await Example.find();
    // Map examples to plain JavaScript objects
    const mappedExamples = examples.map((example) => example.toObject());
    res.status(200).json({ examples: mappedExamples });
  } catch (error) {
    next(error);
  }
});

// SHOW
// GET /examples/5a7db6c74d55bc51bdf39793
router.get("/examples/:id", requireToken, async (req, res, next) => {
  try {
    // req.params.id will be set based on the `:id` in the route
    const example = await Example.findById(req.params.id);

    // If `findById` is successful, respond with 200 and "example" JSON
    res.status(200).json({ example: example.toObject() });
  } catch (error) {
    // If an error occurs, pass it to the handler
    next(error);
  }
});

// CREATE
// POST /examples
router.post("/examples", requireToken, async (req, res, next) => {
  try {
    // Set owner of new example to be the current user
    req.body.example.owner = req.user.id;
    // Set username of new example to be the current username
    req.body.example.username = req.user.username;
    // Use await with Example.create to handle it as a promise
    const example = await Example.create(req.body.example);

    // Respond with the created example
    res.status(201).json({ example: example.toObject() });
  } catch (error) {
    // Pass any errors along to the error handler
    next(error);
  }
});

// UPDATE
// PATCH /examples/5a7db6c74d55bc51bdf39793
router.patch(
  "/examples/:id",
  requireToken,
  removeBlanks,
  async (req, res, next) => {
    try {
      // If the client attempts to change the `owner` property by including a new owner, prevent that
      delete req.body.example.owner;

      // Find the example by ID
      const example = await Example.findById(req.params.id);
      // Handle 404 if the example is not found
      handle404(example);

      // Ensure ownership of the example
      requireOwnership(req, example);

      // Update the example using the provided data
      await example.updateOne(req.body.example);

      // If the update succeeded, return 204 and no JSON
      res.sendStatus(204);
    } catch (error) {
      // If an error occurs, pass it to the handler
      next(error);
    }
  }
);

// DESTROY
// DELETE /examples/:id
router.delete("/examples/:id", requireToken, async (req, res, next) => {
  try {
    const example = await Example.findById(req.params.id);
    // Handle 404 if the example is not found
    handle404(example);

    // Ensure ownership of the example
    requireOwnership(req, example);

    // Use await to delete the example
    await example.deleteOne();

    // Respond with status 204 for successful deletion
    res.sendStatus(204);
  } catch (error) {
    // Pass any errors along to the error handler
    next(error);
  }
});

module.exports = router;
