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

module.exports = {
  fetchRepo,
};
