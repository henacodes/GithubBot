const fs = require("fs");

const fetchRepo = async (username, repo, octokit) => {
  try {
    const response = await octokit.request(
      `GET /repos/${username}/${repo}/zipball/{ref}`,
      {
        owner: username,
        repo: repo,
        ref: "",
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const showUser = (ctx, name, username, bio, img, followers, following) => {
  ctx.telegram.sendPhoto(ctx.chat.id, img, {
    caption: `${
      name + ` (@${username} ) `
    }\n${bio}\n${followers} followers\n${following} following

    `,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Repos",
            callback_data: `repos ${username} `,
          },
        ],
      ],
    },
  });
};

const sendRepos = (ctx, repos, username) => {
  ctx.telegram.sendMessage(
    ctx.chat.id,
    `Here the last 10 repos of @${username}`,
    {
      reply_markup: {
        inline_keyboard: [
          ...repos.map((repo) => [
            { text: repo.name, callback_data: `repo ${username} ${repo.name}` },
          ]),
        ],
      },
    }
  );
};

module.exports = {
  fetchRepo,
  showUser,
  sendRepos,
};
