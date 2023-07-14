const { Telegraf } = require("telegraf");
require("dotenv/config");
const { Octokit, App } = require("octokit");
const axios = require("axios");
const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");

const { fetchRepo } = require("./utills");

const bot = new Telegraf(process.env.BOT_TOKEN);

const url = "https://github.com";

const app = express();

var owner = "";
var repo = "";

bot.start((ctx) =>
  ctx.reply("Welcome! Please Send me a Github Repo URL to Start 👋")
);

bot.help((ctx) =>
  ctx.reply(
    "Please Send me a Github Repo URL like(https://github.com/owner/repo) to Start or use @githubrepo_download_bot to search for repositories"
  )
);

bot.on("text", (ctx) => {
  const input = ctx.message.text;
  if (input === "hey")
    ctx.reply("Please I am not a chat bot, please send a github repo URL");
  else {
    try {
      const URLcheck = new URL(input);

      const paths = URLcheck.pathname.toString().split("/");
      owner = paths[1];
      repo = paths[2];

      console.log(repo);

      if (URLcheck.origin !== url) {
        ctx.reply("hmm..Seems like You sent a non-github URL 🤔");
      } else {
        try {
          const octokit = new Octokit({
            auth: process.env.AUTH,
          });

          ctx.reply("Fetching Files ⏱️");
          (async () => {
            try {
              const fetchedRepo = await fetchRepo(owner, repo, octokit);
              try {
                const fileBuffer = Buffer.from(fetchedRepo);
                ctx.telegram
                  .sendDocument(ctx.chat.id, {
                    source: fileBuffer,
                    filename: `${owner}-${repo}.zip`,
                    thumb:
                      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/800px-Google_2015_logo.svg.png",
                  })
                  .then((res) => res)
                  .catch((err) =>
                    ctx.reply("can't send the repo. try again...")
                  );
              } catch (error) {
                ctx.reply(error.message);
              }
            } catch (error) {
              ctx.reply(error.message);
            }
          })();
        } catch (e) {
          console.log(e.data?.message);
        }
      }
    } catch (e) {
      ctx.reply("hmm..Seems like You Didn't send a URL 🤔");
    }
  }
});

const Port = process.env.PORT || 3001;

bot.launch();

app.post(`/${process.env.BOT_TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body);
});

app.get("/", (req, res) => {
  res.send("Server is Live");
});

app.listen(Port, () => {
  console.log("Server Started");
});
