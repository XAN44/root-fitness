#!/usr/bin/env bun

import { spawn } from "bun";
import * as path from "path";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function execCommand(
  cmd: string[],
  cwd: string,
  showOutput = true
): Promise<{ success: boolean; output: string }> {
  try {
    const proc = spawn({
      cmd,
      cwd,
      stdio: showOutput
        ? ["pipe", "inherit", "inherit"]
        : ["pipe", "pipe", "pipe"],
    });

    const exitCode = await proc.exited;
    return {
      success: exitCode === 0,
      output: "",
    };
  } catch (error) {
    return {
      success: false,
      output: String(error),
    };
  }
}

async function getGitStatus(repoPath: string): Promise<string[]> {
  try {
    const proc = spawn({
      cmd: ["git", "status", "--porcelain"],
      cwd: repoPath,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const output = await new Response(proc.stdout).text();
    await proc.exited;

    return output
      .trim()
      .split("\n")
      .filter((line) => line.length > 0);
  } catch {
    return [];
  }
}

async function getCurrentBranch(repoPath: string): Promise<string> {
  try {
    const proc = spawn({
      cmd: ["git", "branch", "--show-current"],
      cwd: repoPath,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const output = await new Response(proc.stdout).text();
    await proc.exited;

    return output.trim() || "main";
  } catch {
    return "main";
  }
}

async function pushSubmodule(
  name: string,
  repoPath: string,
  commitMessage?: string
): Promise<boolean> {
  console.log(`\n📤 Pushing ${name} (Submodule)...`);

  // Check for changes
  const changes = await getGitStatus(repoPath);

  if (changes.length === 0) {
    console.log(`ℹ️  No changes to push in ${name}`);
    return false; // Return false to indicate no changes were made
  }

  // Show changed files
  console.log(`📝 Changed files in ${name}:`);
  changes.forEach((line) => {
    console.log(`   ${line}`);
  });

  // Get commit message if not provided
  let message = commitMessage;
  if (!message) {
    message = await question(
      `✍️  Commit message for ${name} (or press Enter to skip): `
    );

    if (!message) {
      console.log(`⏭️  Skipped ${name}`);
      return false;
    }
  }

  // Git add
  const addResult = await execCommand(["git", "add", "."], repoPath, false);
  if (!addResult.success) {
    console.error(`❌ Failed to stage changes in ${name}`);
    return false;
  }

  // Git commit
  const commitResult = await execCommand(
    ["git", "commit", "-m", message],
    repoPath,
    false
  );
  if (!commitResult.success) {
    console.error(`❌ Failed to commit in ${name}`);
    return false;
  }
  console.log(`✅ Committed: "${message}"`);

  // Get current branch
  const branch = await getCurrentBranch(repoPath);

  // Git push
  const pushResult = await execCommand(
    ["git", "push", "-u", "origin", branch],
    repoPath,
    true
  );
  if (!pushResult.success) {
    console.error(`❌ Failed to push ${name}`);
    return false;
  }

  console.log(`✅ Pushed ${name} successfully!`);
  return true; // Return true to indicate changes were pushed
}

async function updateSubmoduleReferences(
  rootPath: string,
  commitMessage: string
): Promise<boolean> {
  console.log(`\n🔄 Updating submodule references in root...`);

  // Add submodule changes (this captures the new commit hashes)
  const addResult = await execCommand(
    ["git", "add", "back-end/app", "front-end/my-app"],
    rootPath,
    false
  );

  if (!addResult.success) {
    console.log(`ℹ️  No submodule references to update`);
    return false;
  }

  // Check if there are changes to commit
  const changes = await getGitStatus(rootPath);
  const hasSubmoduleChanges = changes.some(
    (line) => line.includes("back-end/app") || line.includes("front-end/my-app")
  );

  if (!hasSubmoduleChanges) {
    console.log(`ℹ️  Submodule references already up to date`);
    return false;
  }

  // Show what's being updated
  console.log(`📝 Updating submodule pointers:`);
  changes.forEach((line) => {
    if (line.includes("back-end/app") || line.includes("front-end/my-app")) {
      console.log(`   ${line}`);
    }
  });

  // Commit submodule updates
  const commitResult = await execCommand(
    ["git", "commit", "-m", `Update submodules: ${commitMessage}`],
    rootPath,
    false
  );

  if (!commitResult.success) {
    console.log(`ℹ️  No new submodule commits to record`);
    return false;
  }

  console.log(`✅ Submodule references committed in root`);

  // Get current branch
  const branch = await getCurrentBranch(rootPath);

  // Push the submodule reference updates
  console.log(`📤 Pushing submodule reference updates...`);
  const pushResult = await execCommand(
    ["git", "push", "-u", "origin", branch],
    rootPath,
    true
  );

  if (!pushResult.success) {
    console.error(`❌ Failed to push submodule references`);
    return false;
  }

  console.log(`✅ Submodule references pushed to remote`);
  return true;
}

async function pushRepository(
  name: string,
  repoPath: string,
  commitMessage?: string,
  skipIfNoChanges: boolean = false
): Promise<boolean> {
  console.log(`\n📤 Pushing ${name}...`);

  // Check for changes
  const changes = await getGitStatus(repoPath);

  if (changes.length === 0) {
    console.log(`ℹ️  No changes to push in ${name}`);
    return skipIfNoChanges ? false : true;
  }

  // Show changed files
  console.log(`📝 Changed files in ${name}:`);
  changes.forEach((line) => {
    console.log(`   ${line}`);
  });

  // Get commit message if not provided
  let message = commitMessage;
  if (!message) {
    message = await question(
      `✍️  Commit message for ${name} (or press Enter to skip): `
    );

    if (!message) {
      console.log(`⏭️  Skipped ${name}`);
      return true;
    }
  }

  // Git add
  const addResult = await execCommand(["git", "add", "."], repoPath, false);
  if (!addResult.success) {
    console.error(`❌ Failed to stage changes in ${name}`);
    return false;
  }

  // Git commit
  const commitResult = await execCommand(
    ["git", "commit", "-m", message],
    repoPath,
    false
  );
  if (!commitResult.success) {
    console.error(`❌ Failed to commit in ${name}`);
    return false;
  }
  console.log(`✅ Committed: "${message}"`);

  // Get current branch
  const branch = await getCurrentBranch(repoPath);

  // Git push
  const pushResult = await execCommand(
    ["git", "push", "-u", "origin", branch],
    repoPath,
    true
  );
  if (!pushResult.success) {
    console.error(`❌ Failed to push ${name}`);
    return false;
  }

  console.log(`✅ Pushed ${name} successfully!`);
  return true;
}

async function main() {
  console.log("🚀 Git Push Manager - Multi-Repository Helper\n");

  const rootPath = process.cwd();
  const backendPath = path.join(rootPath, "back-end/app");
  const frontendPath = path.join(rootPath, "front-end/my-app");

  // Show menu
  console.log("What would you like to push?");
  console.log("1. Frontend only");
  console.log("2. Backend only");
  console.log("3. Root only");
  console.log("4. All (submodules + root)");
  console.log("5. Custom selection");
  console.log("6. Exit");

  const choice = await question("Choose (1-6): ");

  let success = true;
  let sharedMessage: string | undefined;

  switch (choice) {
    case "1":
      // Frontend only
      const frontendPushed = await pushSubmodule("Frontend", frontendPath);
      if (frontendPushed) {
        // Update and push submodule reference in root
        success = await updateSubmoduleReferences(rootPath, "Frontend changes");
      }
      break;

    case "2":
      // Backend only
      const backendPushed = await pushSubmodule("Backend", backendPath);
      if (backendPushed) {
        // Update and push submodule reference in root
        success = await updateSubmoduleReferences(rootPath, "Backend changes");
      }
      break;

    case "3":
      // Root only
      success = await pushRepository("Root", rootPath);
      break;

    case "4":
      // All repositories
      console.log(
        "📦 Pushing all repositories (Submodules first, then Root)..."
      );

      const useSharedMessage = await question(
        "\n💬 Use same commit message for all? (yes/no) [default: no]: "
      );

      if (useSharedMessage.toLowerCase() === "yes") {
        sharedMessage = await question("✍️  Enter commit message: ");
      }

      // Push submodules first
      const frontendSuccess = await pushSubmodule(
        "Frontend",
        frontendPath,
        sharedMessage
      );
      const backendSuccess = await pushSubmodule(
        "Backend",
        backendPath,
        sharedMessage
      );

      // Update and push submodule references in root if any submodule was pushed
      if (frontendSuccess || backendSuccess) {
        await updateSubmoduleReferences(
          rootPath,
          sharedMessage || "Update submodules"
        );
      }

      // Push root repository if it has its own changes (not submodule changes)
      const rootSuccess = await pushRepository("Root", rootPath, sharedMessage);

      success = rootSuccess;

      if (success) {
        console.log("\n✅ All repositories pushed successfully!");
      } else {
        console.log("\n⚠️  Some repositories failed to push");
      }
      break;

    case "5":
      // Custom selection
      console.log("\n📦 Custom Selection");

      const pushFrontend = await question("Push Frontend? (yes/no): ");
      const pushBackend = await question("Push Backend? (yes/no): ");
      const pushRoot = await question("Push Root? (yes/no): ");

      const useSharedMsg = await question(
        "\n💬 Use same commit message? (yes/no) [default: no]: "
      );

      if (useSharedMsg.toLowerCase() === "yes") {
        sharedMessage = await question("✍️  Enter commit message: ");
      }

      let hasSubmoduleChanges = false;

      if (pushFrontend.toLowerCase() === "yes") {
        const result = await pushSubmodule(
          "Frontend",
          frontendPath,
          sharedMessage
        );
        hasSubmoduleChanges = hasSubmoduleChanges || result;
      }

      if (pushBackend.toLowerCase() === "yes") {
        const result = await pushSubmodule(
          "Backend",
          backendPath,
          sharedMessage
        );
        hasSubmoduleChanges = hasSubmoduleChanges || result;
      }

      // Update and push submodule references if any submodule was pushed
      if (hasSubmoduleChanges) {
        await updateSubmoduleReferences(
          rootPath,
          sharedMessage || "Update submodules"
        );
      }

      if (pushRoot.toLowerCase() === "yes") {
        await pushRepository("Root", rootPath, sharedMessage);
      }

      console.log("\n✅ Selected repositories processed!");
      break;

    case "6":
      console.log("👋 Goodbye!");
      rl.close();
      return;

    default:
      console.log("❌ Invalid choice");
      success = false;
  }

  rl.close();

  if (!success) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
