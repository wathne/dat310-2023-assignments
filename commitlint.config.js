const Configuration = {
  extends: ['@commitlint/config-conventional'],
  ignores: [(commit) => commit.includes('WIP')],
};

module.exports = Configuration;
