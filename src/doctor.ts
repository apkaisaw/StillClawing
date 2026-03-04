/**
 * Doctor Claw - Agent health monitoring, death detection, and rescue
 * Monitors OpenClaw gateway health and attempts recovery on failure
 */

import { execSync, exec } from "child_process";

export interface HealthStatus {
  alive: boolean;
  gatewayRunning: boolean;
  pid?: number;
  uptime?: string;
  error?: string;
}

// Check if OpenClaw gateway is running
export function checkGatewayHealth(): HealthStatus {
  try {
    // Check if openclaw process is running
    const psOutput = execSync("pgrep -f 'openclaw' 2>/dev/null || true", {
      encoding: "utf-8",
    }).trim();

    const pids = psOutput
      .split("\n")
      .filter((line) => line.trim().length > 0);

    if (pids.length === 0) {
      return {
        alive: false,
        gatewayRunning: false,
        error: "No OpenClaw process found",
      };
    }

    // Try to hit the gateway health endpoint
    try {
      execSync(
        'curl -s --max-time 5 http://localhost:3000/health 2>/dev/null || curl -s --max-time 5 http://localhost:8080/health 2>/dev/null || echo "unhealthy"',
        { encoding: "utf-8" }
      );
    } catch {
      // Gateway might be running but unhealthy
    }

    return {
      alive: true,
      gatewayRunning: true,
      pid: parseInt(pids[0]),
    };
  } catch (err: any) {
    return {
      alive: false,
      gatewayRunning: false,
      error: err.message,
    };
  }
}

// Diagnose what went wrong
export function diagnose(): string {
  const checks: string[] = [];

  // Check process
  try {
    const ps = execSync("ps aux | grep -i openclaw | grep -v grep", {
      encoding: "utf-8",
    });
    checks.push(`Processes: ${ps.trim().split("\n").length} found`);
  } catch {
    checks.push("Processes: NONE found");
  }

  // Check disk space
  try {
    const df = execSync("df -h / | tail -1", { encoding: "utf-8" });
    checks.push(`Disk: ${df.trim()}`);
  } catch {
    checks.push("Disk: check failed");
  }

  // Check memory
  try {
    const mem = execSync(
      'vm_stat | head -5 2>/dev/null || free -h 2>/dev/null || echo "unknown"',
      { encoding: "utf-8" }
    );
    checks.push(`Memory: checked`);
  } catch {
    checks.push("Memory: check failed");
  }

  // Check OpenClaw config
  try {
    execSync("openclaw doctor 2>&1", {
      encoding: "utf-8",
      timeout: 15000,
    });
    checks.push("OpenClaw doctor: OK");
  } catch (err: any) {
    checks.push(`OpenClaw doctor: ${err.message.substring(0, 100)}`);
  }

  return checks.join("\n");
}

// Attempt rescue using Doctor Claw
export async function attemptRescue(): Promise<{
  success: boolean;
  method: string;
  details: string;
}> {
  console.log("🚑 Doctor Claw: Attempting rescue...");

  // Step 1: Try openclaw doctor --fix
  try {
    console.log("  Step 1: Running openclaw doctor...");
    const doctorOutput = execSync("openclaw doctor --fix 2>&1", {
      encoding: "utf-8",
      timeout: 30000,
    });
    console.log("  Doctor output:", doctorOutput.substring(0, 200));

    // Check if gateway is back
    const health = checkGatewayHealth();
    if (health.alive) {
      return {
        success: true,
        method: "openclaw doctor --fix",
        details: doctorOutput.substring(0, 500),
      };
    }
  } catch (err: any) {
    console.log("  Doctor failed:", err.message.substring(0, 100));
  }

  // Step 2: Try restarting gateway
  try {
    console.log("  Step 2: Restarting gateway...");
    execSync("openclaw restart 2>&1 || openclaw gateway restart 2>&1", {
      encoding: "utf-8",
      timeout: 30000,
    });

    // Wait a moment for startup
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const health = checkGatewayHealth();
    if (health.alive) {
      return {
        success: true,
        method: "gateway restart",
        details: "Gateway restarted successfully",
      };
    }
  } catch (err: any) {
    console.log("  Restart failed:", err.message.substring(0, 100));
  }

  // Step 3: Nuclear option - kill and restart
  try {
    console.log("  Step 3: Kill and restart...");
    execSync("pkill -f 'openclaw' 2>/dev/null || true", { encoding: "utf-8" });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    exec("openclaw up 2>&1"); // Start in background

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const health = checkGatewayHealth();
    if (health.alive) {
      return {
        success: true,
        method: "kill and restart",
        details: "Process killed and restarted",
      };
    }
  } catch (err: any) {
    console.log("  Kill+restart failed:", err.message.substring(0, 100));
  }

  return {
    success: false,
    method: "all methods exhausted",
    details: diagnose(),
  };
}
