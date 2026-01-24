{ pkgs, lib, ... }:

{
  packages = with pkgs; [
    git
  ];

  languages.javascript = {
    enable = true;
    bun = {
      enable = true;
      install.enable = true;
    };
  };

  languages.typescript.enable = true;

  pre-commit.hooks = {
    commitizen.enable = true;
    check-merge-conflicts.enable = true;
    check-added-large-files.enable = true;
  };

  scripts = {
    build.exec = "bun run build";
    test.exec = "bun test";
    lint.exec = "bun run build:types";
  };
}
