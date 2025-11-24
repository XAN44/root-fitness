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
): Promise<{ success: boolean; output: string; exitCode: number }> {
  try {
    const proc = spawn({
      cmd,
      cwd,
      stdio: showOutput
        ? ["pipe", "inherit", "inherit"]
        : ["pipe", "pipe", "pipe"],
    });

    let output = "";
    if (!showOutput && proc.stdout) {
      output = await new Response(proc.stdout).text();
    }

    const exitCode = await proc.exited;
    return {
      success: exitCode === 0,
      output: output.trim(),
      exitCode,
    };
  } catch (error) {
    return {
      success: false,
      output: String(error),
      exitCode: -1,
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

async function isSubmodule(repoPath: string): Promise<boolean> {
  try {
    const gitDir = path.join(repoPath, ".git");
    const proc = spawn({
      cmd: ["test", "-f", gitDir],
      stdio: ["pipe", "pipe", "pipe"],
    });
    const exitCode = await proc.exited;
    return exitCode === 0; // .git is a file in submodules, not a directory
  } catch {
    return false;
  }
}

async function pushRepository(
  name: string,
  repoPath: string,
  commitMessage?: string,
  isSubmodule: boolean = false
): Promise<boolean> {
  console.log(`\n📤 Pushing ${name}...`);

  // Check for changes
  const changes = await getGitStatus(repoPath);

  if (changes.length === 0) {
    console.log(`ℹ️  No changes to push in ${name}`);
    return true;
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
    ["git", "push", "origin", branch],
    repoPath,
    true
  );

  // Check if push was successful or if it's already up-to-date
  if (pushResult.success || pushResult.exitCode === 0) {
    console.log(`✅ Pushed ${name} successfully!`);
    return true;
  } else {
    console.error(`❌ Failed to push ${name}`);
    return false;
  }
}

async function updateSubmoduleReferences(
  rootPath: string,
  message: string
): Promise<boolean> {
  console.log("\n🔄 Updating submodule references in root...");

  // Check if there are submodule changes
  const status = await getGitStatus(rootPath);
  const hasSubmoduleChanges = status.some(
    (line) => line.includes("front-end/my-app") || line.includes("back-end/app")
  );

  if (!hasSubmoduleChanges) {
    console.log("ℹ️  No submodule reference updates needed");
    return true;
  }

  // Stage submodule changes
  const addResult = await execCommand(
    ["git", "add", "front-end/my-app", "back-end/app"],
    rootPath,
    false
  );

  if (!addResult.success) {
    console.error("❌ Failed to stage submodule references");
    return false;
  }

  // Commit
  const commitResult = await execCommand(
    ["git", "commit", "-m", `Update submodules: ${message}`],
    rootPath,
    false
  );

  if (!commitResult.success) {
    console.log("ℹ️  No new submodule references to commit");
    return true;
  }

  console.log("✅ Submodule references updated");
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
      success = await pushRepository("Frontend", frontendPath, undefined, true);
      break;

    case "2":
      // Backend only
      success = await pushRepository("Backend", backendPath, undefined, true);
      break;

    case "3":
      // Root only (without updating submodules)
      success = await pushRepository("Root", rootPath);
      if (success) {
        const branch = await getCurrentBranch(rootPath);
        await execCommand(["git", "push", "origin", branch], rootPath, true);
      }
      break;

    case "4":
      // All repositories - CORRECT ORDER
      console.log("📦 Pushing all repositories...");
      console.log("⚠️  Important: Submodules will be pushed BEFORE root\n");

      const useSharedMessage = await question(
        "💬 Use same commit message for all? (yes/no) [default: no]: "
      );

      if (useSharedMessage.toLowerCase() === "yes") {
        sharedMessage = await question("✍️  Enter commit message: ");
      }

      // ✨ STEP 1: Push submodules FIRST
      console.log("\n━━━ STEP 1: Pushing Submodules ━━━");

      const frontendSuccess = await pushRepository(
        "Frontend",
        frontendPath,
        sharedMessage,
        true
      );

      const backendSuccess = await pushRepository(
        "Backend",
        backendPath,
        sharedMessage,
        true
      );

      // ✨ STEP 2: Update submodule references in root
      console.log("\n━━━ STEP 2: Updating Root Repository ━━━");

      if (sharedMessage) {
        await updateSubmoduleReferences(rootPath, sharedMessage);
      }

      // ✨ STEP 3: Push root with any remaining changes
      const rootSuccess = await pushRepository("Root", rootPath, sharedMessage);

      // Final push for root
      if (rootSuccess) {
        const branch = await getCurrentBranch(rootPath);
        console.log("\n📤 Final push of root repository...");
        const finalPush = await execCommand(
          ["git", "push", "origin", branch],
          rootPath,
          true
        );
        success = finalPush.success && frontendSuccess && backendSuccess;
      } else {
        success = false;
      }

      if (success) {
        console.log("\n✅ All repositories pushed successfully!");
        console.log("💡 Submodules are now correctly referenced in root");
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

      // Push submodules first
      if (pushFrontend.toLowerCase() === "yes") {
        await pushRepository("Frontend", frontendPath, sharedMessage, true);
      }

      if (pushBackend.toLowerCase() === "yes") {
        await pushRepository("Backend", backendPath, sharedMessage, true);
      }

      // Update and push root last
      if (pushRoot.toLowerCase() === "yes") {
        if (sharedMessage) {
          await updateSubmoduleReferences(rootPath, sharedMessage);
        }
        await pushRepository("Root", rootPath, sharedMessage);
        const branch = await getCurrentBranch(rootPath);
        await execCommand(["git", "push", "origin", branch], rootPath, true);
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
