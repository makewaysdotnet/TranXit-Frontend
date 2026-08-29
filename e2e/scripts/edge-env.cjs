const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const { randomBytes } = require("node:crypto");
const { execFileSync } = require("node:child_process");

const frontendRoot = path.resolve(__dirname, "../..");
const backendRoot = path.resolve(frontendRoot, "../TranXIT-Backend/TranXit");
const productionCaddyfile = path.join(backendRoot, "ops/Caddyfile");
// Already excluded by both .gitignore and .dockerignore. Never enter a build layer.
const runtimeRoot = path.join(frontendRoot, "e2e/.auth/edge-runtime");
const activeFile = path.join(runtimeRoot, "active.json");
const hosts = {
  app: "tranxit-edge.localhost",
  secondary: "tranxit-edge-staging.localhost",
  mail: "tranxit-edge-mail.localhost",
};
const composeFiles = [
  "docker-compose.yml",
  "docker-compose.prod.yml",
  "docker-compose.staging.yml",
  "docker-compose.edge-test.yml",
].map((file) => path.join(backendRoot, file));

function requireInvariant(condition, message) {
  if (!condition) throw new Error(message);
}

function assertProjectName(value) {
  requireInvariant(
    typeof value === "string" && /^tranxit-edge-test-[a-f0-9]{16}$/.test(value),
    "Refusing a project outside the generated tranxit-edge-test-* namespace.",
  );
  return value;
}

function assertPort(value) {
  const port = Number(value);
  requireInvariant(
    Number.isInteger(port) && port >= 1024 && port <= 65535 &&
      ![3000, 3100, 8082, 18088, 18188].includes(port),
    "Choose an unprivileged edge HTTPS port distinct from the shared application/test ports.",
  );
  return port;
}

function runtimePaths(runtime) {
  const dir = path.join(runtimeRoot, assertProjectName(runtime.projectName));
  return {
    dir,
    state: path.join(dir, "state.json"),
    envFile: path.join(dir, "empty.env"),
    admission: path.join(dir, "admission"),
    gate: path.join(dir, "admission/open"),
    ca: path.join(dir, "caddy-root.crt"),
    credibilityCaddy: path.join(dir, "Caddyfile.credibility"),
    logs: path.join(dir, "logs"),
    results: path.join(dir, "results"),
  };
}

function origins(runtime) {
  const port = assertPort(runtime.httpsPort);
  return {
    app: `https://${hosts.app}:${port}`,
    secondary: `https://${hosts.secondary}:${port}`,
    mail: `https://${hosts.mail}:${port}`,
  };
}

function createRuntime(httpsPort = 18443) {
  const id = randomBytes(8).toString("hex");
  const secret = () => `E9!${randomBytes(24).toString("hex")}`;
  return {
    version: 2,
    projectName: `tranxit-edge-test-${id}`,
    httpsPort: assertPort(httpsPort),
    caddyFile: productionCaddyfile,
    rateLimitEvents: 100,
    rateLimitWindow: "10s",
    credibilityMutation: null,
    createdAt: new Date().toISOString(),
    phase: "created",
    dockerContext: "",
    secrets: {
      sqlPassword: secret(),
      jwtSecret: randomBytes(48).toString("base64url"),
      rabbitUser: `edge_${id}`,
      rabbitPassword: secret(),
      mailUser: `inbox_${id}`,
      mailPassword: secret(),
      // Replaced using the real Caddy CLI, via stdin, before any service starts.
      mailHash: randomBytes(32).toString("hex"),
      actorPassword: secret(),
    },
  };
}

// Do not inherit production .env, API URLs, Docker hosts, TLS overrides or NODE_OPTIONS.
function isolatedEnv(extra = {}) {
  const allowed = /^(path|pathext|systemroot|systemdrive|windir|comspec|home|userprofile|appdata|localappdata|temp|tmp|tmpdir|programfiles(?:\(x86\))?|programdata|ci|term|lang|lc_all|playwright_browsers_path)$/i;
  return {
    ...Object.fromEntries(Object.entries(process.env).filter(([key]) => allowed.test(key))),
    COMPOSE_DISABLE_ENV_FILE: "1",
    COMPOSE_PROFILES: "",
    NEXT_TELEMETRY_DISABLED: "1",
    NODE_ENV: /** @type {"test"} */ ("test"),
    ...extra,
  };
}

