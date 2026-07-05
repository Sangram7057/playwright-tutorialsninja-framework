/**
 * Jenkins CI pipeline for the TutorialsNinja Playwright framework.
 *
 * Designed for a single Linux agent (e.g. an Amazon EC2 instance) with Docker
 * installed. Node, npm and browsers are NOT required on the host: every build
 * step runs inside the official Playwright container, which ships browser
 * binaries + OS dependencies matching the pinned @playwright/test version.
 *
 * Host prerequisites (full walkthrough: docs/jenkins-ec2-setup.md):
 *   - Docker Engine, with the `jenkins` user in the `docker` group
 *   - Jenkins plugins: Docker Pipeline, JUnit, HTML Publisher, Allure
 *   - Allure Commandline configured under Manage Jenkins → Tools (name: allure)
 */

// Must match the @playwright/test version in package-lock.json so the
// container's preinstalled browsers line up with the npm package.
// Each stage's docker agent uses `reuseNode true` so the host workspace is
// shared, letting the post section (JUnit/Allure/HTML publishing on the host)
// see the results. `--ipc=host` is Playwright's recommendation to stop
// Chromium OOM crashes inside containers.
def PLAYWRIGHT_IMAGE = 'mcr.microsoft.com/playwright:v1.61.1-noble'

pipeline {
  agent any

  parameters {
    choice(name: 'BROWSER', choices: ['all', 'chromium', 'firefox', 'webkit'],
           description: 'Browser project to run')
    choice(name: 'SUITE', choices: ['all', 'smoke', 'regression'],
           description: 'Tag-filtered suite (@smoke / @regression)')
  }

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 60, unit: 'MINUTES')
  }

  // Uncomment after wiring the GitHub webhook (see docs/jenkins-ec2-setup.md),
  // or use pollSCM('H/10 * * * *') if the instance is not reachable by GitHub.
  // triggers { githubPush() }

  environment {
    CI = 'true'
    // Framework config consumed by config/env.config.ts (no .env in CI).
    HEADLESS = 'true'
    ACTION_TIMEOUT = '30000'
    NAVIGATION_TIMEOUT = '45000'
    // The container runs as the jenkins UID, which has no writable $HOME
    // inside the image — point HOME and the npm cache at the workspace.
    HOME = "${WORKSPACE}"
    npm_config_cache = "${WORKSPACE}/.npm-cache"
  }

  stages {
    stage('Install') {
      agent {
        docker {
          image "${PLAYWRIGHT_IMAGE}"
          args '--ipc=host'
          reuseNode true
        }
      }
      steps {
        sh 'npm ci'
      }
    }

    stage('Quality gate') {
      agent {
        docker {
          image "${PLAYWRIGHT_IMAGE}"
          args '--ipc=host'
          reuseNode true
        }
      }
      steps {
        sh 'npm run typecheck'
        sh 'npm run lint'
        sh 'npm run format:check'
      }
    }

    stage('Test') {
      agent {
        docker {
          image "${PLAYWRIGHT_IMAGE}"
          args '--ipc=host'
          reuseNode true
        }
      }
      steps {
        script {
          def projectArg = params.BROWSER == 'all' ? '' : "--project=${params.BROWSER}"
          def grepArg = params.SUITE == 'all' ? '' : "--grep @${params.SUITE}"
          sh "npx playwright test ${projectArg} ${grepArg}".trim()
        }
      }
    }
  }

  // Publishing runs on the host node (agent any), where the Allure plugin's
  // commandline tool and Java are available.
  post {
    always {
      junit testResults: 'reports/junit/*.xml', allowEmptyResults: true

      publishHTML(target: [
        reportName: 'Playwright HTML Report',
        reportDir: 'reports/html-report',
        reportFiles: 'index.html',
        keepAll: true,
        alwaysLinkToLastBuild: true,
        allowMissing: true,
      ])

      allure(results: [[path: 'reports/allure-results']])

      archiveArtifacts artifacts: 'reports/test-artifacts/**, reports/junit/**',
                       allowEmptyArchive: true,
                       fingerprint: false
    }
  }
}
