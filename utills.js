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
("https://codeload.github.com/henacodes/DaaguChat/legacy.zip/refs/heads/master");
("https://codeload.github.com/henacodes/DaaguChat/legacy.zip/ref");

const sendFile = async (ctx, fileBuffer, owner, repo) => {
  try {
    ctx.telegram
      .sendDocument(ctx.chat.id, {
        source: fileBuffer,
        filename: `${owner}-${repo}.zip`,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((e) => {
        ctx.reply("Repo Size too Big:(");
      });
  } catch (e) {
    ctx.reply("Repo Size too Big:(");
  }
};

module.exports = {
  fetchRepo,
  sendFile,
};
