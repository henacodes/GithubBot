const { Telegraf } = require("telegraf");
const axioss = require("axios");
require("dotenv/config");
const { Octokit, App } = require("octokit");
const axios = require("axios");
const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");

const { fetchRepo, showUser, sendRepos } = require("./utills");

const bot = new Telegraf(process.env.BOT_TOKEN);

const url = "https://github.com";

const app = express();

const octokit = new Octokit({
  auth: process.env.AUTH,
});
var owner = "";
var repo = "";

bot.start((ctx) =>
  ctx.reply("Welcome! Please Send me a Github Repo URL to Start 👋")
);

bot.help((ctx) =>
  ctx.reply(
    `Find users and their repos here. You can also download repository.\nSend me the link 🔗🔗 to the repository, I will deliver the zip for you.\nAvailable commands\n/start - initialize the bot \n/user <username> - find a user with his github handle {username}.\nDISCLAIMER: Don't insert @username\n/help - this message`
  )
);

bot.command("/user", (ctx) => {
  ctx.reply("searching for user");
  let args = ctx.message.text.split(" ");
  if (args.length < 2) {
    ctx.reply("Please provide a username");
    return;
  }
  let username = args[1];
  (async () => {
    try {
      const response = await octokit.rest.users.getByUsername({ username });
      const { name, avatar_url, bio, followers, following } = response.data;
      showUser(ctx, name, username, bio, avatar_url, followers, following);
    } catch (error) {
      ctx.reply(`A user with @${username} could not be found`);
    }
  })();
});

bot.on("callback_query", (ctx) => {
  ctx.deleteMessage();
  const query = ctx.callbackQuery;
  const data = query.data;
  if (data.split(" ")[0] === "repos") {
    const username = data.split(" ")[1];
    try {
      axioss
        .get(`https://api.github.com/users/${username}/repos`)
        .then((res) => {
          const repos = res.data.slice(-10);
          sendRepos(ctx, repos, username);
        });
    } catch (error) {
      console.log(error.message);
    }
  }
  if (data.split(" ")[0] === "repo") {
    const username = data.split(" ")[1];
    const repo = data.split(" ")[2];
    try {
      axioss
        .get(`https://api.github.com/repos/${username}/${repo}`)
        .then((res) => {
          ctx.telegram.sendMessage(
            ctx.chat.id,
            `<b>${repo}</b>\n<i>'${res.data.description} '</i>\n👤 owner : github.com/${username}\n⭐️ stars : ${res.data.stargazers_count}\n👀 watchers :  ${res.data.watchers_count}\n📁 size :  ${res.data.size} KB `,
            {
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Download Zip",
                      callback_data: `download ${res.data.html_url}`,
                    },
                  ],
                ],
              },
            }
          );
        });
    } catch (error) {}
  }

  if (data.split(" ")[0] === "download") {
    const url = data.split(" ")[1];
    const URLcheck = new URL(url);
    const paths = URLcheck.pathname.toString().split("/");
    owner = paths[1];
    repo = paths[2];

    (async () => {
      try {
        const fetchedRepo = await fetchRepo(owner, repo, octokit);
        try {
          const fileBuffer = Buffer.from(fetchedRepo);
          ctx.telegram
            .sendDocument(
              ctx.chat.id,
              {
                source: file.Buffer,
                filename: `${owner}-${repo}.zip`,
              },
              {
                thumb: {
                  source: "./winrar.jpg",
                },
                caption: "File Arrived",
              }
            )
            .then((res) => res)
            .catch((err) => ctx.reply("can't send the repo. try again..."));
        } catch (error) {
          ctx.reply(error.message);
        }
      } catch (error) {
        console.log("can't fetch");
        ctx.reply(error.message);
      }
    })();
  }
});

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
          ctx.reply("Fetching Files ⏱️");
          (async () => {
            try {
              const fetchedRepo = await fetchRepo(owner, repo, octokit);
              try {
                const fileBuffer = Buffer.from(fetchedRepo);
                ctx.telegram
                  .sendDocument(
                    ctx.chat.id,
                    {
                      source: fileBuffer,
                      filename: `${owner}-${repo}.zip`,
                    },
                    {
                      thumb: {
                        source: "./winrar.jpg",
                      },
                      caption: "File Arrived",
                    }
                  )
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
