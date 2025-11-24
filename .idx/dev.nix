# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.firebase-tools
  ];
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "google.gemini-cli-vscode-ide-companion"
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
      "bradlc.vscode-tailwindcss"
    ];
    workspace = {
      onStart = {
        # The command to run when the workspace starts
        start-server = "npm run dev";
      };
    };
    # Enable previews
    previews = {
      enable = true;
      previews = {
        # The command to run to start the server
        # The $PORT environment variable will be injected by IDX.
        web = {
          command = [
            "npm"
            "run"
            "dev"
            "--"
            "--port"
            "$PORT"
          ];
          manager = "web";
        };
      };
    };
  };
}