function composeEnv(runtime) {
  const urls = origins(runtime);
  const files = runtimePaths(runtime);
  const secrets = runtime.secrets;
  return isolatedEnv({
    TRANXIT_EDGE_PROJECT: runtime.projectName,
    TRANXIT_EDGE_HTTPS_PORT: String(runtime.httpsPort),
    TRANXIT_IMAGE_TAG: runtime.projectName,
    TRANXIT_FRONTEND_BUILD_CONTEXT: frontendRoot,
    TRANXIT_ADMISSION_DIR: files.admission,
    TRANXIT_EDGE_CADDYFILE: runtime.caddyFile,
    DOMAIN: hosts.app,
    STAGING_DOMAIN: hosts.secondary,
    MAILPIT_DOMAIN: hosts.mail,
    CADDY_ACME_EMAIL: "edge-ca@example.test",
    PUBLIC_APP_URL: urls.app,
    STAGING_APP_URL: urls.secondary,
    NEXT_PUBLIC_TRANXIT_API_URL: urls.app,
    TRANXIT_INTERNAL_API_URL: "http://ocelotapigw:8080",
    TRANXIT_DEPLOY_ENV: "production",
    TRANXIT_ENABLE_DEMO_AUTH: "false",
    TRANXIT_ENABLE_DEMO_DATA: "false",
    TRANXIT_E2E_EXPOSE_DEV_CODE: "false",
    SQL_SA_PASSWORD: secrets.sqlPassword,
    TRANXIT_SA_PASSWORD: secrets.sqlPassword,
    JWT_SECRET: secrets.jwtSecret,
    TRANXIT_JWT_SECRET: secrets.jwtSecret,
    JWT_ISSUER: `${runtime.projectName}.AccountService`,
    JWT_AUDIENCE: `${runtime.projectName}.Browser`,
    JWT_EXPIRY_MINUTES: "60",
    JWT_REFRESH_EXPIRY_DAYS: "1",
    RABBITMQ_USER: secrets.rabbitUser,
    TRANXIT_RABBITMQ_USERNAME: secrets.rabbitUser,
    RABBITMQ_PASSWORD: secrets.rabbitPassword,
    TRANXIT_RABBITMQ_PASSWORD: secrets.rabbitPassword,
    ADMIN_EMAIL: `bootstrap-${runtime.projectName}@example.test`,
    SMTP_HOST: "mailpit",
    SMTP_PORT: "1025",
    SMTP_USER: secrets.mailUser,
    SMTP_PASSWORD: secrets.mailPassword,
    MAIL_SENDER_NAME: "TranXIT edge fixture",
    MAIL_FROM: "edge-mail@example.test",
    MAILPIT_BASIC_AUTH_USER: secrets.mailUser,
    MAILPIT_BASIC_AUTH_HASH: secrets.mailHash,
    AUTH_RATE_LIMIT_EVENTS: String(runtime.rateLimitEvents),
    AUTH_RATE_LIMIT_WINDOW: runtime.rateLimitWindow,
  });
}

