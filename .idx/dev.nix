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
  # Sets environment variables in the workspace
  env = {
    VITE_FIREBASE_API_KEY = "AIzaSyDSlB5z-NparOYnEPGWjY2KQ9MEEPuxDJY";
    VITE_FIREBASE_AUTH_DOMAIN = "ab-rename-46741219-ba4bc.firebaseapp.com";
    VITE_FIREBASE_PROJECT_ID = "ab-rename-46741219-ba4bc";
    VITE_FIREBASE_STORAGE_BUCKET = "ab-rename-46741219-ba4bc.firebasestorage.app";
    VITE_FIREBASE_MESSAGING_SENDER_ID = "600072389128";
    VITE_FIREBASE_APP_ID = "1:600072389128:web:648657cf4c2fbe2d94c7bd";
  };
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
