# Running the suite on Jenkins (Amazon EC2)

End-to-end guide for standing up a Jenkins server on an EC2 instance and
running this framework's [`Jenkinsfile`](../Jenkinsfile) on it.

The pipeline runs every build step inside the official
`mcr.microsoft.com/playwright` Docker container, so the EC2 host only needs
**Java + Jenkins + Docker + Git** — no Node, npm or browser installs on the
host, and no browser-dependency drift between builds.

---

## 1. Launch the EC2 instance

In the AWS console → EC2 → **Launch instance**:

| Setting       | Recommended value                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| AMI           | Ubuntu Server 24.04 LTS (64-bit x86)                                                                                                 |
| Instance type | `t3.large` (2 vCPU / 8 GB) — browsers are memory-hungry. `t3.medium` (4 GB) works for single-browser smoke runs; add swap (step 2b). |
| Key pair      | Create/reuse one — you need it for SSH                                                                                               |
| Storage       | 30 GB gp3 (Jenkins + Docker images + reports)                                                                                        |

**Security group** (inbound rules):

| Port | Source                     | Purpose                       |
| ---- | -------------------------- | ----------------------------- |
| 22   | _your IP only_             | SSH                           |
| 8080 | your IP (+ GitHub, see §6) | Jenkins UI / webhook endpoint |

> Don't open 8080 to `0.0.0.0/0` long-term. For webhooks, either allow
> [GitHub's hook IP ranges](https://api.github.com/meta) or skip webhooks and
> use SCM polling (§6).

Then connect:

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

## 2. Install Java + Jenkins

```bash
sudo apt update && sudo apt -y upgrade

# Jenkins requires Java 21 (Java 17 support was dropped; supported: 21, 25)
sudo apt -y install openjdk-21-jre-headless git

# Jenkins LTS apt repository. NOTE: the signing key rotates every few years —
# if apt later reports NO_PUBKEY, look for a newer jenkins.io-20XX.key.
sudo mkdir -p /etc/apt/keyrings
sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc]" \
  "https://pkg.jenkins.io/debian-stable binary/" \
  | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update && sudo apt -y install jenkins
sudo systemctl enable --now jenkins
```

### 2b. (t3.medium only) add swap

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 3. Install Docker and grant Jenkins access

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# sanity check: Jenkins can talk to Docker
sudo -u jenkins docker ps
```

Pre-pull the Playwright image so the first build doesn't spend minutes
downloading it (the tag must match `@playwright/test` in `package-lock.json`):

```bash
sudo -u jenkins docker pull mcr.microsoft.com/playwright:v1.61.1-noble
```

## 4. First-time Jenkins setup

1. Open `http://<EC2_PUBLIC_IP>:8080`.
2. Unlock with:
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
3. Choose **Install suggested plugins** (includes Git, JUnit, Pipeline).
4. Create the admin user.
5. Install the extra plugins the pipeline needs
   (Manage Jenkins → Plugins → Available):
   - **Docker Pipeline** (`docker-workflow`)
   - **Allure** (`allure-jenkins-plugin`)
   - **HTML Publisher** (`htmlpublisher`)
6. Configure the Allure commandline tool
   (Manage Jenkins → Tools → **Allure Commandline** → Add):
   - Name: `allure`
   - ✅ Install automatically → From Maven Central → latest 2.x

## 5. Create the pipeline job

1. **New Item** → name it (e.g. `tutorialsninja-playwright`) → **Pipeline**.
2. Under **Pipeline**:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**, Repository URL: your repo's HTTPS/SSH URL
     (add credentials if the repo is private)
   - Branch: `*/master`
   - Script Path: `Jenkinsfile`
3. Save, then **Build Now**.

The first run also asks for parameters on subsequent builds
(**Build with Parameters**): `BROWSER` (`all`/`chromium`/`firefox`/`webkit`)
and `SUITE` (`all`/`smoke`/`regression`).

After a build you get, on the job page:

- **Test Result** — JUnit trend from `reports/junit/results.xml`
- **Playwright HTML Report** — via the HTML Publisher link
- **Allure Report** — via the Allure plugin (history/trends accumulate per build)
- **Artifacts** — failure screenshots/videos/traces from `reports/test-artifacts`

### Playwright HTML report renders blank?

Jenkins' default Content-Security-Policy strips the report's inline scripts.
Either download the report from build artifacts, or relax CSP for report
pages by adding a system property (Manage Jenkins → Script Console to test,
then persist it via `sudo systemctl edit jenkins`):

```ini
[Service]
Environment="JAVA_OPTS=-Djava.awt.headless=true -Dhudson.model.DirectoryBrowserSupport.CSP=sandbox allow-scripts; default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"
```

then `sudo systemctl restart jenkins`. (This loosens CSP for _all_ archived
HTML — acceptable on a private CI box, do not do it on a shared/public one.)

## 6. Trigger builds automatically

**Option A — GitHub webhook** (instant, needs GitHub → EC2 reachability):

1. GitHub repo → Settings → Webhooks → Add webhook:
   - Payload URL: `http://<EC2_PUBLIC_IP>:8080/github-webhook/`
   - Content type: `application/json`, event: _Just the push event_
2. In the `Jenkinsfile`, uncomment the `triggers { githubPush() }` line
   (or tick **GitHub hook trigger for GITScm polling** in the job config).
3. Security group must allow GitHub's hook IPs on port 8080.

**Option B — SCM polling** (no inbound access needed):

In the `Jenkinsfile` replace the triggers comment with:

```groovy
triggers { pollSCM('H/10 * * * *') }
```

Jenkins then checks the repo every ~10 minutes and builds on new commits.

## 7. Cost & hardening notes

- A `t3.large` on-demand is ≈ $0.08/hr — **stop the instance** when idle, or
  schedule stop/start with an EventBridge rule. Jenkins state survives
  stop/start (but the public IP changes unless you attach an Elastic IP).
- Attach an **Elastic IP** if you use webhooks, so the payload URL is stable.
- Prefer `https` via a reverse proxy (nginx + Let's Encrypt) if the Jenkins UI
  must be reachable from anywhere; otherwise keep 8080 locked to your IP.
- Keep the AMI patched: `sudo apt update && sudo apt upgrade` periodically, or
  enable unattended-upgrades.

## Troubleshooting

| Symptom                                  | Fix                                                                                                                   |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `docker: permission denied` in build log | `sudo usermod -aG docker jenkins && sudo systemctl restart jenkins`                                                   |
| Browsers crash / `Target closed` mid-run | Instance too small — use `t3.large`+, keep `--ipc=host` (already in the Jenkinsfile), or run `BROWSER=chromium` only  |
| `Executable doesn't exist` for a browser | Image tag ≠ `@playwright/test` version. Update `PLAYWRIGHT_IMAGE` in the Jenkinsfile after every Playwright bump      |
| `npm ci` fails writing cache             | The Jenkinsfile sets `HOME`/`npm_config_cache` to the workspace — make sure those `environment` lines weren't removed |
| Allure step fails: tool not found        | Manage Jenkins → Tools → add Allure Commandline named `allure` with auto-install                                      |
