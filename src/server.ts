import express from "express";
import cors from "cors";
import {
  findSignatureByEpoch,
  getAllSignatures,
  insertSignature,
  removeSignatureByEpoch,
} from "./signature/model";

const app = express();

/**
 * Simplest way to connect a front-end. Unimportant detail right now, although you can read more: https://flaviocopes.com/express-cors/
 */
app.use(cors());

/**
 * Middleware to parse a JSON body in requests
 */
app.use(express.json());

app.get("/signatures", (req, res) => {
  const signatures = getAllSignatures()
  res.status(200).json({
    status: "success",
    data: {
      signatures
    },
  });
});

app.post("/signatures", (req, res) => {
  const { name, message } = req.body; // destructuring name and message object
  if (typeof name === "string") {
    const createdSignature = insertSignature({
      name: name,
      // only include message if it is a string
      message: typeof message === "string" ? message : undefined, //return message if it's a string, otherwise undefined
    });

    res.status(201).json({
      status: "success",
      data: {
        signature: createdSignature,
      },
    });
  } else {
    res.status(400).json({
      status: "fail",
      data: {
        name: "A string value for name is required in your JSON body",
      },
    });
  }
});

app.get("/signatures/:epoch", (req, res) => {
  // /tvshow/:tvId
  // localhost:3000/tvshow/gameofthrones
  // req.params = {tvId: "65"}
  // Okay lets send back only tv show with ID "gameofthrones"
  // Helpful for scaling
  // :epoch is a route parameter
  //  see documentation: https://expressjs.com/en/guide/routing.html
  // fetch(url/signatures/123456789, method=GET)
  const epochId = parseInt(req.params.epoch); // params are string type
  const signature = findSignatureByEpoch(epochId);
  if (signature) {
    res.status(200).json({
      status: "success",
      data: {
        signature,
      },
    });
  } else {
    res.status(404).json({
      status: "fail",
      data: {
        epochId: "Could not find a signature with that epoch identifier",
      },
    });
  }
});

app.delete("/signatures/:epoch", (req, res) => {
  const epochId = parseInt(req.params.epoch); // params are string type
  const didRemove = removeSignatureByEpoch(epochId);
  if (didRemove) {
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE#responses
    // we've gone for '200 response with JSON body' to respond to a DELETE
    //  but 204 with no response body is another alternative:
    //  res.status(204).send() to send with status 204 and no JSON body
    res.status(200).json({
      status: "success",
    });
  } else {
    res.status(404).json({
      status: "fail",
      data: {
        epochId: "Could not find a signature with that epoch identifier",
      },
    });
  }
});

export default app;