function assertLocalDockerHost(host) {
  requireInvariant(
    typeof host === "string" &&
      (host.startsWith("unix:///") || /^npipe:\/\/\/+\.\/pipe\//i.test(host)),
    "Edge tests require a local Unix socket or Windows named-pipe Docker context, never TCP/SSH.",
  );
}

function assertOwnedPath(target) {
  const relative = path.relative(frontendRoot, target);
  requireInvariant(relative && !relative.startsWith("..") && !path.isAbsolute(relative), "Unsafe edge runtime path.");
  let current = frontendRoot;
  for (const part of relative.split(path.sep)) {
    current = path.join(current, part);
    if (fs.existsSync(current)) {
      requireInvariant(!fs.lstatSync(current).isSymbolicLink(), "Edge runtime paths must not be symlinks or junctions.");
    }
  }
}

function protectDirectory(dir) {
  assertOwnedPath(dir);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  if (process.platform !== "win32") {
    fs.chmodSync(dir, 0o700);
    return;
  }
  // POSIX mode bits do not restrict Windows ACLs. Fail before writing any secret.
  const script = [
    "$ErrorActionPreference = 'Stop'",
    "$sid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User",
    "$acl = [System.Security.AccessControl.DirectorySecurity]::new()",
    "$acl.SetAccessRuleProtection($true, $false)",
    "$acl.AddAccessRule([System.Security.AccessControl.FileSystemAccessRule]::new($sid, 'FullControl', 'ContainerInherit, ObjectInherit', 'None', 'Allow'))",
    "$system = [System.Security.Principal.SecurityIdentifier]::new('S-1-5-18')",
    "$acl.AddAccessRule([System.Security.AccessControl.FileSystemAccessRule]::new($system, 'FullControl', 'ContainerInherit, ObjectInherit', 'None', 'Allow'))",
    "[System.IO.Directory]::SetAccessControl($env:TRANXIT_EDGE_ACL_DIR, $acl)",
  ].join("; ");
  try {
    execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
      env: isolatedEnv({ TRANXIT_EDGE_ACL_DIR: dir }),
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const detail = String(error.stderr || "PowerShell ACL operation failed.").trim();
    throw new Error(`Cannot restrict edge runtime ACLs; no secret state was written. ${detail}`);
  }
}

function prepareRuntime(runtime, activate = false) {
  const files = runtimePaths(runtime);
  assertOwnedPath(activeFile);
  if (activate) requireInvariant(!fs.existsSync(activeFile), "An edge fixture already exists. Run e2e:edge:down before starting another.");
  protectDirectory(runtimeRoot);
  protectDirectory(files.dir);
  for (const dir of [files.admission, files.logs, files.results]) {
    assertOwnedPath(dir);
    fs.mkdirSync(dir, { mode: 0o700 });
  }
  fs.writeFileSync(files.envFile, "", { mode: 0o600, flag: "wx" });
  saveRuntime(runtime);
  if (activate) {
    fs.writeFileSync(activeFile, JSON.stringify({ projectName: runtime.projectName }), { mode: 0o600, flag: "wx" });
  }
  return files;
}

function saveRuntime(runtime) {
  const files = runtimePaths(runtime);
  assertOwnedPath(files.state);
  const temporary = `${files.state}.${randomBytes(4).toString("hex")}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(runtime), { mode: 0o600, flag: "wx" });
  fs.renameSync(temporary, files.state);
}

function loadRuntime() {
  assertOwnedPath(activeFile);
  requireInvariant(fs.existsSync(activeFile), "No edge fixture exists. Run npm run e2e:edge:up first.");
  const active = JSON.parse(fs.readFileSync(activeFile, "utf8"));
  const files = runtimePaths(active);
  assertOwnedPath(files.state);
  const runtime = JSON.parse(fs.readFileSync(files.state, "utf8"));
  requireInvariant(runtime.version === 2 && runtime.projectName === active.projectName, "Invalid edge fixture state.");
  assertPort(runtime.httpsPort);
  const productionSource = path.resolve(runtime.caddyFile) === path.resolve(productionCaddyfile);
  const credibilitySource = path.resolve(runtime.caddyFile) === path.resolve(files.credibilityCaddy) &&
    runtime.credibilityMutation === "strip-admission-imports";
  requireInvariant(productionSource || credibilitySource, "Invalid edge Caddyfile source.");
  requireInvariant(runtime.rateLimitEvents === 100 && runtime.rateLimitWindow === "10s", "Invalid edge rate-limit contract.");
  for (const key of Object.keys(createRuntime().secrets)) {
    requireInvariant(typeof runtime.secrets?.[key] === "string" && runtime.secrets[key].length >= 12, "Incomplete edge fixture credentials.");
  }
  return runtime;
}

function setAdmission(runtime, open) {
  const files = runtimePaths(runtime);
  assertOwnedPath(files.gate);
  if (fs.existsSync(files.gate)) {
    requireInvariant(fs.lstatSync(files.gate).isFile(), "Admission marker must be a regular fixture-local file.");
    if (!open) fs.unlinkSync(files.gate);
  } else if (open) {
    fs.writeFileSync(files.gate, "edge-test admission\n", { flag: "wx", mode: 0o600 });
  }
}

function retireRuntime(runtime, removeDirectory = false) {
  const files = runtimePaths(runtime);
  assertOwnedPath(files.dir);
  assertOwnedPath(activeFile);
  if (fs.existsSync(activeFile)) {
    const active = JSON.parse(fs.readFileSync(activeFile, "utf8"));
    if (active.projectName === runtime.projectName) fs.unlinkSync(activeFile);
  }
  if (removeDirectory) {
    requireInvariant(path.dirname(files.dir) === runtimeRoot, "Refusing recursive cleanup outside this edge fixture.");
    fs.rmSync(files.dir, { recursive: true, force: true });
  } else {
    assertOwnedPath(files.state);
    fs.rmSync(files.state, { force: true });
  }
}

function redact(text, runtime) {
  let safe = String(text);
  const secrets = Object.values(runtime?.secrets ?? {}).filter((value) => typeof value === "string" && value.length > 0);
  if (runtime?.secrets?.mailUser && runtime.secrets.mailPassword) {
    secrets.push(Buffer.from(`${runtime.secrets.mailUser}:${runtime.secrets.mailPassword}`).toString("base64"));
  }
  for (const secret of secrets.sort((a, b) => b.length - a.length)) {
    safe = safe.split(secret).join("[redacted]");
  }
  return safe
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[redacted-jwt]")
    .replace(/\b\d+\.[A-Za-z0-9_-]{32,}\b/g, "[redacted-refresh]")
    .replace(/\$2[aby]\$\d+\$[./A-Za-z0-9]{53}/g, "[redacted-hash]")
    .replace(/(authorization["\s:=\[\]]+)(?:Bearer|Basic)\s+[^\s",\]]+/gi, "$1[redacted]")
    .replace(/\bedge-(?:customer|courier)-[a-f0-9]+@example\.test\b/g, "[fixture-email]")
    .replace(/\b\d{6}\b/g, "[redacted-possible-otp]");
}

function assertComposeModel(model, runtime) {
  const names = ["accountservice", "caddy", "courierjobservice", "frontend", "mailpit", "ocelotapigw", "rabbitmq", "sqlserver"];
  requireInvariant(model.name === runtime.projectName, "Compose project did not match the generated fixture.");
  requireInvariant(JSON.stringify(Object.keys(model.services ?? {}).sort()) === JSON.stringify(names), "Unexpected services in edge fixture.");
  const files = runtimePaths(runtime);
  for (const group of [model.volumes, model.networks]) {
    for (const resource of Object.values(group ?? {})) {
      requireInvariant(resource.name?.startsWith(`${runtime.projectName}-`) && !resource.external && !resource.driver_opts, "Refusing non-fixture volumes or networks.");
    }
  }
  requireInvariant(model.networks?.backend?.internal === true && model.networks?.egress?.internal === true, "Edge data and SMTP networks must be internal.");
  requireInvariant(!Object.keys(model.secrets ?? {}).length && !Object.keys(model.configs ?? {}).length, "Unexpected external secrets/configs in edge fixture.");
  for (const [name, service] of Object.entries(model.services)) {
    requireInvariant(!service.container_name && !service.network_mode && !service.privileged && !service.env_file, `Unsafe service configuration: ${name}.`);
    requireInvariant(service.restart === "no" && service.labels?.["io.tranxit.edge-test"] === runtime.projectName, `Missing fixture ownership: ${name}.`);
    if (name !== "caddy") requireInvariant(!service.ports?.length, `Only Caddy HTTPS may be published: ${name}.`);
    for (const mount of service.volumes ?? []) {
      if (mount.type === "volume") {
        requireInvariant(Boolean(model.volumes?.[mount.source]), "Unknown volume mount.");
      } else {
        requireInvariant(name === "caddy" && mount.type === "bind" && mount.read_only === true, "Unexpected host bind mount.");
        const expected = mount.target === "/etc/caddy/Caddyfile"
          ? runtime.caddyFile
          : mount.target === "/run/tranxit/admission" ? files.admission : "";
        requireInvariant(expected && path.resolve(mount.source) === path.resolve(expected), "Caddy must use the selected production config bytes and the fixture-local admission directory.");
      }
    }
  }
  const caddy = model.services.caddy;
  const ports = caddy.ports ?? [];
  requireInvariant(ports.length === 1 && ports[0].host_ip === "127.0.0.1" && ports[0].target === 443 && String(ports[0].published) === String(runtime.httpsPort) && ports[0].protocol === "tcp", "Unexpected public port; private smoke must never be published.");
  for (const target of ["/etc/caddy/Caddyfile", "/run/tranxit/admission"]) {
    requireInvariant(caddy.volumes?.some((mount) => mount.target === target), "Missing real Caddy config or admission mount.");
  }
  for (const name of ["accountservice", "courierjobservice", "ocelotapigw"]) {
    const service = model.services[name];
    requireInvariant(service.environment?.ASPNETCORE_ENVIRONMENT === "Production" && service.environment?.Jwt__RequireHttpsMetadata === "true", `${name} must run in Production with production JWT validation.`);
    requireInvariant(service.image.startsWith(`${runtime.projectName}:`) && path.resolve(service.build?.context ?? "") === backendRoot, `Wrong production build for ${name}.`);
  }
  for (const name of ["accountservice", "courierjobservice"]) {
    const env = model.services[name].environment;
    requireInvariant(env.TestInfrastructure__UseInMemoryBus === "false" && env.RabbitMQ__HostName === "rabbitmq" && env.MailSettings__DisableSending === "false" && env.MailSettings__Server === "mailpit" && String(env.MailSettings__Port) === "1025", "Real RabbitMQ and Mailpit SMTP are required.");
  }
  const frontend = model.services.frontend;
  requireInvariant(frontend.image === `${runtime.projectName}:frontend` && path.resolve(frontend.build?.context ?? "") === frontendRoot && frontend.build?.dockerfile === "Dockerfile", "Use the actual production Next Dockerfile.");
  requireInvariant(caddy.image === `${runtime.projectName}:caddy` && caddy.build?.dockerfile === "ops/caddy/Dockerfile", "Use the actual Caddy build, including the rate limiter.");
  for (const [key, value] of Object.entries({ NODE_ENV: "production", TRANXIT_DEPLOY_ENV: "production", TRANXIT_ENABLE_DEMO_AUTH: "false", TRANXIT_ENABLE_DEMO_DATA: "false", TRANXIT_E2E_EXPOSE_DEV_CODE: "false", TRANXIT_API_URL: "http://ocelotapigw:8080" })) {
    requireInvariant(frontend.environment?.[key] === value, `Incorrect production frontend setting: ${key}.`);
  }
}

// Trust only this fixture's exported Caddy CA; never disable Node/application TLS.
/** @returns {Promise<{status: number, body: string}>} */
function localHttps(runtime, origin, pathname, headers = {}, options = {}) {
  requireInvariant(Object.values(origins(runtime)).includes(origin), "Only fixture-local origins are permitted.");
  requireInvariant(pathname.startsWith("/") && !pathname.startsWith("//"), "Use an origin-relative fixture path.");
  const url = new URL(pathname, origin);
  requireInvariant(url.origin === origin, "Refusing a cross-origin fixture request.");
  const caPath = runtimePaths(runtime).ca;
  assertOwnedPath(caPath);
  return new Promise((resolve, reject) => {
    const request = https.request(url, {
      ca: fs.readFileSync(caPath),
      headers,
      method: options.method || "GET",
      family: 4,
      // .localhost is reserved; do not depend on OS DNS or edit the hosts file.
      lookup: (_hostname, _options, callback) => callback(null, "127.0.0.1", 4),
      timeout: 10_000,
    }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
        if (body.length > 2_000_000) request.destroy(new Error("Fixture response exceeded the size limit."));
      });
      response.on("end", () => resolve({ status: response.statusCode ?? 0, body, headers: response.headers }));
      response.on("error", () => reject(new Error("Local HTTPS response failed.")));
    });
    request.on("timeout", () => request.destroy(new Error("Local HTTPS request timed out.")));
    request.on("error", () => reject(new Error("Local HTTPS request failed; check the fixture and its Caddy CA.")));
    if (options.body !== undefined) request.write(String(options.body));
    request.end();
  });
}

module.exports = {
  frontendRoot, backendRoot, productionCaddyfile, runtimeRoot, activeFile, hosts, composeFiles,
  requireInvariant, assertProjectName, assertPort, runtimePaths, origins,
  createRuntime, isolatedEnv, composeEnv, assertLocalDockerHost, prepareRuntime,
  saveRuntime, loadRuntime, setAdmission, retireRuntime, redact, assertComposeModel, localHttps,
};
